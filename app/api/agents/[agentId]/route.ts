import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { getAgent, updateAgent, deleteAgent } from '@/lib/db/agents';

type Params = { params: Promise<{ agentId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const org = await getOrgByClerkId(userId);
  if (!org) return NextResponse.json({ error: 'No org' }, { status: 404 });

  const { agentId } = await params;
  const agent = await getAgent(agentId, org.id);
  return NextResponse.json(agent);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const org = await getOrgByClerkId(userId);
  if (!org) return NextResponse.json({ error: 'No org' }, { status: 404 });

  const { agentId } = await params;
  const body = await req.json();
  const agent = await updateAgent(agentId, org.id, body);
  return NextResponse.json(agent);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const org = await getOrgByClerkId(userId);
  if (!org) return NextResponse.json({ error: 'No org' }, { status: 404 });

  const { agentId } = await params;
  await deleteAgent(agentId, org.id);
  return NextResponse.json({ success: true });
}
