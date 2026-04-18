import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { getOrgByClerkId } from '@/lib/db/organizations';
import { updateContactStatus } from '@/lib/db/contacts';
import type { LeadStatus } from '@/lib/supabase/types';

type Params = { params: Promise<{ contactId: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const org = await getOrgByClerkId(userId);
  if (!org) return NextResponse.json({ error: 'No org' }, { status: 404 });

  const { contactId } = await params;
  const body = await req.json();

  const contact = await updateContactStatus(contactId, org.id, body.lead_status as LeadStatus);
  return NextResponse.json(contact);
}
