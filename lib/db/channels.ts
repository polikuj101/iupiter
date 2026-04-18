import { supabaseAdmin } from '../supabase/admin';
import type { Platform } from '../supabase/types';

export interface Channel {
  id: string;
  agent_id: string;
  org_id: string;
  platform: Platform;
  config: Record<string, string>;
  is_active: boolean;
  webhook_verified: boolean;
  created_at: string;
}

export interface ChannelWithRelations extends Channel {
  agents: Record<string, unknown> | null;
  organizations: Record<string, unknown> | null;
}

export async function listChannels(orgId: string): Promise<Channel[]> {
  const { data, error } = await supabaseAdmin
    .from('channels')
    .select('*, agents(name)')
    .eq('org_id', orgId);

  if (error) throw error;
  return (data ?? []) as Channel[];
}

export async function getChannelByPlatformId(
  platform: Platform,
  platformIdentifier: string
): Promise<ChannelWithRelations | null> {
  const field = platform === 'whatsapp' ? 'phone_number_id' : 'page_id';

  const { data, error } = await supabaseAdmin
    .from('channels')
    .select('*, agents(*), organizations(*)')
    .eq('platform', platform)
    .eq('is_active', true)
    .filter(`config->>${field}`, 'eq', platformIdentifier)
    .single();

  if (error) return null;
  return data as ChannelWithRelations;
}

export async function upsertChannel(
  orgId: string,
  agentId: string,
  platform: Platform,
  config: Record<string, string>
): Promise<Channel> {
  const { data, error } = await supabaseAdmin
    .from('channels')
    .upsert(
      { org_id: orgId, agent_id: agentId, platform, config },
      { onConflict: 'org_id,platform' }
    )
    .select()
    .single();

  if (error) throw error;
  return data as Channel;
}

export async function markChannelVerified(channelId: string): Promise<void> {
  await supabaseAdmin
    .from('channels')
    .update({ webhook_verified: true })
    .eq('id', channelId);
}
