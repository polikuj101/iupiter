/**
 * Minimal Zadarma REST client — just enough to place an outbound "callback"
 * call (Zadarma rings ZADARMA_CALLER_PHONE first; once answered, it dials
 * `to` and bridges the two legs together). No WebRTC, no browser mic.
 *
 * Auth scheme per Zadarma's docs (zadarma.com/en/support/api/):
 *   signature = base64( hex( HMAC-SHA1(secretKey, path + queryString + md5(queryString)) ) )
 *   header: Authorization: <userKey>:<signature>
 * Params are sorted alphabetically before building the query string, since
 * the signature is only valid for that exact ordering.
 */

import crypto from 'crypto';

const ZADARMA_BASE_URL = 'https://api.zadarma.com';

export function buildQueryString(params: Record<string, string>): string {
  return Object.keys(params)
    .sort()
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
}

export function signZadarmaRequest(path: string, queryString: string, secretKey: string): string {
  const md5OfQuery = crypto.createHash('md5').update(queryString).digest('hex');
  const stringToSign = path + queryString + md5OfQuery;
  const hexHmac = crypto.createHmac('sha1', secretKey).update(stringToSign).digest('hex');
  return Buffer.from(hexHmac).toString('base64');
}

interface ZadarmaCallbackResponse {
  status: string;
  message?: string;
  from?: string;
  to?: string;
  time?: number;
}

/** Rings `from` first; once answered, dials `to` and bridges the call. */
export async function zadarmaRequestCallback(from: string, to: string): Promise<ZadarmaCallbackResponse> {
  const userKey = process.env.ZADARMA_API_KEY;
  const secretKey = process.env.ZADARMA_API_SECRET;
  if (!userKey || !secretKey) {
    throw new Error('Zadarma not configured (ZADARMA_API_KEY / ZADARMA_API_SECRET missing)');
  }

  const path = '/v1/request/callback/';
  const queryString = buildQueryString({ from, to });
  const signature = signZadarmaRequest(path, queryString, secretKey);

  const res = await fetch(`${ZADARMA_BASE_URL}${path}?${queryString}`, {
    method: 'GET',
    headers: { Authorization: `${userKey}:${signature}` },
  });

  const data = await res.json() as ZadarmaCallbackResponse;
  if (!res.ok && !data.status) {
    throw new Error(`Zadarma request failed (${res.status})`);
  }
  return data;
}
