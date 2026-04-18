import { supabaseAdmin } from '../supabase/admin';
import type { Platform, LeadStatus } from '../supabase/types';

export interface Contact {
  id: string;
  org_id: string;
  platform: Platform;
  platform_id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  lead_status: LeadStatus;
  metadata: Record<string, unknown>;
  first_seen_at: string;
  last_seen_at: string;
}

export async function upsertContact(params: {
  orgId: string;
  platform: Platform;
  platformId: string;
  name?: string;
}): Promise<Contact> {
  const { orgId, platform, platformId, name } = params;

  const { data, error } = await supabaseAdmin
    .from('contacts')
    .upsert(
      {
        org_id: orgId,
        platform,
        platform_id: platformId,
        name: name ?? null,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'org_id,platform,platform_id', ignoreDuplicates: false }
    )
    .select()
    .single();

  if (error) throw error;
  return data as Contact;
}

export async function listContacts(orgId: string, options?: {
  status?: LeadStatus;
  limit?: number;
  offset?: number;
}): Promise<{ data: Contact[]; count: number | null }> {
  let query = supabaseAdmin
    .from('contacts')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId)
    .order('last_seen_at', { ascending: false });

  if (options?.status) query = query.eq('lead_status', options.status);

  const limit  = options?.limit  ?? 100;
  const offset = options?.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as Contact[], count };
}

export async function updateContactStatus(
  contactId: string,
  orgId: string,
  status: LeadStatus
): Promise<Contact> {
  const { data, error } = await supabaseAdmin
    .from('contacts')
    .update({ lead_status: status })
    .eq('id', contactId)
    .eq('org_id', orgId)
    .select()
    .single();

  if (error) throw error;
  return data as Contact;
}
