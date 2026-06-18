-- Add Google Calendar OAuth tokens to organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS google_refresh_token  TEXT,
  ADD COLUMN IF NOT EXISTS google_access_token   TEXT,
  ADD COLUMN IF NOT EXISTS google_token_expiry   BIGINT,
  ADD COLUMN IF NOT EXISTS google_calendar_id    TEXT DEFAULT 'primary';
