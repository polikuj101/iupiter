import { supabaseAdmin } from '../supabase/admin';

export interface Org {
  id: string;
  clerk_user_id: string;
  name: string;
  slug: string | null;
  plan: string;
  created_at: string;
  updated_at: string;
}

export async function getOrCreateOrg(clerkUserId: string, name = 'My Organization'): Promise<Org> {
  const { data: existing } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (existing) return existing as Org;

  const { data: org, error } = await supabaseAdmin
    .from('organizations')
    .insert({ clerk_user_id: clerkUserId, name })
    .select()
    .single();

  if (error) throw error;

  // Auto-create default agent
  await supabaseAdmin.from('agents').insert({
    org_id: (org as Org).id,
    name: 'Default Agent',
    business_context: '',
  });

  return org as Org;
}

export async function getOrgByClerkId(clerkUserId: string): Promise<Org | null> {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single();

  if (error) return null;
  return data as Org;
}

export async function updateOrg(orgId: string, updates: { name?: string; plan?: string }): Promise<Org> {
  const { data, error } = await supabaseAdmin
    .from('organizations')
    .update(updates)
    .eq('id', orgId)
    .select()
    .single();

  if (error) throw error;
  return data as Org;
}
