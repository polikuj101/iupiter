import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { listAgents, createAgent } from '@/lib/db/agents';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const org = await getOrgByClerkId(userId);
  if (!org) return NextResponse.json({ error: 'No org' }, { status: 404 });

  const agents = await listAgents(org.id);
  return NextResponse.json(agents);
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const org = await getOrgByClerkId(userId);
  if (!org) return NextResponse.json({ error: 'No org' }, { status: 404 });

  const body = await req.json();
  const agent = await createAgent(org.id, {
    name:             body.name ?? 'New Agent',
    business_context: body.business_context ?? null,
    system_prompt:    body.system_prompt ?? null,
    llm_model:        body.llm_model ?? 'gemini-2.0-flash',
    temperature:      body.temperature ?? 0.7,
    max_tokens:       body.max_tokens ?? 300,
    is_active:        true,
    llm_provider:     'gemini',
  });

  return NextResponse.json(agent, { status: 201 });
}
