import {
  DEFAULT_VOICE_AGENT_PROFILE, buildVoiceAgentSystemPrompt, explainAgentDesign,
  type VoiceAgentProfile,
} from '@/lib/voice-agent-profile';

describe('buildVoiceAgentSystemPrompt', () => {
  it('includes the agent name, company, goal, and advantages', () => {
    const prompt = buildVoiceAgentSystemPrompt(DEFAULT_VOICE_AGENT_PROFILE);
    expect(prompt).toContain(DEFAULT_VOICE_AGENT_PROFILE.agentName);
    expect(prompt).toContain(DEFAULT_VOICE_AGENT_PROFILE.companyName);
    expect(prompt).toContain(DEFAULT_VOICE_AGENT_PROFILE.mainGoal);
    for (const adv of DEFAULT_VOICE_AGENT_PROFILE.keyAdvantages) {
      expect(prompt).toContain(adv);
    }
  });

  it('instructs the agent never to invent prices or availability', () => {
    const prompt = buildVoiceAgentSystemPrompt(DEFAULT_VOICE_AGENT_PROFILE);
    expect(prompt).toMatch(/never make up specific prices/i);
  });

  it('frames the reply as a live voice call, not a text chat', () => {
    const prompt = buildVoiceAgentSystemPrompt(DEFAULT_VOICE_AGENT_PROFILE);
    expect(prompt).toMatch(/live PHONE\/VOICE call/i);
    expect(prompt).toMatch(/never split into lists or bullet points/i);
  });

  it('produces a different tone instruction for formal vs friendly', () => {
    const friendly = buildVoiceAgentSystemPrompt({ ...DEFAULT_VOICE_AGENT_PROFILE, formality: 'friendly' });
    const formal = buildVoiceAgentSystemPrompt({ ...DEFAULT_VOICE_AGENT_PROFILE, formality: 'formal' });
    expect(friendly).not.toBe(formal);
  });

  it('omits the advantages section entirely when none are provided', () => {
    const profile: VoiceAgentProfile = { ...DEFAULT_VOICE_AGENT_PROFILE, keyAdvantages: [] };
    const prompt = buildVoiceAgentSystemPrompt(profile);
    expect(prompt).not.toContain('sets');
  });

  it('includes sample listings so status questions can be answered directly', () => {
    const prompt = buildVoiceAgentSystemPrompt(DEFAULT_VOICE_AGENT_PROFILE);
    expect(prompt).toContain('14 Maple Ave');
    expect(prompt).toMatch(/ACTIVE|PENDING|SOLD/);
  });
});

describe('explainAgentDesign', () => {
  it('returns a non-empty explanation tailored to the profile', () => {
    const bullets = explainAgentDesign(DEFAULT_VOICE_AGENT_PROFILE);
    expect(bullets.length).toBeGreaterThan(0);
    expect(bullets.some((b) => b.includes(DEFAULT_VOICE_AGENT_PROFILE.companyName))).toBe(true);
  });

  it('reflects the actual number of key advantages provided', () => {
    const twoAdvantages = explainAgentDesign({ ...DEFAULT_VOICE_AGENT_PROFILE, keyAdvantages: ['A', 'B'] });
    expect(twoAdvantages[0]).toContain('2 key advantages');

    const oneAdvantage = explainAgentDesign({ ...DEFAULT_VOICE_AGENT_PROFILE, keyAdvantages: ['A'] });
    expect(oneAdvantage[0]).toContain('1 key advantage ');
  });
});
