import { supabaseAdmin } from '../supabase/admin';

export interface Agent {
  id: string;
  org_id: string;
  name: string;
  system_prompt: string | null;
  business_context: string | null;
  llm_provider: string;
  llm_model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function listAgents(orgId: string): Promise<Agent[]> {
  const { data, error } = await supabaseAdmin
    .from('agents')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Agent[];
}

export async function getAgent(agentId: string, orgId: string): Promise<Agent> {
  const { data, error } = await supabaseAdmin
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .eq('org_id', orgId)
    .single();

  if (error) throw error;
  return data as Agent;
}

export async function createAgent(orgId: string, input: Omit<Agent, 'id' | 'org_id' | 'created_at' | 'updated_at'>): Promise<Agent> {
  const { data, error } = await supabaseAdmin
    .from('agents')
    .insert({ ...input, org_id: orgId })
    .select()
    .single();

  if (error) throw error;
  return data as Agent;
}

export async function updateAgent(agentId: string, orgId: string, updates: Partial<Agent>): Promise<Agent> {
  const { data, error } = await supabaseAdmin
    .from('agents')
    .update(updates)
    .eq('id', agentId)
    .eq('org_id', orgId)
    .select()
    .single();

  if (error) throw error;
  return data as Agent;
}

export async function deleteAgent(agentId: string, orgId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from('agents')
    .delete()
    .eq('id', agentId)
    .eq('org_id', orgId);

  if (error) throw error;
}
