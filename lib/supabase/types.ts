/**
 * Type definitions for the Supabase database.
 * Mirrors the schema in supabase/migrations/001_initial_schema.sql
 */

export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type Platform   = 'whatsapp' | 'instagram' | 'messenger';
export type ConversationStatus = 'active' | 'closed' | 'handed_off';
export type MessageRole = 'user' | 'assistant' | 'system';
export type DocStatus   = 'processing' | 'ready' | 'error';
export type CRMProvider = 'hubspot' | 'salesforce' | 'zoho' | 'gohighlevel';

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          clerk_user_id: string;
          name: string;
          slug: string | null;
          plan: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['organizations']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['organizations']['Insert']>;
      };
      agents: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['agents']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['agents']['Insert']>;
      };
      channels: {
        Row: {
          id: string;
          agent_id: string;
          org_id: string;
          platform: Platform;
          config: Record<string, string>;
          is_active: boolean;
          webhook_verified: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['channels']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['channels']['Insert']>;
      };
      contacts: {
        Row: {
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
        };
        Insert: Omit<Database['public']['Tables']['contacts']['Row'], 'id' | 'first_seen_at' | 'last_seen_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['contacts']['Insert']>;
      };
      conversations: {
        Row: {
          id: string;
          org_id: string;
          agent_id: string | null;
          contact_id: string;
          channel_id: string | null;
          platform: Platform;
          status: ConversationStatus;
          started_at: string;
          last_message_at: string;
        };
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'started_at' | 'last_message_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          org_id: string;
          role: MessageRole;
          content: string;
          platform_message_id: string | null;
          token_count_in: number;
          token_count_out: number;
          response_time_ms: number | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
      };
      knowledge_docs: {
        Row: {
          id: string;
          agent_id: string;
          org_id: string;
          file_name: string;
          file_type: string;
          file_size: number | null;
          storage_path: string;
          extracted_text: string | null;
          status: DocStatus;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['knowledge_docs']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['knowledge_docs']['Insert']>;
      };
      crm_integrations: {
        Row: {
          id: string;
          org_id: string;
          provider: CRMProvider;
          credentials: Record<string, string>;
          sync_config: Record<string, unknown>;
          is_active: boolean;
          last_synced_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['crm_integrations']['Row'], 'id' | 'created_at'> & { id?: string };
        Update: Partial<Database['public']['Tables']['crm_integrations']['Insert']>;
      };
    };
    Functions: {
      get_messages_per_day: {
        Args: { p_org_id: string; p_days?: number };
        Returns: { day: string; count: number }[];
      };
      get_channel_breakdown: {
        Args: { p_org_id: string };
        Returns: { platform: string; count: number }[];
      };
      get_lead_funnel: {
        Args: { p_org_id: string };
        Returns: { status: string; count: number }[];
      };
      get_avg_response_time: {
        Args: { p_org_id: string };
        Returns: number;
      };
    };
  };
}
