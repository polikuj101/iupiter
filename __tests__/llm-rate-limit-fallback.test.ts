/**
 * Regression test for the Gemini free-tier rate limit issue.
 *
 * Root cause: gemini-2.5-flash free tier is capped at 5 requests/min per
 * project, shared across every agent's widget. Once exhausted, the widget
 * returned a hard failure ("Something went wrong") to the visitor.
 *
 * Fix: generateReply() retries once on gemini-2.5-flash-lite (higher free
 * tier ceiling) when the primary model call is rate limited (HTTP 429).
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

function fakeSuccess(text: string) {
  return {
    response: {
      candidates: [{ content: { parts: [{ text }] } }],
      text: () => text,
    },
  };
}

describe('generateReply rate-limit fallback', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
    mockGetGenerativeModel.mockClear();
  });

  it('retries on gemini-2.5-flash-lite when the primary model is rate limited', async () => {
    mockGenerateContent
      .mockRejectedValueOnce(new GoogleGenerativeAIFetchError('rate limited', 429, 'Too Many Requests'))
      .mockResolvedValueOnce(fakeSuccess('Hi from fallback'));

    const result = await generateReply(
      [{ role: 'user', content: 'hello' }],
      { model: 'gemini-2.5-flash' },
    );

    expect(result.text).toBe('Hi from fallback');
    expect(mockGetGenerativeModel).toHaveBeenNthCalledWith(1, expect.objectContaining({ model: 'gemini-2.5-flash' }));
    expect(mockGetGenerativeModel).toHaveBeenNthCalledWith(2, expect.objectContaining({ model: 'gemini-2.5-flash-lite' }));
  });

  it('does not retry and rethrows for non-429 errors', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('network blip'));

    await expect(
      generateReply([{ role: 'user', content: 'hello' }], { model: 'gemini-2.5-flash' }),
    ).rejects.toThrow('network blip');

    expect(mockGetGenerativeModel).toHaveBeenCalledTimes(1);
  });

  it('does not retry if the primary model already IS the fallback model', async () => {
    mockGenerateContent.mockRejectedValueOnce(
      new GoogleGenerativeAIFetchError('rate limited', 429, 'Too Many Requests'),
    );

    await expect(
      generateReply([{ role: 'user', content: 'hello' }], { model: 'gemini-2.5-flash-lite' }),
    ).rejects.toThrow();

    expect(mockGetGenerativeModel).toHaveBeenCalledTimes(1);
  });
});
