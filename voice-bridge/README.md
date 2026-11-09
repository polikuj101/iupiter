# iupiter-voice-bridge

Bridges an inbound Twilio phone call to Google's Gemini Live API
(`gemini-3.1-flash-live-preview`, with automatic fallback to
`gemini-2.5-flash-native-audio-preview-12-2025` on rate limit or model
deprecation) so a caller can have a real-time voice conversation with an
Iupiter AI real estate agent.

## How it fits together

```
Caller → Twilio (shared number) → Iupiter app: POST /api/twilio/incoming-webhook
      → TwiML: <Say>disclosure</Say> + <Connect><Stream url="wss://this-service/twilio-stream">
      → this service: WS connection per call
           ├─ GET  {IUPITER_APP_URL}/api/twilio/voice-session-config   (system prompt + tools + forward number)
           ├─ Gemini Live session (audio both ways)
           ├─ POST {IUPITER_APP_URL}/api/twilio/book-appointment       (on book_appointment tool call)
           └─ Twilio REST calls(callSid).update(...)                  (on transfer_to_agent tool call — warm transfer)
```

All Supabase/Google Calendar OAuth credentials live in the main Iupiter
repo, never here — this service only ever sees the rendered system prompt
and tool schemas over its own authenticated (`BRIDGE_SHARED_SECRET`) calls
back to that app.

## Local development

```
cp .env.example .env   # fill in real values
npm install
npm run dev             # tsx watch, serves on :8080
```

`GET /health` returns `200 ok` once the process is up. Twilio Media Streams
connect to `wss://<host>/twilio-stream`.

## Deploy

Dockerfile included — works on Fly.io or Railway. Point the deployed
`wss://...` URL at `VOICE_BRIDGE_WS_URL` in the main Iupiter app's env vars.

## Deliberately out of scope (MVP)

Per-agent phone numbers, persisted call transcripts, session state beyond a
single in-memory call, reconnect/retry resilience on WS drop, rate limiting,
DTMF/IVR menus. See the main repo's `TODOS.md` for the tracked follow-ups.
