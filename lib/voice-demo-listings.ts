/**
 * Static sample listings for the /voice-demo wizard, in the same fictional
 * "Riverside" market as lib/demo-listings.ts (the text-widget demo) so both
 * demos feel like one consistent world. Column shape follows Kaggle's "USA
 * Real Estate Dataset" (realtor.com listings: status/price/bed/bath/
 * house_size/street/city/state/zip_code/prev_sold_date), with status using
 * standard MLS terms (active/pending/sold) instead of the dataset's own
 * for_sale/ready_to_build labels, since that's what callers actually ask.
 *
 * Same as demo-listings.ts: fictional data, not a real per-customer
 * knowledge base or live MLS feed.
 */

export type VoiceListingStatus = 'active' | 'pending' | 'sold';

export interface VoiceListing {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  status: VoiceListingStatus;
  price: number;
  bed: number;
  bath: number;
  houseSize: number;
  prevSoldDate?: string;
  note: string;
}

export const VOICE_DEMO_LISTINGS: VoiceListing[] = [
  {
    street: '14 Maple Ave', city: 'Riverside', state: 'NY', zipCode: '10580',
    status: 'active', price: 410000, bed: 3, bath: 2, houseSize: 1850,
    note: 'On the market 9 days. Recently renovated kitchen, top-rated Riverside school district.',
  },
  {
    street: '208 Oakwood Dr', city: 'Riverside', state: 'NY', zipCode: '10580',
    status: 'active', price: 379000, bed: 3, bath: 2, houseSize: 1620,
    note: 'Starter family home, original condition, priced at neighborhood average.',
  },
  {
    street: '5 Birchwood Ct', city: 'Riverside', state: 'NY', zipCode: '10580',
    status: 'active', price: 565000, bed: 4, bath: 3, houseSize: 2400,
    note: 'Fully renovated 2 years ago — new roof, kitchen, primary suite addition.',
  },
  {
    street: '92 Elm St', city: 'Downtown Riverside', state: 'NY', zipCode: '10581',
    status: 'pending', price: 342000, bed: 2, bath: 1, houseSize: 1050,
    prevSoldDate: '2019-06-11',
    note: 'Went under contract last week — walk-to-everything downtown condo, no longer accepting showings.',
  },
  {
    street: '17 Willow Ln', city: 'Riverside', state: 'NY', zipCode: '10580',
    status: 'active', price: 395000, bed: 3, bath: 2, houseSize: 1780,
    note: 'Move-in ready, on the market 12 days, Riverside school zone currently under city council redistricting review.',
  },
  {
    street: '61 Cedar Hollow Rd', city: 'Riverside', state: 'NY', zipCode: '10580',
    status: 'sold', price: 448000, bed: 3, bath: 2, houseSize: 1900,
    prevSoldDate: '2026-05-02',
    note: 'Closed last month — good comp for pricing similar 3-bed homes in the area.',
  },
  {
    street: '3 Hilltop Ter', city: 'Riverside', state: 'NY', zipCode: '10580',
    status: 'active', price: 289000, bed: 2, bath: 1, houseSize: 980,
    note: 'Most affordable active listing right now, needs cosmetic updates, priced accordingly.',
  },
  {
    street: '44 Sycamore Way', city: 'Downtown Riverside', state: 'NY', zipCode: '10581',
    status: 'pending', price: 612000, bed: 4, bath: 3, houseSize: 2550,
    note: 'Accepted an offer 3 days ago, backup offers still being considered by the seller.',
  },
];

/** Compact plain-text block appended to the voice agent's system prompt. */
export function renderVoiceListingsForPrompt(): string {
  if (!VOICE_DEMO_LISTINGS.length) return '';

  const lines = VOICE_DEMO_LISTINGS.map((l) => {
    const addr = `${l.street}, ${l.city}, ${l.state} ${l.zipCode}`;
    const price = `$${l.price.toLocaleString()}`;
    const sold = l.status === 'sold' && l.prevSoldDate ? ` (sold ${l.prevSoldDate})` : '';
    return `- ${addr} — ${l.status.toUpperCase()}${sold}, ${price}, ${l.bed}bd/${l.bath}ba, ${l.houseSize.toLocaleString()} sqft. ${l.note}`;
  });

  return `

Listings you can speak to directly (use these for status/price/size questions instead of saying you don't have data — only say you don't have something if it's genuinely not in this list):
${lines.join('\n')}`;
}
