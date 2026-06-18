-- Store the business timezone on agents so calendar bookings use the right local time
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'America/New_York';
