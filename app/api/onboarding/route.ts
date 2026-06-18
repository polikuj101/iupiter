/**
 * POST /api/onboarding — save wizard data and mark onboarding as complete
 * Body: { agentName, businessDescription, niche }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getOrgByClerkId } from '@/lib/db/organizations';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const org = await getOrgByClerkId(userId);
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

  const { agentName, businessDescription, niche } = await req.json() as {
    agentName?: string;
    businessDescription?: string;
    niche?: string;
  };

  // Update the default agent (the one auto-created with the org)
  const { data: agents } = await supabaseAdmin
    .from('agents')
    .select('id')
    .eq('org_id', org.id)
    .order('created_at', { ascending: true })
    .limit(1);

  const agentId = agents?.[0]?.id;

  if (agentId) {
    await supabaseAdmin
      .from('agents')
      .update({
        name:             agentName?.trim() || 'My Agent',
        business_context: businessDescription?.trim() || null,
      })
      .eq('id', agentId);
  }

  // Mark onboarding complete
  await supabaseAdmin
    .from('organizations')
    .update({ onboarding_completed: true } as Record<string, unknown>)
    .eq('id', org.id);

  return NextResponse.json({ success: true, agentId });
}
