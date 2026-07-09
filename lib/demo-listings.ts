/**
 * Static sample listings for the public marketing demo (realestate/rental
 * niches only). Fictional data, shared by every demo visitor — not tied to
 * any customer account.
 *
 * This is intentionally NOT a real knowledge base: no uploads, no
 * embeddings, no retrieval. A real per-customer RAG system (private
 * listings/documents, uploaded by the agent) is deferred — see TODOS.md.
 */

export interface DemoListing {
  address:      string;
  price:        string;
  beds:         number;
  baths:        number;
  sqft:         number;
  pricePerSqft: number;
  notes:        string;
}

export type DemoListingNiche = 'realestate' | 'rental';

export const DEMO_LISTINGS: Record<DemoListingNiche, DemoListing[]> = {
  realestate: [
    {
      // Referenced by name in LiveDemoWidget.tsx's suggestion chip
      // ("Is 14 Maple Ave still available?") — keep in sync if either changes.
      address: '14 Maple Ave, Riverside',
      price: '€410,000',
      beds: 3, baths: 2, sqft: 1850, pricePerSqft: 221,
      notes: 'Still available, on the market 9 days. Recently renovated kitchen, top-rated Riverside school district.',
    },
    {
      address: '208 Oakwood Dr, Riverside',
      price: '€379,000',
      beds: 3, baths: 2, sqft: 1620, pricePerSqft: 234,
      // Matches LiveDemoWidget.tsx's "Budget €380K — what can I get?" suggestion.
      notes: 'Right at a €380K budget. Starter family home, original condition, priced at neighborhood average.',
    },
    {
      address: '5 Birchwood Ct, Riverside',
      price: '€565,000',
      beds: 4, baths: 3, sqft: 2400, pricePerSqft: 235,
      notes: 'Fully renovated 2 years ago (new roof, kitchen, primary suite addition) — above most buyers\' first-look budget.',
    },
    {
      address: '92 Elm St, Downtown',
      price: '€342,000',
      beds: 2, baths: 1, sqft: 1050, pricePerSqft: 326,
      notes: 'Walk-to-everything downtown condo, higher price/sqft reflects location premium, not the unit itself.',
    },
    {
      address: '17 Willow Ln, Riverside',
      price: '€395,000',
      beds: 3, baths: 2, sqft: 1780, pricePerSqft: 222,
      notes: 'Move-in ready, on the market 12 days, in the Riverside school zone currently under city council redistricting review.',
    },
  ],
  rental: [
    {
      address: 'Studio, Dublin 2 (city centre)',
      price: '€1,150/month',
      beds: 0, baths: 1, sqft: 420, pricePerSqft: 3,
      notes: 'Zero agency fee, available for immediate viewing, BER C-rated.',
    },
    {
      address: '1-bed, Dublin 4 (Ballsbridge)',
      price: '€1,650/month',
      beds: 1, baths: 1, sqft: 580, pricePerSqft: 3,
      notes: 'Near DART station, BER B3-rated, available from next month.',
    },
    {
      address: '2-bed, Dublin 6 (Rathmines)',
      price: '€2,100/month',
      beds: 2, baths: 1, sqft: 780, pricePerSqft: 3,
      notes: 'Close to parks and schools, BER B2-rated, 24/7 maintenance line included.',
    },
    {
      address: '3-bed house, Dublin 9 (Glasnevin)',
      price: '€2,850/month',
      beds: 3, baths: 2, sqft: 1200, pricePerSqft: 2,
      notes: 'Private garden, family-friendly area, near primary schools, available for viewing this week.',
    },
    {
      address: '4-bed house, Dublin 7 (Cabra)',
      price: '€3,400/month',
      beds: 4, baths: 2, sqft: 1450, pricePerSqft: 2,
      notes: 'Largest unit currently listed, recently refurbished, BER B1-rated.',
    },
  ],
};

/** Compact plain-text block appended to a niche's system prompt. */
export function renderListingsForPrompt(niche: DemoListingNiche): string {
  const listings = DEMO_LISTINGS[niche];
  if (!listings?.length) return '';

  const lines = listings.map((l) =>
    `- ${l.address}: ${l.price}, ${l.beds}bd/${l.baths}ba, ${l.sqft.toLocaleString()} sqft (~€${l.pricePerSqft}/sqft). ${l.notes}`,
  );

  return `

Sample listings available right now (use these to answer specific questions — price, size, price-per-sqft, school zone, timing — instead of deflecting to "let me check"; only fall back to booking a call for things not covered here, like exact financing terms or move-in dates beyond what's listed):
${lines.join('\n')}`;
}
