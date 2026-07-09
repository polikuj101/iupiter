/**
 * Regression test for the Gemini free-tier rate limit issue, and for
 * outright model deprecation (Google retires model IDs over time — e.g.
 * gemini-2.5-flash and gemini-2.5-flash-lite were both retired mid-2026,
 * returning HTTP 404 "no longer available" instead of a normal error).
 *
 * Fix: generateReply() retries once on a configured fallback model whenever
 * the primary model call fails with either 429 (rate limited) or 404
 * (deprecated/unknown model), instead of surfacing a hard failure.
 */

import { GoogleGenerativeAIFetchError } from '@google/generative-ai';

const mockGenerateContent = jest.fn();
const mockGetGenerativeModel = jest.fn(() => ({ generateContent: mockGenerateContent }));

jest.mock('@google/generative-ai', () => {
  const actual = jest.requireActual('@google/generative-ai');
  return {
    ...actual,
    GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
      getGenerativeModel: mockGetGenerativeModel,
    })),
  };
});

import { generateReply } from '@/lib/llm';

// Current fallback model default in lib/llm.ts. Update alongside that file
// if it changes again (e.g. after a future model deprecation).
const CURRENT_FALLBACK_MODEL = 'gemini-3.1-flash-lite';

function fakeSuccess(text: string) {
  return {
    response: {
      candidates: [{ content: { parts: [{ text }] } }],
      text: () => text,
    },
  };
}

describe('generateReply rate-limit / deprecation fallback', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
    mockGetGenerativeModel.mockClear();
  });

  it('retries on the fallback model when the primary model is rate limited (429)', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(new GoogleGenerativeAIFetchError('rate limited', 429, 'Too Many Requests'))
      .mockResolvedValueOnce(fakeSuccess('Hi from fallback'));

    const result = await generateReply(
      [{ role: 'user', content: 'hello' }],
      { model: 'some-primary-model' },
    );

    expect(result.text).toBe('Hi from fallback');
    expect(mockGetGenerativeModel).toHaveBeenNthCalledWith(1, expect.objectContaining({ model: 'some-primary-model' }));
    expect(mockGetGenerativeModel).toHaveBeenNthCalledWith(2, expect.objectContaining({ model: CURRENT_FALLBACK_MODEL }));
  });

  it('retries on the fallback model when the primary model is deprecated (404)', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(new GoogleGenerativeAIFetchError('no longer available', 404, 'Not Found'))
      .mockResolvedValueOnce(fakeSuccess('Hi from fallback'));

    const result = await generateReply(
      [{ role: 'user', content: 'hello' }],
      { model: 'some-deprecated-model' },
    );

    expect(result.text).toBe('Hi from fallback');
    expect(mockGetGenerativeModel).toHaveBeenNthCalledWith(2, expect.objectContaining({ model: CURRENT_FALLBACK_MODEL }));
  });

  it('does not retry and rethrows for other error codes (e.g. 500)', async () => {
    mockGenerateContent.mockRejectedValueOnce(new GoogleGenerativeAIFetchError('server error', 500, 'Internal Server Error'));

    await expect(
      generateReply([{ role: 'user', content: 'hello' }], { model: 'some-primary-model' }),
    ).rejects.toThrow();

    expect(mockGetGenerativeModel).toHaveBeenCalledTimes(1);
  });

  it('does not retry if the primary model already IS the fallback model', async () => {
    mockGenerateContent.mockRejectedValueOnce(
      new GoogleGenerativeAIFetchError('rate limited', 429, 'Too Many Requests'),
    );

    await expect(
      generateReply([{ role: 'user', content: 'hello' }], { model: CURRENT_FALLBACK_MODEL }),
    ).rejects.toThrow();

    expect(mockGetGenerativeModel).toHaveBeenCalledTimes(1);
  });
});
