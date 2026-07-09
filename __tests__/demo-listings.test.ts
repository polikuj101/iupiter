/**
 * Regression test for the demo's "generic deflection" bug: the realestate/
 * rental demo niches previously had no specific listing data, so any
 * budget/price/property question got deflected to "let's connect you with
 * an agent" instead of answered.
 *
 * Fix: lib/demo-listings.ts provides a static, fictional set of sample
 * listings per niche, rendered into each niche's system prompt via
 * renderListingsForPrompt(). This is demo-only content shared by every
 * visitor — not a real per-customer knowledge base (that's deferred, see
 * TODOS.md).
 */

import { DEMO_LISTINGS, renderListingsForPrompt } from '@/lib/demo-listings';

describe('demo listings', () => {
  it('provides at least one listing for both demo niches', () => {
    expect(DEMO_LISTINGS.realestate.length).toBeGreaterThan(0);
    expect(DEMO_LISTINGS.rental.length).toBeGreaterThan(0);
  });

  it('renders realestate listings into prompt text, including the address referenced by the demo UI suggestion chip', () => {
    const prompt = renderListingsForPrompt('realestate');
    // Matches LiveDemoWidget.tsx's suggestion chip "Is 14 Maple Ave still available?"
    expect(prompt).toContain('14 Maple Ave');
    expect(prompt).toMatch(/€\d[\d,]*/); // has at least one euro price
  });

  it('renders a listing near the €380K budget referenced by the demo UI suggestion chip', () => {
    const prompt = renderListingsForPrompt('realestate');
    // Matches LiveDemoWidget.tsx's suggestion chip "Budget €380K — what can I get?"
    expect(prompt).toContain('€379,000');
  });

  it('renders rental listings into prompt text', () => {
    const prompt = renderListingsForPrompt('rental');
    expect(prompt.length).toBeGreaterThan(0);
    expect(prompt).toMatch(/Dublin/);
  });

  it('returns an empty string for a niche with no listings', () => {
    // @ts-expect-error — deliberately testing an unlisted niche key
    expect(renderListingsForPrompt('dental')).toBe('');
  });
});
