/**
 * Public webhook — Twilio calls this when a caller dials the shared inbound
 * AI voice number. Plays a mandatory disclosure (recording + AI notice, via
 * native Twilio <Say> so it can't be skipped or garbled by the model), then
 * opens a Media Stream to the always-on voice bridge, which handles the live
 * Gemini Live conversation for the rest of the call.
 */

import { NextResponse } from 'next/server';

export async function POST() {
  const bridgeUrl = process.env.VOICE_BRIDGE_WS_URL;

  if (!bridgeUrl) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Say>Sorry, our AI assistant isn't available right now. Please try again later.</Say></Response>`;
    return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>This call may be recorded, and you're speaking with an AI assistant. One moment while I connect you.</Say>
  <Connect>
    <Stream url="${bridgeUrl}" />
  </Connect>
</Response>`;

  return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
}
