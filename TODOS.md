# Iupiter — Deferred Work

## Rate limiting on /api/widget/[agentId]
**Trigger:** Move to paid Gemini tier.
**What:** Add per-IP or per-agentId rate limiting (e.g., Upstash Redis + `@upstash/ratelimit`) on the widget POST route.
**Why:** Free-tier Gemini quota is shared across all agents — one runaway widget can exhaust it for everyone.
**Where:** `app/api/widget/[agentId]/route.ts` POST handler, before calling `generateReply`.

## Test coverage
**Trigger:** After first revenue.
**What:** Jest + ts-jest setup with unit tests for:
- E.164 phone normalization (when Twilio SMS is built)
- Widget history validation (role check, array check)
- Calendar timezone conversion in `bookAppointment`
- `sendLeadNotification` fire-and-forget isolation
**Where:** `__tests__/` directory, `jest.config.ts`.

## Private per-customer knowledge base (real RAG)
**Trigger:** First paying customer.
**What:** Real per-agent knowledge base — document upload (Supabase Storage), text extraction (PDF/CSV/website scrape), chunking, embeddings (Gemini `embedContent`), and retrieval scoped strictly by `agent_id`/`org_id` (pgvector similarity search), injected into `buildSystemPrompt()` at chat time.
**Why:** The demo (`app/api/demo/[niche]/route.ts`, `lib/demo-listings.ts`) uses a static, hardcoded set of sample listings shared by every visitor — that's fine for a public marketing demo but is NOT a real customer knowledge base. A real customer needs their own private listings/documents, never visible to other customers.
**Where:** New `lib/knowledge-base.ts`, new `app/api/knowledge-base/*` routes, migration adding a vector column to the existing (currently dormant) `knowledge_docs` table (`supabase/migrations/001_initial_schema.sql:97-109`), and a dashboard UI for uploads.
**Critical constraint:** retrieval MUST be scoped by `agent_id`/`org_id` — the highest-severity risk in this feature is cross-tenant data leakage.

## Twilio signature validation on /api/twilio/voice-webhook
**Trigger:** Before the outbound dialer handles real, non-test traffic again (see also: TWILIO_* env vars are currently empty in production — that's blocking the dialer today regardless).
**What:** Add the same `twilio.validateRequest()` check now used on `incoming-webhook` to `voice-webhook` too.
**Why:** Same gap, just lower severity there — `voice-webhook` only returns a `<Dial>` to whatever `To` number is posted, it doesn't leak a WS URL, but an unauthenticated caller could still trigger arbitrary outbound-looking TwiML.
**Where:** `app/api/twilio/voice-webhook/route.ts`.

## Migrations aren't applied automatically
**Trigger:** Next time a migration file is added (there's no CI/CD step or `postbuild` hook that runs them — this is the second time a migration existed in the repo but not in the live Supabase DB, first was `widget_config`, now `forward_phone`).
**What:** Wire `supabase db push` (or equivalent) into the deploy pipeline, or at minimum document "run this SQL in Supabase Studio" as a required manual step whenever `supabase/migrations/` gets a new file.
**Why:** Silent divergence between repo and live schema causes confusing runtime errors (`column X does not exist`) that look like application bugs.
**Where:** Deploy config / CI, or a README note until then.

## Tool-dispatch registry refactor
**Trigger:** When a 3rd Gemini function-calling tool is added (after `book_appointment` and `search_properties`).
**What:** Replace the `if (result.functionCall?.name === '...')` chain in `app/api/widget/[agentId]/route.ts` with a `Map<toolName, handler>` dispatch.
**Why:** At 2 tools the if/else chain is fine and explicit. At 3+ it becomes real duplication (DRY) — each block repeats the same shape (check name → call handler → build reply).
**Where:** `app/api/widget/[agentId]/route.ts`, POST handler.
**Context:** Decided in the real-estate-listings plan-eng-review (2026-06) — deliberately deferred at 2 tools per the project's "don't over-engineer for n=2" preference.
