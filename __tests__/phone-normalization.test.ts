/**
 * Tests for E.164 phone normalization.
 * Mirrors the normalizeE164 function in lib/twilio.ts.
 */

function normalizeE164(phone: string, defaultCountry = '+1'): string {
  const stripped = phone.trim();
  if (stripped.startsWith('+')) {
    return '+' + stripped.slice(1).replace(/\D/g, '');
  }
  const digits = stripped.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    return '+' + digits;
  }
  if (digits.length === 10) {
    return defaultCountry + digits;
  }
  return '+' + digits;
}

describe('E.164 phone normalization', () => {
  it('passes through already-formatted E.164 numbers', () => {
    expect(normalizeE164('+12125551234')).toBe('+12125551234');
    expect(normalizeE164('+353851234567')).toBe('+353851234567');
  });

  it('normalizes US 10-digit numbers', () => {
    expect(normalizeE164('2125551234')).toBe('+12125551234');
    expect(normalizeE164('(212) 555-1234')).toBe('+12125551234');
    expect(normalizeE164('212-555-1234')).toBe('+12125551234');
    expect(normalizeE164('212.555.1234')).toBe('+12125551234');
  });

  it('normalizes US 11-digit numbers starting with 1', () => {
    expect(normalizeE164('12125551234')).toBe('+12125551234');
    expect(normalizeE164('1 212 555 1234')).toBe('+12125551234');
  });

  it('strips non-digit chars from E.164-prefixed numbers', () => {
    expect(normalizeE164('+1 (212) 555-1234')).toBe('+12125551234');
    expect(normalizeE164('+44 20 7946 0958')).toBe('+442079460958');
  });

  it('handles padded/spaced input', () => {
    expect(normalizeE164('  +12125551234  ')).toBe('+12125551234');
    expect(normalizeE164('  2125551234  ')).toBe('+12125551234');
  });
});
