import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export function buildSystemPrompt(options?: {
  systemPrompt?: string;
  businessContext?: string;
}): string {
  // If agent has a fully custom system prompt, use it directly
  if (options?.systemPrompt) return options.systemPrompt;

  const business = options?.businessContext || process.env.BUSINESS_CONTEXT || '';

  return `You are a friendly receptionist and sales assistant for a business. Your job is to help potential clients via WhatsApp, Instagram or Messenger.

${business ? `About the business:\n${business}\n` : ''}

Strict rules you MUST follow:
1. Write VERY short messages — 1 to 3 sentences max. Split longer answers across follow-up messages.
2. NEVER use bullet points, numbered lists, headers, bold text, or markdown. Plain text only.
3. Sound like a real person texting, not a corporate bot. Use natural patterns ("Sure!", "Of course", "Gotcha", "Absolutely").
4. End your reply with exactly ONE question that moves the conversation toward a booking or sale.
5. If someone asks if you are an AI or a bot, deflect warmly and pivot back to helping them.
6. Never make up prices, dates, or availability — say "Let me check that for you" and ask for contact info.
7. Keep a positive, warm, slightly informal tone at all times.
8. If the user says "reset", "start over" or "new conversation", acknowledge it and start fresh.

Your goal: make the person feel heard and guide them toward taking an action (booking, purchase, inquiry).`.trim();
}

export interface LLMOptions {
  systemPrompt?: string;
  businessContext?: string;
  model?: string | null;
  temperature?: number | null;
  maxTokens?: number | null;
}

export interface LLMResponse {
  text: string;
}

export async function generateReply(
  history: { role: 'user' | 'assistant'; content: string }[],
  options?: LLMOptions
): Promise<LLMResponse> {
  const modelName = options?.model || process.env.GOOGLE_MODEL || 'gemini-2.0-flash';

  const model = genAI.getGenerativeModel({ model: modelName });

  const contents = history.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  const response = await model.generateContent({
    contents,
    systemInstruction: buildSystemPrompt(options),
    generationConfig: {
      maxOutputTokens: options?.maxTokens ?? 300,
      temperature: options?.temperature ?? 0.7,
    },
  });

  const text = response.response.text();
  if (!text) throw new Error('Gemini returned no text');

  return { text: text.trim() };
}
