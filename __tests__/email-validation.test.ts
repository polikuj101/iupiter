/**
 * Tests for notification_email format validation.
 * Mirrors the regex in app/api/settings/notification-email/route.ts.
 */

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

describe('notification email validation', () => {
  it('accepts standard email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('name+tag@domain.co.uk')).toBe(true);
    expect(isValidEmail('a@b.io')).toBe(true);
  });

  it('rejects addresses without @', () => {
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('nodomain.com')).toBe(false);
  });

  it('rejects addresses without a domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rejects addresses without a TLD', () => {
    expect(isValidEmail('user@domain')).toBe(false);
  });

  it('rejects addresses with spaces', () => {
    expect(isValidEmail('user @example.com')).toBe(false);
    expect(isValidEmail('user@ example.com')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});
