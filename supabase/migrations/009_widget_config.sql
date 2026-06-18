-- Widget customization: brand color, greeting text, avatar, title
ALTER TABLE agents
  ADD COLUMN IF NOT EXISTS widget_config JSONB NOT NULL DEFAULT '{}';
