import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { listChannels, upsertChannel } from '@/lib/db/channels';

type Params = { params: Promise<{ agentId: string }> };

// GET — list channels for this agent
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const org = await getOrgByClerkId(userId);
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const { agentId } = await params;
    const channels = await listChannels(org.id);
    const agentChannels = channels.filter(c => c.agent_id === agentId);

    return NextResponse.json(agentChannels);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST — upsert a channel (WhatsApp, Instagram, Messenger)
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const org = await getOrgByClerkId(userId);
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const { agentId } = await params;
    const body = await req.json() as {
      platform: 'whatsapp' | 'instagram' | 'messenger';
      config: Record<string, string>;
    };

    const channel = await upsertChannel(org.id, agentId, body.platform, body.config);
    return NextResponse.json(channel);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE — remove a channel
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const org = await getOrgByClerkId(userId);
    if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

    const { agentId } = await params;
    const { platform } = await req.json() as { platform: string };

    const { supabaseAdmin } = await import('@/lib/supabase/admin');
    await supabaseAdmin
      .from('channels')
      .delete()
      .eq('org_id', org.id)
      .eq('agent_id', agentId)
      .eq('platform', platform);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
