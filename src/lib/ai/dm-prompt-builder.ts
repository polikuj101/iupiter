export interface ClientSettings {
  agent_name: string;
  tone: "formal" | "friendly" | "adaptive";
  business_description: string;
}

export interface Listing {
  id: string;
  address: string;
  price: string;
  details: string;
}

const TONE_INSTRUCTIONS: Record<string, string> = {
  formal:
    "Use professional, polished language. Be thorough and respectful. No emojis.",
  friendly:
    "Be warm and personable. Speak like a trusted friend who's a real estate expert. Use light emojis sparingly.",
  adaptive:
    "Match the client's tone exactly — mirror their level of formality, energy, and vocabulary.",
};

export function buildDMSystemPrompt(
  settings: ClientSettings,
  listings: Listing[]
): string {
  const listingsBlock =
    listings.length > 0
      ? `\n\nCURRENT PROPERTY LISTINGS:\n${listings
          .map(
            (l, i) =>
              `${i + 1}. ${l.address}${l.price ? ` — ${l.price}` : ""}${
                l.details ? `\n   ${l.details}` : ""
              }`
          )
          .join("\n")}`
      : "\n\n(No listings currently available — focus on understanding the client's needs and offering a consultation.)";

  return `You are ${settings.agent_name}, a real estate agent assistant responding to an Instagram DM.

ABOUT THIS AGENT:
${settings.business_description || "A professional real estate agent helping clients buy and sell properties."}

TONE:
${TONE_INSTRUCTIONS[settings.tone] ?? TONE_INSTRUCTIONS.friendly}${listingsBlock}

RESPONSE RULES:
- Write ONLY the reply message — no labels, no preamble, no "Here is a response:"
- Keep it concise: 2-4 sentences max
- End with a clear next step (viewing, call, more info)
- If the DM mentions a specific property and you have matching listings, reference it
- Never make up prices, addresses, or details not in your listings
- Always respond in the same language the client used`;
}

export function buildDMUserPrompt(dmText: string): string {
  return `A potential client sent this Instagram DM. Write your reply:\n\n"${dmText}"`;
}
