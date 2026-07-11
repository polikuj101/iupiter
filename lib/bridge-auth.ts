import { NextRequest, NextResponse } from 'next/server';

/**
 * Shared-secret auth for service-to-service calls from the voice bridge — a
 * separate always-on process (Twilio Media Streams <-> Gemini Live), not a
 * Clerk-authenticated browser session, so it can't use the normal auth().
 */
export function requireBridgeAuth(req: NextRequest): NextResponse | null {
  const expected = process.env.BRIDGE_SHARED_SECRET;
  if (!expected) {
    return NextResponse.json({ error: 'Voice bridge not configured' }, { status: 500 });
  }
  if (req.headers.get('authorization') !== `Bearer ${expected}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
