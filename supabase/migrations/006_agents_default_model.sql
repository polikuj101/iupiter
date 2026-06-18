-- Fix stale default model (gemini-2.0-flash quota is exhausted)
ALTER TABLE agents
  ALTER COLUMN llm_model SET DEFAULT 'gemini-2.5-flash';
