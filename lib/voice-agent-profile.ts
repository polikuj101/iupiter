/**
 * Data model + prompt/explanation generation for the voice-demo setup
 * wizard. Adapted from the "Pleep" AI-salesperson wizard pattern (scan/fill
 * business info with a live preview -> generate + explain the reasoning ->
 * animated build step -> test drive) but for a real estate voice agent
 * specifically, and fully client-side / no persistence.
 */

export interface VoiceAgentProfile {
  agentName: string;
  companyName: string;
  description: string;
  mainGoal: string;
  keyAdvantages: string[];
  currency: string;
  timezone: string;
  writingStyle: 'formal' | 'casual';
  formality: 'formal' | 'friendly';
}

export const DEFAULT_VOICE_AGENT_PROFILE: VoiceAgentProfile = {
  agentName: 'Alex',
  companyName: 'Apex Realty',
  description: 'Full-service real estate agency helping buyers and sellers in the local market.',
  mainGoal: 'Book qualified buyers and sellers a call or property tour with a human agent.',
  keyAdvantages: [
    'Access to every active MLS listing in the area',
    'Free home valuation for sellers',
    'In-house mortgage pre-approval partner',
  ],
  currency: 'USD',
  timezone: 'America/New_York',
  writingStyle: 'casual',
  formality: 'friendly',
};

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'KZT'];
export const TIMEZONES = [
  'America/New_York', 'America/Chicago', 'America/Los_Angeles',
  'Europe/London', 'Europe/Berlin', 'Asia/Almaty',
];

/** Real-estate-tailored voice system prompt, built from the wizard's fields. */
export function buildVoiceAgentSystemPrompt(profile: VoiceAgentProfile): string {
  const tone = profile.formality === 'formal'
    ? 'Speak professionally and respectfully at all times — no slang, no over-familiarity.'
    : 'Speak warmly and casually, like a friendly local agent — approachable, not corporate.';

  const style = profile.writingStyle === 'formal'
    ? 'Use complete, well-formed sentences.'
    : 'Use natural, conversational phrasing — contractions are fine.';

  const advantages = profile.keyAdvantages.filter(Boolean);

  return `You are ${profile.agentName}, a real estate voice assistant for ${profile.companyName}.

About the company: ${profile.description}

Your goal on every call: ${profile.mainGoal}

${advantages.length ? `What sets ${profile.companyName} apart:\n${advantages.map((a) => `- ${a}`).join('\n')}\n` : ''}
You are on a live PHONE/VOICE call, not a text chat — speak naturally out loud, one continuous reply per turn, never split into lists or bullet points (they can't be heard).

${tone} ${style}

Rules:
1. Keep responses brief and conversational — 1 to 3 sentences per turn, like a real phone call.
2. Never make up specific prices, listings, or availability — say "let me check on that for you" and offer to connect them with a human agent or take their contact info.
3. Always end your turn by moving the conversation forward — ask a clarifying question or suggest a next step.
4. If asked whether you're an AI, be honest but stay warm and pivot back to helping them.
5. Currency for any pricing discussion: ${profile.currency}. Business hours reference: ${profile.timezone}.
6. If the caller wants to speak to a human, or asks something you genuinely can't help with, offer to connect them.`;
}

/** Deterministic "how your agent was designed" explanation, Pleep-style. */
export function explainAgentDesign(profile: VoiceAgentProfile): string[] {
  const advantageCount = profile.keyAdvantages.filter(Boolean).length;
  return [
    `Context analysis: "${profile.companyName}" is a real estate business. Goal: "${profile.mainGoal}". ${advantageCount} key advantage${advantageCount === 1 ? '' : 's'} provided to differentiate from competitors.`,
    `Tone selection: ${profile.formality === 'formal' ? 'Formal and professional' : 'Warm and casual'} — chosen from your formality setting, since real estate conversations range from high-trust financial decisions to casual local chats.`,
    `Guardrails: the agent is instructed to never invent prices or availability, since real estate figures are high-stakes and change constantly — it defers to a human instead of guessing.`,
    `Call structure: greet -> understand the caller's need -> answer using what's known -> always end by moving toward a next step (booking, contact info, or human handoff), so no call ends without a clear outcome.`,
  ];
}
