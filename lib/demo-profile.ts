/**
 * Interactive demo-only "agent profile" — lets a visitor fill in a fake
 * real estate agent's business identity (contact routing, coverage area,
 * specialties, preferred vendors, lead-capture style) and see the AI's
 * behavior adapt live. Purely client-supplied, ephemeral, not persisted —
 * this is a sales device for the marketing demo, not the real product's
 * per-agent settings (that lives in the `agents` table / dashboard).
 */

export type LeadCaptureTrigger = 'aggressive' | 'value-first' | 'consultative';

export interface DemoAgentProfile {
  identity: {
    phone:         string;
    whatsapp:      string;
    calendarLink:  string;
    licenseNumber: string;
  };
  geographies: {
    zipCodes:      string[];
    neighborhoods: string[];
  };
  superpowers: {
    firstTimeBuyers: boolean;
    luxury:           boolean;
    foreclosures:     boolean;
    militaryVA:       boolean;
    commercial:       boolean;
    languages:        string[];
  };
  vendors: {
    lender:    { name: string; profession: string; phone: string };
    inspector: { name: string; profession: string; phone: string };
  };
  leadCaptureTrigger: LeadCaptureTrigger;
}

export const DEFAULT_DEMO_PROFILE: DemoAgentProfile = {
  identity: {
    phone: '(555) 019-2847',
    whatsapp: '(555) 019-2847',
    calendarLink: 'https://calendly.com/apex-realty/viewing',
    licenseNumber: 'DRE #01987654',
  },
  geographies: {
    zipCodes: ['90210', '90211', '90212'],
    neighborhoods: ['Downtown', 'Suburbs', 'Waterfront'],
  },
  superpowers: {
    firstTimeBuyers: true,
    luxury: false,
    foreclosures: false,
    militaryVA: false,
    commercial: false,
    languages: [],
  },
  vendors: {
    lender:    { name: 'John Doe',      profession: 'Movement Mortgage', phone: '(555) 019-2192' },
    inspector: { name: 'Ace Inspections', profession: 'Home Inspector',   phone: '(555) 019-2143' },
  },
  leadCaptureTrigger: 'value-first',
};

const SUPERPOWER_LABELS: Record<keyof DemoAgentProfile['superpowers'], string> = {
  firstTimeBuyers: 'First-Time Homebuyers',
  luxury: 'Luxury Properties',
  foreclosures: 'Foreclosures / Short Sales',
  militaryVA: 'Military / VA Relocation',
  commercial: 'Commercial Real Estate',
  languages: '', // rendered separately below
};

const LEAD_CAPTURE_INSTRUCTIONS: Record<LeadCaptureTrigger, string> = {
  aggressive: 'Capture the visitor\'s email or phone number before giving specific listing details or pricing.',
  'value-first': 'Answer at least two or three of the visitor\'s questions with real substance before asking for their contact info.',
  consultative: 'Always steer the conversation toward booking a call via the calendar link below, rather than answering everything in chat.',
};

/** Compact plain-text block appended to a niche's system prompt. */
export function renderProfileForPrompt(profile: DemoAgentProfile): string {
  const specialties = (Object.keys(profile.superpowers) as (keyof DemoAgentProfile['superpowers'])[])
    .filter((key) => key !== 'languages' && profile.superpowers[key])
    .map((key) => SUPERPOWER_LABELS[key]);

  const lines: string[] = [];

  lines.push(
    `Your contact info: phone ${profile.identity.phone}, WhatsApp ${profile.identity.whatsapp}. ` +
    `Booking link: ${profile.identity.calendarLink}. License: ${profile.identity.licenseNumber} (mention only if legally relevant or asked).`,
  );

  if (profile.geographies.zipCodes.length || profile.geographies.neighborhoods.length) {
    lines.push(
      `You focus on: ${profile.geographies.neighborhoods.join(', ') || 'the local area'} ` +
      `(zip codes: ${profile.geographies.zipCodes.join(', ') || 'not specified'}).`,
    );
  }

  if (specialties.length || profile.superpowers.languages.length) {
    const langPart = profile.superpowers.languages.length
      ? ` You can also assist in: ${profile.superpowers.languages.join(', ')}.`
      : '';
    lines.push(`Your specialties: ${specialties.join(', ') || 'general residential'}.${langPart}`);
  }

  lines.push(
    `Preferred vendors you can refer: lender — ${profile.vendors.lender.name} (${profile.vendors.lender.profession}, ${profile.vendors.lender.phone}); ` +
    `inspector — ${profile.vendors.inspector.name} (${profile.vendors.inspector.profession}, ${profile.vendors.inspector.phone}).`,
  );

  lines.push(`Lead capture style: ${LEAD_CAPTURE_INSTRUCTIONS[profile.leadCaptureTrigger]}`);

  return `

Your professional profile (use this to answer questions about yourself, your coverage area, and who to refer clients to):
${lines.map((l) => `- ${l}`).join('\n')}`;
}
