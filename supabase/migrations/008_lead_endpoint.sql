-- Support /api/lead endpoint: source tracking + onboarding wizard
ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS source TEXT;

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false;
