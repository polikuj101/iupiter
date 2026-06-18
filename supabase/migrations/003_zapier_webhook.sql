-- Add Zapier webhook URL to agents
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS zapier_webhook_url TEXT;

-- Add notification email to organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS notification_email TEXT;
