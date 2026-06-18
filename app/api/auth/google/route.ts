import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { getAuthUrl } from '@/lib/google-calendar';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const org = await getOrgByClerkId(userId);
  if (!org) return NextResponse.json({ error: 'Org not found' }, { status: 404 });

  const url = getAuthUrl(org.id);
  return NextResponse.redirect(url);
}
