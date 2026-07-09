/**
 * Regression test for the interactive "context base" demo feature: a
 * visitor fills in a fake agent profile (contact routing, coverage area,
 * specialties, preferred vendors, lead-capture style) and the AI's system
 * prompt should reflect it.
 */

import { DEFAULT_DEMO_PROFILE, renderProfileForPrompt, type DemoAgentProfile } from '@/lib/demo-profile';

describe('demo agent profile', () => {
  it('renders contact info, calendar link, and license number', () => {
    const prompt = renderProfileForPrompt(DEFAULT_DEMO_PROFILE);
    expect(prompt).toContain(DEFAULT_DEMO_PROFILE.identity.phone);
    expect(prompt).toContain(DEFAULT_DEMO_PROFILE.identity.calendarLink);
    expect(prompt).toContain(DEFAULT_DEMO_PROFILE.identity.licenseNumber);
  });

  it('renders configured zip codes and neighborhoods', () => {
    const prompt = renderProfileForPrompt(DEFAULT_DEMO_PROFILE);
    expect(prompt).toContain('90210');
    expect(prompt).toContain('Downtown');
  });

  it('only lists enabled specialties, not disabled ones', () => {
    const profile: DemoAgentProfile = {
      ...DEFAULT_DEMO_PROFILE,
      superpowers: { ...DEFAULT_DEMO_PROFILE.superpowers, luxury: true, commercial: false },
    };
    const prompt = renderProfileForPrompt(profile);
    expect(prompt).toContain('Luxury Properties');
    expect(prompt).toContain('First-Time Homebuyers'); // default profile has this on
    expect(prompt).not.toContain('Commercial Real Estate');
  });

  it('renders preferred vendor contacts', () => {
    const prompt = renderProfileForPrompt(DEFAULT_DEMO_PROFILE);
    expect(prompt).toContain(DEFAULT_DEMO_PROFILE.vendors.lender.name);
    expect(prompt).toContain(DEFAULT_DEMO_PROFILE.vendors.inspector.name);
  });

  it('translates the lead-capture trigger into a distinct instruction per option', () => {
    const aggressive = renderProfileForPrompt({ ...DEFAULT_DEMO_PROFILE, leadCaptureTrigger: 'aggressive' });
    const valueFirst = renderProfileForPrompt({ ...DEFAULT_DEMO_PROFILE, leadCaptureTrigger: 'value-first' });
    const consultative = renderProfileForPrompt({ ...DEFAULT_DEMO_PROFILE, leadCaptureTrigger: 'consultative' });

    expect(aggressive).toMatch(/before giving specific listing details/i);
    expect(valueFirst).toMatch(/two or three of the visitor's questions/i);
    expect(consultative).toMatch(/steer the conversation toward booking a call/i);

    // Each option must produce genuinely different instruction text.
    expect(new Set([aggressive, valueFirst, consultative]).size).toBe(3);
  });
});
