import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { getAgent } from '@/lib/db/agents';
import { generateReply } from '@/lib/llm';

type Params = { params: Promise<{ agentId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const org = await getOrgByClerkId(userId);
    if (!org) return NextResponse.json({ error: 'Organisation not found — make sure the database migration has been run.' }, { status: 404 });

    const { agentId } = await params;
    const agent = await getAgent(agentId, org.id);
    if (!agent) return NextResponse.json({ error: 'Agent not found.' }, { status: 404 });

    const body = await req.json() as {
      history: { role: 'user' | 'assistant'; content: string }[];
    };

    const history = body.history ?? [];

    const result = await generateReply(history, {
      systemPrompt:    agent.system_prompt    ?? undefined,
      businessContext: agent.business_context ?? undefined,
      model:           agent.llm_model        ?? 'gemini-3.1-flash-lite',
      temperature:     agent.temperature      ?? 0.7,
      maxTokens:       agent.max_tokens       ?? 300,
    });

    if (!result?.text) {
      return NextResponse.json({ error: 'AI returned an empty response. Check your GOOGLE_API_KEY.' }, { status: 500 });
    }

    return NextResponse.json({ reply: result.text });

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[/api/agents/test] error:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
