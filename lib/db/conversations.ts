import { supabaseAdmin } from '../supabase/admin';
import type { Platform } from '../supabase/types';

export interface Conversation {
  id: string;
  org_id: string;
  agent_id: string | null;
  contact_id: string;
  channel_id: string | null;
  platform: Platform;
  status: 'active' | 'closed' | 'handed_off';
  started_at: string;
  last_message_at: string;
}

export async function getOrCreateConversation(params: {
  orgId: string;
  agentId: string;
  contactId: string;
  channelId: string | null;
  platform: Platform;
}): Promise<Conversation> {
  const { orgId, agentId, contactId, channelId, platform } = params;

  const { data: existing } = await supabaseAdmin
    .from('conversations')
    .select('*')
    .eq('org_id', orgId)
    .eq('contact_id', contactId)
    .eq('status', 'active')
    .order('last_message_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    await supabaseAdmin
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', (existing as Conversation).id);
    return existing as Conversation;
  }

  const { data, error } = await supabaseAdmin
    .from('conversations')
    .insert({ org_id: orgId, agent_id: agentId, contact_id: contactId, channel_id: channelId, platform })
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}

export async function listConversations(orgId: string, options?: {
  limit?: number;
  offset?: number;
  status?: string;
}): Promise<{ data: (Conversation & { contacts: unknown; agents: unknown })[]; count: number | null }> {
  let query = supabaseAdmin
    .from('conversations')
    .select('*, contacts(id, name, platform_id, lead_status), agents(id, name)', { count: 'exact' })
    .eq('org_id', orgId)
    .order('last_message_at', { ascending: false });

  if (options?.status) query = query.eq('status', options.status);

  const limit  = options?.limit  ?? 20;
  const offset = options?.offset ?? 0;
  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data ?? []) as (Conversation & { contacts: unknown; agents: unknown })[], count };
}

export async function getConversationWithMessages(conversationId: string, orgId: string) {
  const { data: conv, error: convErr } = await supabaseAdmin
    .from('conversations')
    .select('*, contacts(*), agents(*)')
    .eq('id', conversationId)
    .eq('org_id', orgId)
    .single();

  if (convErr) throw convErr;

  const { data: msgs, error: msgsErr } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (msgsErr) throw msgsErr;
  return { conversation: conv, messages: msgs };
}
