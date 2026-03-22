import OpenAI from "openai";
import type { AgentConfig, Message } from "../types";
import { buildSystemPrompt } from "./prompt-builder";

function getGrokClient(): OpenAI | null {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;
  return new OpenAI({ apiKey: key, baseURL: "https://api.x.ai/v1" });
}

function getGeminiClient(): OpenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  return new OpenAI({
    apiKey: key,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });
}

export async function streamChat(
  messages: Message[],
  agentConfig: AgentConfig
): Promise<ReadableStream<Uint8Array>> {
  const systemPrompt = buildSystemPrompt(agentConfig);

  const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // Try Grok first, then Gemini
  const grok = getGrokClient();
  const gemini = getGeminiClient();

  let stream: AsyncIterable<OpenAI.ChatCompletionChunk>;

  try {
    if (grok) {
      stream = await grok.chat.completions.create({
        model: process.env.GROK_MODEL ?? "grok-3-mini-fast",
        messages: openaiMessages,
        max_tokens: 512,
        stream: true,
      });
    } else if (gemini) {
      stream = await gemini.chat.completions.create({
        model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
        messages: openaiMessages,
        max_tokens: 512,
        stream: true,
      });
    } else {
      throw new Error("No API key configured (XAI_API_KEY or GEMINI_API_KEY)");
    }
  } catch (err) {
    // Fallback to Gemini if Grok fails
    if (grok && gemini) {
      console.warn("[AI] Grok failed, falling back to Gemini:", err);
      stream = await gemini.chat.completions.create({
        model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
        messages: openaiMessages,
        max_tokens: 512,
        stream: true,
      });
    } else {
      throw err;
    }
  }

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices?.[0]?.delta?.content;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });
}
