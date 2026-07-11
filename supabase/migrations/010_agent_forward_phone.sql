-- Human phone number to warm-transfer an inbound AI voice call to, when the
-- AI can't handle something on a live call.
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS forward_phone TEXT;
