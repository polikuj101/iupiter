import { GoogleGenerativeAI, FunctionDeclaration, Tool, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

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

  const model = genAI.getGenerativeModel({
    model: modelName,
    ...(tools.length > 0 ? { tools } : {}),
  });

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

  const response = await model.generateContent({
    contents,
    systemInstruction: buildSystemPrompt(options),
    generationConfig: {
      maxOutputTokens: options?.maxTokens ?? 300,
      temperature:     options?.temperature ?? 0.7,
    },
  });

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
