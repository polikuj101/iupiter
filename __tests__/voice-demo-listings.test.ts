import { VOICE_DEMO_LISTINGS, renderVoiceListingsForPrompt } from '@/lib/voice-demo-listings';

describe('voice demo listings', () => {
  it('provides at least one listing of each status', () => {
    const statuses = new Set(VOICE_DEMO_LISTINGS.map((l) => l.status));
    expect(statuses.has('active')).toBe(true);
    expect(statuses.has('pending')).toBe(true);
    expect(statuses.has('sold')).toBe(true);
  });

  it('renders every listing into prompt text with address, status, and price', () => {
    const prompt = renderVoiceListingsForPrompt();
    for (const l of VOICE_DEMO_LISTINGS) {
      expect(prompt).toContain(l.street);
      expect(prompt).toContain(l.status.toUpperCase());
      expect(prompt).toContain(`$${l.price.toLocaleString()}`);
    }
  });

  it('includes the previously-sold date for sold listings that have one', () => {
    const prompt = renderVoiceListingsForPrompt();
    const sold = VOICE_DEMO_LISTINGS.find((l) => l.status === 'sold' && l.prevSoldDate);
    expect(sold).toBeDefined();
    expect(prompt).toContain(sold!.prevSoldDate!);
  });
});
