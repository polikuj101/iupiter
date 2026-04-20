-- ============================================================
-- Iupiter MVP — Initial Schema
-- Run in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── Organizations (tenants) ──────────────────────────────────
CREATE TABLE organizations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id   TEXT NOT NULL UNIQUE,
  name            TEXT NOT NULL,
  slug            TEXT UNIQUE,
  plan            TEXT NOT NULL DEFAULT 'free',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Agents ───────────────────────────────────────────────────
CREATE TABLE agents (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name             TEXT NOT NULL DEFAULT 'Default Agent',
  system_prompt    TEXT,
  business_context TEXT,
  llm_provider     TEXT NOT NULL DEFAULT 'gemini',
  llm_model        TEXT NOT NULL DEFAULT 'gemini-2.0-flash',
  temperature      REAL NOT NULL DEFAULT 0.7,
  max_tokens       INTEGER NOT NULL DEFAULT 300,
  is_active        BOOLEAN NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Channels ─────────────────────────────────────────────────
CREATE TABLE channels (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id         UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  org_id           UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform         TEXT NOT NULL CHECK (platform IN ('whatsapp', 'instagram', 'messenger')),
  config           JSONB NOT NULL DEFAULT '{}',
  is_active        BOOLEAN NOT NULL DEFAULT true,
  webhook_verified BOOLEAN NOT NULL DEFAULT false,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, platform)
);

-- ─── Contacts ─────────────────────────────────────────────────
CREATE TABLE contacts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  platform      TEXT NOT NULL,
  platform_id   TEXT NOT NULL,
  name          TEXT,
  email         TEXT,
  phone         TEXT,
  lead_status   TEXT NOT NULL DEFAULT 'new'
                CHECK (lead_status IN ('new','contacted','qualified','converted','lost')),
  metadata      JSONB NOT NULL DEFAULT '{}',
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, platform, platform_id)
);

-- ─── Conversations ────────────────────────────────────────────
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id          UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agent_id        UUID REFERENCES agents(id) ON DELETE SET NULL,
  contact_id      UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  channel_id      UUID REFERENCES channels(id) ON DELETE SET NULL,
  platform        TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','closed','handed_off')),
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_conversations_org      ON conversations(org_id, last_message_at DESC);
CREATE INDEX idx_conversations_contact  ON conversations(contact_id);

-- ─── Messages ─────────────────────────────────────────────────
CREATE TABLE messages (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id     UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role                TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content             TEXT NOT NULL,
  platform_message_id TEXT,
  token_count_in      INTEGER NOT NULL DEFAULT 0,
  token_count_out     INTEGER NOT NULL DEFAULT 0,
  response_time_ms    INTEGER,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at);
CREATE INDEX idx_messages_org_created  ON messages(org_id, created_at);
CREATE UNIQUE INDEX idx_messages_platform_id ON messages(platform_message_id) WHERE platform_message_id IS NOT NULL;

-- ─── Knowledge docs ───────────────────────────────────────────
CREATE TABLE knowledge_docs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id       UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  file_name      TEXT NOT NULL,
  file_type      TEXT NOT NULL,
  file_size      INTEGER,
  storage_path   TEXT NOT NULL,
  extracted_text TEXT,
  status         TEXT NOT NULL DEFAULT 'processing'
                 CHECK (status IN ('processing','ready','error')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── CRM Integrations ─────────────────────────────────────────
CREATE TABLE crm_integrations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id         UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  provider       TEXT NOT NULL
                 CHECK (provider IN ('hubspot','salesforce','zoho','gohighlevel')),
  credentials    JSONB NOT NULL DEFAULT '{}',
  sync_config    JSONB NOT NULL DEFAULT '{}',
  is_active      BOOLEAN NOT NULL DEFAULT true,
  last_synced_at TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, provider)
);

-- ─── Analytics helper functions ───────────────────────────────

CREATE OR REPLACE FUNCTION get_messages_per_day(p_org_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(day DATE, count BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT DATE(created_at) AS day, COUNT(*) AS count
  FROM messages
  WHERE org_id = p_org_id
    AND role = 'user'
    AND created_at > now() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at);
$$;

CREATE OR REPLACE FUNCTION get_channel_breakdown(p_org_id UUID)
RETURNS TABLE(platform TEXT, count BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT cv.platform, COUNT(m.id)
  FROM messages m
  JOIN conversations cv ON m.conversation_id = cv.id
  WHERE m.org_id = p_org_id
    AND m.created_at > now() - INTERVAL '30 days'
    AND m.role = 'user'
  GROUP BY cv.platform;
$$;

CREATE OR REPLACE FUNCTION get_lead_funnel(p_org_id UUID)
RETURNS TABLE(status TEXT, count BIGINT)
LANGUAGE sql STABLE AS $$
  SELECT lead_status, COUNT(*)
  FROM contacts
  WHERE org_id = p_org_id
  GROUP BY lead_status
  ORDER BY CASE lead_status
    WHEN 'new'       THEN 1
    WHEN 'contacted' THEN 2
    WHEN 'qualified' THEN 3
    WHEN 'converted' THEN 4
    WHEN 'lost'      THEN 5
  END;
$$;

CREATE OR REPLACE FUNCTION get_avg_response_time(p_org_id UUID)
RETURNS REAL
LANGUAGE sql STABLE AS $$
  SELECT AVG(response_time_ms)::REAL
  FROM messages
  WHERE org_id = p_org_id
    AND role = 'assistant'
    AND response_time_ms IS NOT NULL
    AND created_at > now() - INTERVAL '30 days';
$$;

-- ─── Row Level Security ───────────────────────────────────────
ALTER TABLE organizations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages         ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_docs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_integrations ENABLE ROW LEVEL SECURITY;

-- Note: All RLS policies use service_role (bypasses RLS via admin client).
-- The app enforces tenant isolation in code via org_id scoping.
-- Add user-level RLS policies when adding Clerk JWT integration with Supabase.

-- ─── Auto-update updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_agents_updated_at
  BEFORE UPDATE ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
