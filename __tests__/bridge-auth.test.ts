/**
 * Tests for the shared-secret auth guarding the voice bridge's
 * service-to-service routes (voice-session-config, book-appointment).
 * These calls come from a separate always-on process with no Clerk session,
 * so they're authenticated via a bearer token instead.
 */

import { NextRequest } from 'next/server';
import { requireBridgeAuth } from '@/lib/bridge-auth';

function fakeRequest(authHeader?: string): NextRequest {
  const headers = new Headers();
  if (authHeader !== undefined) headers.set('authorization', authHeader);
  return new NextRequest('https://example.com/api/twilio/voice-session-config', { headers });
}

describe('requireBridgeAuth', () => {
  const OLD_ENV = process.env.BRIDGE_SHARED_SECRET;
  afterEach(() => { process.env.BRIDGE_SHARED_SECRET = OLD_ENV; });

  it('rejects with 500 when BRIDGE_SHARED_SECRET is not configured', async () => {
    delete process.env.BRIDGE_SHARED_SECRET;
    const res = requireBridgeAuth(fakeRequest('Bearer anything'));
    expect(res?.status).toBe(500);
  });

  it('rejects with 401 when the Authorization header is missing', async () => {
    process.env.BRIDGE_SHARED_SECRET = 'secret123';
    const res = requireBridgeAuth(fakeRequest());
    expect(res?.status).toBe(401);
  });

  it('rejects with 401 when the token does not match', async () => {
    process.env.BRIDGE_SHARED_SECRET = 'secret123';
    const res = requireBridgeAuth(fakeRequest('Bearer wrong-token'));
    expect(res?.status).toBe(401);
  });

  it('allows the request through (returns null) when the token matches', async () => {
    process.env.BRIDGE_SHARED_SECRET = 'secret123';
    const res = requireBridgeAuth(fakeRequest('Bearer secret123'));
    expect(res).toBeNull();
  });
});
