import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { getAgent } from '@/lib/db/agents';
import { generateReply } from '@/lib/llm';

type Params = { params: Promise<{ agentId: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const org = await getOrgByClerkId(userId);
  if (!org) return NextResponse.json({ error: 'No org' }, { status: 404 });

  const { agentId } = await params;
  const agent = await getAgent(agentId, org.id);

  const { history } = await req.json() as {
    history: { role: 'user' | 'assistant'; content: string }[];
  };

  const result = await generateReply(history, {
    systemPrompt:    agent.system_prompt ?? undefined,
    businessContext: agent.business_context ?? undefined,
    model:           agent.llm_model,
    temperature:     agent.temperature,
    maxTokens:       agent.max_tokens,
  });

  return NextResponse.json({ reply: result.text });
}
