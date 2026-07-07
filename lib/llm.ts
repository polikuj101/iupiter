import { GoogleGenerativeAI, GoogleGenerativeAIFetchError, FunctionDeclaration, GenerationConfig, Tool, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Free-tier gemini-2.5-flash is capped at 5 requests/min *per project*, shared
// across every agent's widget. gemini-2.5-flash-lite has a higher free-tier
// ceiling (15 RPM / 1000 RPD), so we retry on it once if the primary model
// gets rate limited, instead of surfacing a hard failure to the visitor.
const FALLBACK_MODEL = process.env.GOOGLE_FALLBACK_MODEL || 'gemini-2.5-flash-lite';

// gemini-2.5-* models "think" before answering, and — unless includeThoughts
// is explicitly set (we never set it) — that reasoning is never returned in
// the response parts, so it can't leak into a chat bubble either way. The
// real risk is budget: thinking tokens draw from the same maxOutputTokens
// ceiling as the visible reply, so a tight budget can let thinking eat
// everything and truncate the answer. THINKING_BUDGET caps reasoning to a
// bounded allowance, and maxOutputTokens is sized on top of it so the
// visible reply still gets its full requested length regardless of how much
// the model reasons.
const THINKING_BUDGET = Number(process.env.GOOGLE_THINKING_BUDGET ?? 512);

export function buildSystemPrompt(options?: {
  systemPrompt?: string;
  businessContext?: string;
  calendarConnected?: boolean;
}): string {
  if (options?.systemPrompt) {
    let prompt = options.systemPrompt + FORMATTING_RULES;
    if (options.calendarConnected) {
      prompt += '\n\n' + CALENDAR_ADDON;
    }
    return prompt;
  }

  const business = options?.businessContext || process.env.BUSINESS_CONTEXT || '';

  return `You are a friendly receptionist and sales assistant for a business. Your job is to help potential clients via chat.

${business ? `About the business:\n${business}\n` : ''}

Strict rules you MUST follow:
1. Write VERY short messages — 1 to 3 sentences max. Split longer answers across follow-up messages.
2. NEVER use bullet points, numbered lists, headers, bold text, or markdown. Plain text only.
3. Sound like a real person texting, not a corporate bot. Use natural patterns ("Sure!", "Of course", "Gotcha", "Absolutely").
4. End your reply with exactly ONE question that moves the conversation toward a booking or sale.
5. If someone asks if you are an AI or a bot, deflect warmly and pivot back to helping them.
6. Never make up prices, dates, or availability — say "Let me check that for you" and ask for contact info.
7. Keep a positive, warm, slightly informal tone at all times.
${options?.calendarConnected ? `8. When a customer wants to book an appointment, collect their name, preferred date (e.g. "Monday May 12"), preferred time, and service. Then use the book_appointment function to create it.\n` : ''}
Your goal: make the person feel heard and guide them toward taking an action (booking, purchase, inquiry).`.trim();
}

const FORMATTING_RULES = `

Reply format rules (always follow, no exceptions):
- Keep each message to 1-2 sentences max. If you need to say more, split into separate paragraphs separated by a blank line — each paragraph becomes its own chat bubble.
- NEVER use bullet points, numbered lists, headers, or any markdown. Plain text only.
- Always give a real, substantive answer. Never just validate or acknowledge without actually answering the question.
- Sound like a real person texting: warm, direct, and concise.`;

const CALENDAR_ADDON = `When a customer wants to book an appointment:
1. Ask for: full name, preferred date (day and date), preferred time, and what service they need.
2. Once you have all four pieces of information, call the book_appointment function.
3. After booking, confirm with: "Done! I've booked your [service] for [date] at [time]. See you then!"
Do NOT book without getting all required information first.`;

// ─── Function declarations ────────────────────────────────────────

const BOOK_APPOINTMENT_FUNCTION: FunctionDeclaration = {
  name: 'book_appointment',
  description: 'Books an appointment in Google Calendar when the customer provides their name, date, time, and service.',
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      customerName: { type: SchemaType.STRING, description: 'Full name of the customer' },
      date:         { type: SchemaType.STRING, description: 'Date of appointment in YYYY-MM-DD format' },
      time:         { type: SchemaType.STRING, description: 'Time of appointment in HH:MM 24-hour format' },
      service:      { type: SchemaType.STRING, description: 'The service or reason for the appointment' },
      phone:        { type: SchemaType.STRING, description: 'Customer phone number (optional)' },
    },
    required: ['customerName', 'date', 'time'],
  },
};

// ─── Types ────────────────────────────────────────────────────────

export interface LLMOptions {
  systemPrompt?:      string;
  businessContext?:   string;
  model?:             string | null;
  temperature?:       number | null;
  maxTokens?:         number | null;
  calendarConnected?: boolean;
  orgId?:             string;
}

export interface LLMResponse {
  text: string;
  functionCall?: {
    name: string;
    args: Record<string, string>;
  };
}

// ─── Main generate function ───────────────────────────────────────

export async function generateReply(
  history: { role: 'user' | 'assistant'; content: string }[],
  options?: LLMOptions,
): Promise<LLMResponse> {
  const modelName = options?.model || process.env.GOOGLE_MODEL || 'gemini-2.5-flash';

  const tools: Tool[] = options?.calendarConnected
    ? [{ functionDeclarations: [BOOK_APPOINTMENT_FUNCTION] }]
    : [];

  // Gemini requires strictly alternating user/model turns starting with user.
  // Merge consecutive assistant messages (from multi-bubble split) and strip
  // any leading assistant messages (e.g. the greeting).
  const merged: typeof history = [];
  for (const msg of history) {
    const last = merged[merged.length - 1];
    if (last && last.role === 'assistant' && msg.role === 'assistant') {
      last.content += '\n\n' + msg.content;
    } else {
      merged.push({ ...msg });
    }
  }
  const normalized = merged[0]?.role === 'assistant' ? merged.slice(1) : merged;

  const contents = normalized.map((msg) => ({
    role:  msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const visibleTokens = options?.maxTokens ?? 300;
  const generationConfig: GenerationConfig & { thinkingConfig?: { thinkingBudget: number } } = {
    // maxOutputTokens is the ceiling for thinking + visible reply combined,
    // so add the thinking allowance on top — otherwise reasoning would eat
    // into the reply's own budget and truncate it (the original bug).
    maxOutputTokens: visibleTokens + THINKING_BUDGET,
    temperature:     options?.temperature ?? 0.7,
    thinkingConfig:  { thinkingBudget: THINKING_BUDGET },
  };
  const systemInstruction = buildSystemPrompt(options);

  const callModel = (name: string) =>
    genAI
      .getGenerativeModel({ model: name, ...(tools.length > 0 ? { tools } : {}) })
      .generateContent({ contents, systemInstruction, generationConfig });

  let response;
  try {
    response = await callModel(modelName);
  } catch (err) {
    const isRateLimited = err instanceof GoogleGenerativeAIFetchError && err.status === 429;
    if (isRateLimited && modelName !== FALLBACK_MODEL) {
      response = await callModel(FALLBACK_MODEL);
    } else {
      throw err;
    }
  }

  const candidate = response.response.candidates?.[0];
  const part      = candidate?.content?.parts?.[0];

  // Handle function call
  if (part?.functionCall) {
    return {
      text:         '',
      functionCall: {
        name: part.functionCall.name,
        args: part.functionCall.args as Record<string, string>,
      },
    };
  }

  const text = response.response.text();
  if (!text) throw new Error('Gemini returned no text');

  return { text: text.trim() };
}
