/**
 * Public webhook — Twilio calls this when the browser dialer (Voice SDK)
 * places an outbound call. Returns TwiML that dials the target number,
 * bridging the browser caller to the real-world phone number.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const to = form.get('To');
  const callerId = process.env.TWILIO_PHONE_NUMBER;

  if (!to || typeof to !== 'string' || !/^\+?[0-9]{7,15}$/.test(to)) {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response><Say>Invalid number.</Say></Response>`;
    return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial callerId="${callerId}">${to}</Dial>
</Response>`;

  return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
}
