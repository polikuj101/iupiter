import { GoogleGenAI, Modality, type Session, type LiveServerMessage } from '@google/genai';
import type { FunctionDeclarationJson } from './config.js';

const ai = new GoogleGenAI({ apiKey: requireEnv('GOOGLE_API_KEY') });

// Same lesson as the main app's lib/llm.ts: Google deprecates model IDs
// outright (gemini-2.5-flash and -lite were both retired mid-2026, and the
// Live model family has already been through 09-2025 / 12-2025 previews).
// Don't hardcode one name and hope — try the primary, fall back once.
const PRIMARY_MODEL = process.env.GEMINI_LIVE_MODEL || 'gemini-3.1-flash-live-preview';
const FALLBACK_MODEL = process.env.GEMINI_LIVE_FALLBACK_MODEL || 'gemini-2.5-flash-native-audio-preview-12-2025';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

function errMsg(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (e && typeof e === 'object' && 'reason' in e) return String((e as { reason?: unknown }).reason);
  return String(e);
}

export interface LiveSessionHandlers {
  onAudioChunk: (base64Pcm24k: string) => void;
  onInterrupted: () => void;
  onFunctionCall: (name: string, args: Record<string, unknown>, id: string) => void;
  onSessionClosed: (reason: string) => void;
}

/**
 * Opens a Gemini Live session. The connect() promise resolves on the raw
 * WebSocket handshake (onopen), *before* the server confirms the requested
 * model is actually valid — an invalid/deprecated model closes the socket a
 * moment later (code 1008) instead of rejecting connect() itself. So we
 * wait for the first `setupComplete` message as the real "ready" signal, and
 * treat an early close/error as connection failure eligible for fallback.
 */
export async function openGeminiLiveSession(
  systemInstruction: string,
  tools: FunctionDeclarationJson[],
  handlers: LiveSessionHandlers,
): Promise<Session> {
  const config = {
    responseModalities: [Modality.AUDIO],
    systemInstruction,
    // Same JSON schema shape (OpenAPI-subset string enums like "OBJECT",
    // "STRING") as @google/generative-ai's SchemaType used in the main app —
    // passed through as-is from voice-session-config, no transform needed.
    tools: tools.length > 0 ? [{ functionDeclarations: tools as never[] }] : undefined,
  };

  async function connectOnce(model: string): Promise<Session> {
    let setupDone = false;
    let resolveSetup!: () => void;
    let rejectSetup!: (err: Error) => void;
    const setupSettled = new Promise<void>((res, rej) => { resolveSetup = res; rejectSetup = rej; });

    const handleMessage = (msg: LiveServerMessage) => {
      if (!setupDone) {
        if (msg.setupComplete) { setupDone = true; resolveSetup(); }
        return;
      }

      if (msg.data) handlers.onAudioChunk(msg.data);
      if (msg.serverContent?.interrupted) handlers.onInterrupted();
      for (const fc of msg.toolCall?.functionCalls ?? []) {
        handlers.onFunctionCall(fc.name ?? '', fc.args ?? {}, fc.id ?? '');
      }
    };

    // Awaiting connect() itself guarantees `session` is assigned before we
    // ever touch it below — no shared mutable variable racing against the
    // onmessage callback, which is what caused an earlier version of this
    // function to try to resolve with an as-yet-unassigned session.
    const session = await ai.live.connect({
      model,
      config,
      callbacks: {
        onopen: () => {},
        onmessage: handleMessage,
        onerror: (e) => { if (!setupDone) rejectSetup(new Error(errMsg(e))); },
        onclose: (e) => {
          if (!setupDone) rejectSetup(new Error(`closed before setup: ${errMsg(e)}`));
          else handlers.onSessionClosed(errMsg(e));
        },
      },
    });

    await setupSettled; // throws if the model was rejected or closed early
    return session;
  }

  try {
    return await connectOnce(PRIMARY_MODEL);
  } catch (err) {
    console.warn(`[gemini-live] primary model ${PRIMARY_MODEL} failed (${errMsg(err)}), falling back to ${FALLBACK_MODEL}`);
    return await connectOnce(FALLBACK_MODEL);
  }
}
