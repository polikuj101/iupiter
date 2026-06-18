/**
 * Public Widget API — no authentication required
 * GET  /api/widget/[agentId]  → returns agent info (name, greeting)
 * POST /api/widget/[agentId]  → sends message, returns AI reply (with optional calendar booking)
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { generateReply } from '@/lib/llm';
import { bookAppointment, isCalendarConnected } from '@/lib/google-calendar';
import { sendLeadNotification, sendZapierWebhook } from '@/lib/email';
import { createFUBLead } from '@/lib/follow-up-boss';

type Params = { params: Promise<{ agentId: string }> };

// ─── GET — agent info for widget header ───────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  const { agentId } = await params;

  const { data: agent, error } = await supabaseAdmin
    .from('agents')
    .select('id, name, business_context, system_prompt, is_active, org_id, widget_config')
    .eq('id', agentId)
    .single();

  if (error || !agent) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  if (!agent.is_active) {
    return NextResponse.json({ error: 'Agent is paused' }, { status: 403 });
  }

  const calendarConnected = await isCalendarConnected(agent.org_id);
  const cfg = (agent.widget_config ?? {}) as Record<string, string>;

  return NextResponse.json({
    id:               agent.id,
    name:             agent.name,
    calendarConnected,
    greeting:         cfg.greetingText || `Hi! I'm ${agent.name}. How can I help you today?`,
    brandColor:       cfg.brandColor   || '#2563EB',
    avatarUrl:        cfg.avatarUrl    || null,
    widgetTitle:      cfg.widgetTitle  || agent.name,
  });
}

// ─── POST — chat message ──────────────────────────────────────────

export async function POST(req: NextRequest, { params }: Params) {
  const { agentId } = await params;

  try {
    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    if (error || !agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    if (!agent.is_active) {
      return NextResponse.json({ error: 'Agent is currently unavailable' }, { status: 403 });
    }

    const body = await req.json() as {
      history: { role: 'user' | 'assistant'; content: string }[];
    };

    const rawHistory = body.history;
    if (!Array.isArray(rawHistory)) {
      return NextResponse.json({ error: 'history must be an array' }, { status: 400 });
    }
    const validRoles = new Set(['user', 'assistant']);
    for (const msg of rawHistory) {
      if (!msg || typeof msg.role !== 'string' || !validRoles.has(msg.role) || typeof msg.content !== 'string') {
        return NextResponse.json({ error: 'Invalid message in history' }, { status: 400 });
      }
    }

    const calendarConnected = await isCalendarConnected(agent.org_id);

    // ── Fire notifications on first user message ───────────────────
    const history = rawHistory;
    const userMessages = history.filter((m) => m.role === 'user');
    if (userMessages.length === 1) {
      // This is the very first message — fire notifications async
      const firstMessage = userMessages[0].content;

      // Get org settings
      const { data: orgData } = await supabaseAdmin
        .from('organizations')
        .select('notification_email, fub_api_key')
        .eq('id', agent.org_id)
        .single();

      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://iupiter.vercel.app';

      // Email notification (non-blocking)
      if (orgData?.notification_email) {
        sendLeadNotification({
          toEmail:         orgData.notification_email,
          agentName:       agent.name,
          contactName:     'Website visitor',
          firstMessage,
          conversationUrl: `${appUrl}/dashboard/conversations`,
        }).catch(console.error);
      }

      // Zapier webhook (non-blocking)
      if (agent.zapier_webhook_url) {
        sendZapierWebhook(agent.zapier_webhook_url, {
          contactName:  'Website visitor',
          firstMessage,
          agentName:    agent.name,
          platform:     'widget',
          timestamp:    new Date().toISOString(),
        }).catch(console.error);
      }

      // Follow Up Boss — create lead (non-blocking)
      if (orgData?.fub_api_key) {
        createFUBLead({
          apiKey:  orgData.fub_api_key,
          source:  agent.name,
          note:    `First message via AI agent: "${firstMessage}"`,
          tags:    ['AI Lead', 'Iupiter'],
        }).catch(console.error);
      }
    }

    const result = await generateReply(history, {
      systemPrompt:      agent.system_prompt    ?? undefined,
      businessContext:   agent.business_context ?? undefined,
      model:             agent.llm_model        ?? 'gemini-2.5-flash',
      temperature:       agent.temperature      ?? 0.7,
      maxTokens:         agent.max_tokens       ?? 300,
      calendarConnected,
      orgId:             agent.org_id,
    });


    // ── Handle calendar booking function call ──────────────────────
    if (result.functionCall?.name === 'book_appointment') {
      const args = result.functionCall.args;

      const booking = await bookAppointment(agent.org_id, {
        customerName: args.customerName,
        date:         args.date,
        time:         args.time,
        service:      args.service,
        phone:        args.phone,
        durationMins: 60,
        timezone:     agent.timezone ?? 'America/New_York',
      });

      const reply = booking.success
        ? `Done! I've booked your ${args.service || 'appointment'} for ${args.date} at ${args.time}. You'll get a confirmation shortly. See you then! 🗓️`
        : `I'd love to book that for you! Could you give us a call to confirm? Our team will get you sorted right away.`;

      return NextResponse.json({ reply });
    }

    if (!result?.text) {
      return NextResponse.json({ error: 'AI returned empty response' }, { status: 500 });
    }

    return NextResponse.json({ reply: result.text });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[widget] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
