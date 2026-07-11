/**
 * Service-to-service route — called once per call by the voice bridge (a
 * separate always-on process bridging Twilio Media Streams <-> Gemini Live)
 * to fetch the system prompt, tool declarations, and warm-transfer number
 * for the single shared inbound voice number. Authenticated via
 * BRIDGE_SHARED_SECRET, not Clerk — the bridge has no user session.
 *
 * All Supabase/agent-config access stays in this repo; the bridge only ever
 * sees the final, rendered systemInstruction + tool schemas, never raw DB
 * credentials.
 */

import { NextRequest, NextResponse } from 'next/server';
import { SchemaType, type FunctionDeclaration } from '@google/generative-ai';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { buildSystemPrompt, BOOK_APPOINTMENT_FUNCTION } from '@/lib/llm';
import { isCalendarConnected } from '@/lib/google-calendar';
import { requireBridgeAuth } from '@/lib/bridge-auth';

const TRANSFER_TO_AGENT_FUNCTION: FunctionDeclaration = {
  name: 'transfer_to_agent',
  description: 'Transfers the live call to the real estate agent\'s own phone number.',
  parameters: { type: SchemaType.OBJECT, properties: {} },
};

// buildSystemPrompt()'s FORMATTING_RULES describe splitting replies into chat
// "bubbles" — that's text-widget framing that would confuse a spoken call.
// This overrides it for voice without touching the shared function.
const VOICE_ADDON = `

You are on a live PHONE CALL, not a text chat — speak naturally out loud.
Do NOT split your answer into paragraphs or "bubbles"; give one continuous
spoken reply. Keep it brief and conversational, like a real phone call.
If the caller explicitly asks to speak to a real person, or asks something
you genuinely cannot help with, use the transfer_to_agent function to
connect them — tell them you're connecting them before you do.`;

export async function GET(req: NextRequest) {
  const authError = requireBridgeAuth(req);
  if (authError) return authError;

  const agentId = process.env.DEFAULT_VOICE_AGENT_ID;
  if (!agentId) {
    return NextResponse.json({ error: 'DEFAULT_VOICE_AGENT_ID not configured' }, { status: 500 });
  }

  const { data: agent, error } = await supabaseAdmin
    .from('agents')
    .select('system_prompt, business_context, org_id, is_active, forward_phone')
    .eq('id', agentId)
    .single();

  if (error || !agent) {
    return NextResponse.json({ error: 'Voice agent not found' }, { status: 404 });
  }
  if (!agent.is_active) {
    return NextResponse.json({ error: 'Voice agent is paused' }, { status: 403 });
  }

  const calendarConnected = await isCalendarConnected(agent.org_id);

  const systemInstruction = buildSystemPrompt({
    systemPrompt:    agent.system_prompt    ?? undefined,
    businessContext: agent.business_context ?? undefined,
    calendarConnected,
  }) + VOICE_ADDON;

  const tools: FunctionDeclaration[] = [TRANSFER_TO_AGENT_FUNCTION];
  if (calendarConnected) tools.push(BOOK_APPOINTMENT_FUNCTION);

  return NextResponse.json({
    systemInstruction,
    forwardPhone: agent.forward_phone ?? null,
    tools,
  });
}
