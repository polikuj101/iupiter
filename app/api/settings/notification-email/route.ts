import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getOrgByClerkId } from '@/lib/db/organizations';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const org = await getOrgByClerkId(userId);
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

  const { email } = await req.json();

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  await supabaseAdmin
    .from('organizations')
    .update({ notification_email: email || null })
    .eq('id', org.id);

  return NextResponse.json({ ok: true });
}
