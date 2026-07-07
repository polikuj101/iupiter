/**
 * Regression test for truncated widget replies on gemini-2.5-* models.
 *
 * Root cause: gemini-2.5-flash/pro are "thinking" models — internal reasoning
 * tokens are deducted from the same maxOutputTokens budget as the visible
 * reply. With maxOutputTokens: 300 (short widget replies) and no
 * thinkingConfig, the model can spend most/all of the budget thinking and
 * return a reply cut off mid-sentence (finishReason: MAX_TOKENS).
 *
 * Fix: generateReply() gives thinking a bounded, separate allowance
 * (thinkingConfig.thinkingBudget) and adds it on top of the visible reply's
 * own maxOutputTokens, so reasoning can no longer eat into the reply's
 * budget. Thinking content itself is never returned in response parts
 * (includeThoughts is never set), so it can't leak into a chat bubble either
 * way — the bug was budget starvation, not text leakage.
 */

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

describe('generateReply thinking budget', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
    mockGetGenerativeModel.mockClear();
  });

  it('gives thinking a bounded allowance on top of the visible reply budget', async () => {
    mockGenerateContent.mockResolvedValueOnce(fakeSuccess('A short, complete answer.'));

    await generateReply(
      [{ role: 'user', content: 'Why is the price per sq ft higher here?' }],
      { model: 'gemini-2.5-flash', maxTokens: 300 },
    );

    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({
        generationConfig: expect.objectContaining({
          // 300 (requested reply budget) + 512 (default thinking allowance) —
          // never just 300, or thinking would eat straight into the reply.
          maxOutputTokens: 812,
          thinkingConfig: { thinkingBudget: 512 },
        }),
      }),
    );
  });

  it('never requests thought summaries, so reasoning cannot appear in a bubble', async () => {
    mockGenerateContent.mockResolvedValueOnce(fakeSuccess('A short, complete answer.'));

    await generateReply(
      [{ role: 'user', content: 'Why is the price per sq ft higher here?' }],
      { model: 'gemini-2.5-flash', maxTokens: 300 },
    );

    const [[call]] = mockGenerateContent.mock.calls;
    expect(call.generationConfig).not.toHaveProperty('includeThoughts');
  });
});
