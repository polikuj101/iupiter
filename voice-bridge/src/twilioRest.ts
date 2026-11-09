import twilio from 'twilio';

let client: ReturnType<typeof twilio> | null = null;

function getClient() {
  if (!client) {
    const sid = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    if (!sid || !token) throw new Error('TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN not configured');
    client = twilio(sid, token);
  }
  return client;
}

// Same validation the main app's voice-webhook/route.ts applies before
// interpolating a number into <Dial> — forward_phone comes from a plain
// unconstrained DB column, so it must be checked here too before it's
// spliced into TwiML XML.
const E164_ISH = /^\+?[0-9]{7,15}$/;

/**
 * Warm-transfers an in-progress call to a real phone number. The call is
 * already answered and streaming into this bridge; re-evaluating it with new
 * TwiML naturally ends the <Stream> (closing our WebSocket — expected, the
 * caller has been handed off) and dials the human agent, bridging the
 * original caller directly to them. Same <Dial callerId=...> pattern already
 * used by the outbound browser dialer in the main app.
 */
export async function transferCall(callSid: string, toNumber: string): Promise<void> {
  const callerId = process.env.TWILIO_PHONE_NUMBER;
  if (!callerId) throw new Error('TWILIO_PHONE_NUMBER not configured');
  if (!E164_ISH.test(toNumber)) throw new Error(`Invalid forward phone number: ${toNumber}`);

  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Dial callerId="${callerId}">${toNumber}</Dial></Response>`;
  await getClient().calls(callSid).update({ twiml });
}
