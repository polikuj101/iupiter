import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { verifyFUBKey } from '@/lib/follow-up-boss';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const org = await getOrgByClerkId(userId);
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

  const { apiKey } = await req.json() as { apiKey: string };

  // Verify key is valid before saving
  if (apiKey) {
    const valid = await verifyFUBKey(apiKey);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid API key — please check and try again.' }, { status: 400 });
    }
  }

  await supabaseAdmin
    .from('organizations')
    .update({ fub_api_key: apiKey || null })
    .eq('id', org.id);

  return NextResponse.json({ ok: true });
}
