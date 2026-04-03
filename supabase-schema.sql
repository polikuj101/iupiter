-- ============================================================
-- AI Agent Constructor — MVP Dashboard Schema (Auth0 edition)
-- Run this in Supabase: Dashboard → SQL Editor → New query
--
-- Auth is handled by Auth0. user_id stores the Auth0 "sub"
-- (e.g. "auth0|abc123"). Tables are queried server-side using
-- the service role key, so no RLS is required.
-- ============================================================

-- 1. Client Settings
CREATE TABLE IF NOT EXISTS client_settings (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              TEXT        NOT NULL UNIQUE,   -- Auth0 sub
  agent_name           TEXT        NOT NULL DEFAULT 'My AI Assistant',
  tone                 TEXT        NOT NULL DEFAULT 'friendly'
                                   CHECK (tone IN ('formal', 'friendly', 'adaptive')),
  business_description TEXT        NOT NULL DEFAULT '',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Listings
CREATE TABLE IF NOT EXISTS listings (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    TEXT        NOT NULL,                    -- Auth0 sub
  address    TEXT        NOT NULL,
  price      TEXT        NOT NULL DEFAULT '',
  details    TEXT        NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings (user_id);

-- 3. Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      TEXT        NOT NULL,                  -- Auth0 sub
  dm_text      TEXT        NOT NULL,
  ai_response  TEXT        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS conversations_user_id_idx ON conversations (user_id);


-- ============================================================
-- After running this schema, add these env vars:
--
-- Auth0 (required):
--   AUTH0_DOMAIN          = your-tenant.us.auth0.com
--   AUTH0_CLIENT_ID       = ...
--   AUTH0_CLIENT_SECRET   = ...
--   AUTH0_SECRET          = <32-byte random hex: openssl rand -hex 32>
--   APP_BASE_URL          = http://localhost:3001  (or your production URL)
--
-- Supabase (required):
--   NEXT_PUBLIC_SUPABASE_URL      = https://xxxx.supabase.co
--   SUPABASE_SERVICE_ROLE_KEY     = eyJhbGc...  (Settings → API → service_role)
--
-- Anthropic (required for DM handler):
--   ANTHROPIC_API_KEY     = sk-ant-...
--
-- Auth0 Application settings (Auth0 Dashboard):
--   Allowed Callback URLs:  http://localhost:3001/auth/callback
--   Allowed Logout URLs:    http://localhost:3001
--   Allowed Web Origins:    http://localhost:3001
-- ============================================================
