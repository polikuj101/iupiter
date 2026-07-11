/**
 * Public webhook — Twilio calls this when a caller dials the shared inbound
 * AI voice number. Plays a mandatory disclosure (recording + AI notice, via
 * native Twilio <Say> so it can't be skipped or garbled by the model), then
 * opens a Media Stream to the always-on voice bridge, which handles the live
 * Gemini Live conversation for the rest of the call.
 *
 * This route is public (no Clerk session), so it validates Twilio's request
 * signature instead — otherwise anyone could POST here and read back the
 * bridge's WebSocket URL from the response. The returned TwiML also embeds
 * BRIDGE_SHARED_SECRET as a <Stream><Parameter>, which the bridge checks in
 * the `start` event before opening a real (billed) Gemini session — defense
 * in depth in case the WS URL leaks some other way.
 */

import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

function unavailableTwiml() {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Say>Sorry, our AI assistant isn't available right now. Please try again later.</Say></Response>`;
  return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
}

export async function POST(req: NextRequest) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const bridgeUrl = process.env.VOICE_BRIDGE_WS_URL;
  const sharedSecret = process.env.BRIDGE_SHARED_SECRET;

  if (!authToken || !bridgeUrl || !sharedSecret) {
    return unavailableTwiml();
  }

  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of form.entries()) params[key] = String(value);

  const signature = req.headers.get('x-twilio-signature');
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://iupiter.vercel.app';
  const fullUrl = `${appUrl}/api/twilio/incoming-webhook`;

  const validSignature = !!signature && twilio.validateRequest(authToken, signature, fullUrl, params);
  if (!validSignature) {
    return NextResponse.json({ error: 'Invalid Twilio signature' }, { status: 403 });
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>This call may be recorded, and you're speaking with an AI assistant. One moment while I connect you.</Say>
  <Connect>
    <Stream url="${bridgeUrl}">
      <Parameter name="token" value="${sharedSecret}" />
    </Stream>
  </Connect>
</Response>`;

  return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
}
