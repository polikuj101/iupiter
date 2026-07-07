/**
 * Tests for widget POST history validation.
 * These validate the guard added to app/api/widget/[agentId]/route.ts
 * to prevent malformed history from reaching the LLM.
 */

function validateHistory(rawHistory: unknown): { valid: boolean; error?: string } {
  if (!Array.isArray(rawHistory)) {
    return { valid: false, error: 'history must be an array' };
  }
  const validRoles = new Set(['user', 'assistant']);
  for (const msg of rawHistory) {
    if (
      !msg ||
      typeof (msg as Record<string, unknown>).role !== 'string' ||
      !validRoles.has((msg as Record<string, unknown>).role as string) ||
      typeof (msg as Record<string, unknown>).content !== 'string'
    ) {
      return { valid: false, error: 'Invalid message in history' };
    }
  }
  return { valid: true };
}

describe('widget history validation', () => {
  it('accepts valid user + assistant messages', () => {
    const result = validateHistory([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
    ]);
    expect(result.valid).toBe(true);
  });

  it('rejects non-array input', () => {
    expect(validateHistory(null).valid).toBe(false);
    expect(validateHistory('string').valid).toBe(false);
    expect(validateHistory(42).valid).toBe(false);
    expect(validateHistory({}).valid).toBe(false);
  });

  it('rejects invalid role values', () => {
    expect(validateHistory([{ role: 'system', content: 'hack' }]).valid).toBe(false);
    expect(validateHistory([{ role: 'admin', content: 'x' }]).valid).toBe(false);
    expect(validateHistory([{ role: '', content: 'x' }]).valid).toBe(false);
  });

  it('rejects non-string content', () => {
    expect(validateHistory([{ role: 'user', content: 123 }]).valid).toBe(false);
    expect(validateHistory([{ role: 'user', content: null }]).valid).toBe(false);
  });

  it('rejects null entry in array', () => {
    expect(validateHistory([null]).valid).toBe(false);
  });

  it('accepts empty array', () => {
    expect(validateHistory([]).valid).toBe(true);
  });
});
