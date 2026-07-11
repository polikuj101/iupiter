/**
 * Regression test for the inbound voice webhook's Twilio signature check.
 *
 * This route is public (no Clerk session — Twilio can't have one), which
 * means anyone could otherwise POST here and read the voice bridge's
 * WebSocket URL back out of the TwiML response, then connect to it directly
 * to open a real, billed Gemini Live session without ever placing an actual
 * phone call. Twilio's request signature (HMAC-SHA1 of the URL + sorted
 * params, keyed by the account's auth token) is the only thing that proves
 * a request genuinely came from Twilio.
 */

import crypto from 'node:crypto';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/twilio/incoming-webhook/route';

const AUTH_TOKEN = 'test-auth-token';
const APP_URL = 'https://iupiter.vercel.app';
const WEBHOOK_URL = `${APP_URL}/api/twilio/incoming-webhook`;

function computeTwilioSignature(url: string, params: Record<string, string>): string {
  const sortedKeys = Object.keys(params).sort();
  let data = url;
  for (const key of sortedKeys) data += key + params[key];
  return crypto.createHmac('sha1', AUTH_TOKEN).update(Buffer.from(data, 'utf-8')).digest('base64');
}

function makeRequest(params: Record<string, string>, signature?: string): NextRequest {
  const body = new URLSearchParams(params).toString();
  const headers: Record<string, string> = { 'Content-Type': 'application/x-www-form-urlencoded' };
  if (signature !== undefined) headers['X-Twilio-Signature'] = signature;
  return new NextRequest(WEBHOOK_URL, { method: 'POST', headers, body });
}

describe('POST /api/twilio/incoming-webhook signature validation', () => {
  const params = { CallSid: 'CAtest123', From: '+15551234567', To: '+15559876543' };
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env.TWILIO_AUTH_TOKEN = AUTH_TOKEN;
    process.env.VOICE_BRIDGE_WS_URL = 'wss://bridge.example.com/twilio-stream';
    process.env.BRIDGE_SHARED_SECRET = 'shared-secret-123';
    process.env.NEXT_PUBLIC_APP_URL = APP_URL;
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('rejects a request with no signature header', async () => {
    const res = await POST(makeRequest(params));
    expect(res.status).toBe(403);
  });

  it('rejects a request with a wrong signature', async () => {
    const res = await POST(makeRequest(params, 'totally-wrong-signature'));
    expect(res.status).toBe(403);
  });

  it('accepts a request with a correctly computed signature, and embeds the bridge token', async () => {
    const signature = computeTwilioSignature(WEBHOOK_URL, params);
    const res = await POST(makeRequest(params, signature));
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain('<Say>This call may be recorded');
    expect(body).toContain('wss://bridge.example.com/twilio-stream');
    expect(body).toContain('<Parameter name="token" value="shared-secret-123"');
  });

  it('degrades gracefully (does not leak the bridge URL) when TWILIO_AUTH_TOKEN is not configured', async () => {
    delete process.env.TWILIO_AUTH_TOKEN;
    const res = await POST(makeRequest(params));
    const body = await res.text();
    expect(body).not.toContain('bridge.example.com');
  });
});
