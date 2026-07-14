/**
 * Places an outbound call via Zadarma's callback API. Authenticated — this
 * is the founder's own outreach tool, not public. Zadarma rings
 * ZADARMA_CALLER_PHONE first; once answered, it dials the target number and
 * bridges the two legs. No browser mic/WebRTC involved.
 */

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { zadarmaRequestCallback } from '@/lib/zadarma';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const callerPhone = process.env.ZADARMA_CALLER_PHONE;
  if (!callerPhone) {
    return NextResponse.json({ error: 'Zadarma not configured (ZADARMA_CALLER_PHONE missing)' }, { status: 500 });
  }

  const { to } = await req.json() as { to?: string };
  const cleaned = (to ?? '').replace(/[^\d+]/g, '');
  if (!/^\+?[0-9]{7,15}$/.test(cleaned)) {
    return NextResponse.json({ error: 'Enter a valid phone number, e.g. +15551234567' }, { status: 400 });
  }

  try {
    const result = await zadarmaRequestCallback(callerPhone, cleaned);
    if (result.status !== 'success') {
      return NextResponse.json({ error: result.message || 'Zadarma call request failed' }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[zadarma] dial failed:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
