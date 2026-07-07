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

## Tool-dispatch registry refactor
**Trigger:** When a 3rd Gemini function-calling tool is added (after `book_appointment` and `search_properties`).
**What:** Replace the `if (result.functionCall?.name === '...')` chain in `app/api/widget/[agentId]/route.ts` with a `Map<toolName, handler>` dispatch.
**Why:** At 2 tools the if/else chain is fine and explicit. At 3+ it becomes real duplication (DRY) — each block repeats the same shape (check name → call handler → build reply).
**Where:** `app/api/widget/[agentId]/route.ts`, POST handler.
**Context:** Decided in the real-estate-listings plan-eng-review (2026-06) — deliberately deferred at 2 tools per the project's "don't over-engineer for n=2" preference.
