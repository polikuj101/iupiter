/**
 * Public route — mints a short-lived, single-use Gemini Live ephemeral
 * token so the browser can open its OWN direct WebSocket to Gemini Live,
 * with no server relaying audio in between (unlike the phone bridge, which
 * has to sit in the middle to translate Twilio's audio format). The real
 * GOOGLE_API_KEY never reaches the browser — only this narrow, bounded
 * token does (1 use, expires in a few minutes).
 */

import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const MODEL = process.env.GEMINI_LIVE_MODEL || 'gemini-2.5-flash-native-audio-preview-12-2025';

export async function POST() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Voice demo not configured' }, { status: 500 });
  }

  const ai = new GoogleGenAI({ apiKey, httpOptions: { apiVersion: 'v1alpha' } });

  try {
    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        // 30 min is the API's max for expireTime — this bounds the whole
        // call, not just the connect step (that's newSessionExpireTime,
        // below). Gemini also hard-caps audio-only sessions at 15 min
        // server-side regardless of token lifetime; see the onclose handler
        // in voice-demo/page.tsx for what happens when either limit hits.
        expireTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        newSessionExpireTime: new Date(Date.now() + 60 * 1000).toISOString(),
      },
    });

    return NextResponse.json({ token: token.name, model: MODEL });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[voice-demo] token mint failed:', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
