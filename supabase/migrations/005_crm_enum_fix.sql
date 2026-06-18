-- Add 'follow_up_boss' to the crm_integrations provider check constraint
-- The existing constraint is unnamed (auto-named by Postgres as crm_integrations_provider_check)

ALTER TABLE crm_integrations
  DROP CONSTRAINT IF EXISTS crm_integrations_provider_check;

ALTER TABLE crm_integrations
  ADD CONSTRAINT crm_integrations_provider_check
  CHECK (provider IN ('hubspot', 'salesforce', 'zoho', 'gohighlevel', 'follow_up_boss'));
