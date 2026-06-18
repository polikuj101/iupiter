-- Follow Up Boss CRM integration
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS fub_api_key TEXT;
