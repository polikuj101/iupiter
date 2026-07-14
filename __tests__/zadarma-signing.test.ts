/**
 * Pins Zadarma's HMAC request-signing scheme (zadarma.com/en/support/api/):
 *   signature = base64( hex( HMAC-SHA1(secretKey, path + queryString + md5(queryString)) ) )
 * with params sorted alphabetically before building the query string. A
 * silent regression here means every outbound call fails with an opaque
 * auth error from Zadarma, which is painful to debug from a 500 alone.
 */

import crypto from 'crypto';
import { buildQueryString, signZadarmaRequest } from '@/lib/zadarma';

describe('buildQueryString', () => {
  it('sorts params alphabetically regardless of insertion order', () => {
    expect(buildQueryString({ to: '2', from: '1' })).toBe('from=1&to=2');
    expect(buildQueryString({ from: '1', to: '2' })).toBe('from=1&to=2');
  });

  it('URL-encodes keys and values', () => {
    expect(buildQueryString({ from: '+1 555' })).toBe('from=%2B1%20555');
  });
});

describe('signZadarmaRequest', () => {
  it('matches an independently computed reference signature', () => {
    const path = '/v1/request/callback/';
    const queryString = 'from=%2B15550000000&to=%2B15551234567';
    const secret = 'test-secret';

    const md5OfQuery = crypto.createHash('md5').update(queryString).digest('hex');
    const expectedHex = crypto.createHmac('sha1', secret).update(path + queryString + md5OfQuery).digest('hex');
    const expected = Buffer.from(expectedHex).toString('base64');

    expect(signZadarmaRequest(path, queryString, secret)).toBe(expected);
  });

  it('produces a different signature for a different secret', () => {
    const path = '/v1/request/callback/';
    const queryString = 'from=1&to=2';
    expect(signZadarmaRequest(path, queryString, 'secret-a'))
      .not.toBe(signZadarmaRequest(path, queryString, 'secret-b'));
  });

  it('produces a different signature for a different path', () => {
    const queryString = 'from=1&to=2';
    expect(signZadarmaRequest('/v1/request/callback/', queryString, 'secret'))
      .not.toBe(signZadarmaRequest('/v1/other/', queryString, 'secret'));
  });
});
