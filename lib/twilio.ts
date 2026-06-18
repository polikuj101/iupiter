import twilio from 'twilio';

let _client: ReturnType<typeof twilio> | null = null;

function getClient() {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  if (!_client) _client = twilio(sid, token);
  return _client;
}

export function normalizeE164(phone: string, defaultCountry = '+1'): string {
  // Strip all non-digit characters except leading +
  const stripped = phone.trim();
  if (stripped.startsWith('+')) {
    return '+' + stripped.slice(1).replace(/\D/g, '');
  }
  // If starts with country code digits (e.g. "1" for US), prepend +
  const digits = stripped.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return '+' + digits;
  }
  // Assume default country prefix (US 10-digit numbers)
  if (digits.length === 10) {
    return defaultCountry + digits;
  }
  // Return as-is with + prefix for non-US numbers
  return '+' + digits;
}

export async function sendSms(params: {
  to:   string;
  body: string;
}): Promise<{ success: boolean; sid?: string; error?: string }> {
  const client = getClient();
  const from   = process.env.TWILIO_PHONE_NUMBER;

  if (!client || !from) {
    console.warn('[twilio] not configured — skipping SMS');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const msg = await client.messages.create({ to: params.to, from, body: params.body });
    return { success: true, sid: msg.sid };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    console.error('[twilio] SMS failed:', error);
    return { success: false, error };
  }
}
