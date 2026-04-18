import { supabaseAdmin } from '../supabase/admin';

export interface Message {
  id: string;
  conversation_id: string;
  org_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  platform_message_id: string | null;
  token_count_in: number;
  token_count_out: number;
  response_time_ms: number | null;
  created_at: string;
}

export async function insertMessage(params: {
  conversationId: string;
  orgId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  platformMessageId?: string;
  responseTimeMs?: number;
  tokenCountIn?: number;
  tokenCountOut?: number;
}): Promise<Message> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id:     params.conversationId,
      org_id:              params.orgId,
      role:                params.role,
      content:             params.content,
      platform_message_id: params.platformMessageId ?? null,
      response_time_ms:    params.responseTimeMs    ?? null,
      token_count_in:      params.tokenCountIn      ?? 0,
      token_count_out:     params.tokenCountOut     ?? 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export async function getConversationHistory(
  conversationId: string
): Promise<{ role: 'user' | 'assistant'; content: string }[]> {
  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('role, content')
    .eq('conversation_id', conversationId)
    .in('role', ['user', 'assistant'])
    .order('created_at', { ascending: true })
    .limit(40);

  if (error) throw error;
  return (data ?? []) as { role: 'user' | 'assistant'; content: string }[];
}

export async function isDuplicateMessage(platformMessageId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from('messages')
    .select('id')
    .eq('platform_message_id', platformMessageId)
    .limit(1)
    .single();

  return !!data;
}

export async function getAnalyticsOverview(orgId: string): Promise<{
  totalMessages: number;
  totalConversations: number;
  totalContacts: number;
  avgResponseTimeMs: number;
}> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [msgCount, convCount, contactCount, avgRt] = await Promise.all([
    supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .eq('role', 'user')
      .gte('created_at', thirtyDaysAgo),

    supabaseAdmin
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId)
      .gte('started_at', thirtyDaysAgo),

    supabaseAdmin
      .from('contacts')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId),

    supabaseAdmin.rpc('get_avg_response_time', { p_org_id: orgId }),
  ]);

  return {
    totalMessages:      msgCount.count      ?? 0,
    totalConversations: convCount.count     ?? 0,
    totalContacts:      contactCount.count  ?? 0,
    avgResponseTimeMs:  (avgRt.data as number) ?? 0,
  };
}
