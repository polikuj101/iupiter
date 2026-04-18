/**
 * Agent orchestrator — multi-tenant version
 *
 * Flow:
 *  1. Deduplicate via DB unique index on platform_message_id
 *  2. Upsert contact
 *  3. Get/create conversation
 *  4. Load history from DB
 *  5. Send typing indicator (Instagram/Messenger only)
 *  6. Generate reply via Gemini
 *  7. Dynamic typing delay
 *  8. Persist messages to DB
 *  9. Send reply via Meta API
 */

import { upsertContact } from './db/contacts';
import { getOrCreateConversation } from './db/conversations';
import { getConversationHistory, insertMessage, isDuplicateMessage } from './db/messages';
import { generateReply } from './llm';
import { sendMessage, sendTypingIndicator, type Platform } from './meta-client';

// ─── Typing delay ──────────────────────────────────────────────

function typingDelayMs(text: string): number {
  const BASE_MS = 600;
  const CHARS_PER_SEC = 8;
  const MAX_MS = 5_000;
  return Math.min(BASE_MS + (text.length / CHARS_PER_SEC) * 1_000, MAX_MS);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Reset detection ───────────────────────────────────────────

const RESET_PHRASES = ['reset', 'start over', 'new conversation', 'restart', 'clear'];

function isResetCommand(text: string): boolean {
  const lower = text.trim().toLowerCase();
  return RESET_PHRASES.some((p) => lower === p || lower.startsWith(p + ' '));
}

// ─── Agent config ──────────────────────────────────────────────

export interface AgentConfig {
  id: string;
  orgId: string;
  name: string;
  systemPrompt?: string | null;
  businessContext?: string | null;
  llmModel?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChannelCredentials {
  platform: Platform;
  channelId: string | null;
  // WhatsApp
  whatsappToken?: string;
  phoneNumberId?: string;
  // Instagram / Messenger
  pageAccessToken?: string;
}

export interface IncomingMessage {
  platform: Platform;
  senderId: string;          // platform_id of the sender
  messageId: string;         // for deduplication
  text: string;
  senderName?: string;
  agentConfig: AgentConfig;
  channelCredentials: ChannelCredentials;
}

// ─── Main handler ──────────────────────────────────────────────

export async function handleIncomingMessage(msg: IncomingMessage): Promise<void> {
  const {
    platform, senderId, messageId, text, senderName,
    agentConfig, channelCredentials,
  } = msg;

  const { orgId } = agentConfig;
  const startedAt = Date.now();

  // 1. Deduplicate via DB
  const alreadyProcessed = await isDuplicateMessage(messageId);
  if (alreadyProcessed) {
    console.log(`[agent] duplicate ignored: ${messageId}`);
    return;
  }

  // 2. Handle reset command
  if (isResetCommand(text)) {
    await sendMessage(platform, senderId, "Got it, starting fresh! How can I help you?", channelCredentials);
    return;
  }

  // 3. Upsert contact
  const contact = await upsertContact({
    orgId,
    platform,
    platformId: senderId,
    name: senderName,
  });

  // 4. Get or create conversation
  const conversation = await getOrCreateConversation({
    orgId,
    agentId: agentConfig.id,
    contactId: contact.id,
    channelId: channelCredentials.channelId,
    platform,
  });

  // 5. Persist user message
  await insertMessage({
    conversationId: conversation.id,
    orgId,
    role: 'user',
    content: text,
    platformMessageId: messageId,
  });

  // 6. Load history from DB
  const history = await getConversationHistory(conversation.id);

  // 7. Typing indicator (fire-and-forget)
  sendTypingIndicator(platform, senderId, channelCredentials).catch(() => {});

  // 8. Generate reply
  let replyText: string;
  try {
    const result = await generateReply(history, {
      systemPrompt: agentConfig.systemPrompt ?? undefined,
      businessContext: agentConfig.businessContext ?? undefined,
      model: agentConfig.llmModel,
      temperature: agentConfig.temperature,
      maxTokens: agentConfig.maxTokens,
    });
    replyText = result.text;
    console.log(`[agent] reply: ${replyText.length} chars | org:${orgId}`);
  } catch (err) {
    console.error('[agent] LLM error:', err);
    replyText = "Sorry, something went wrong on my end — give me a moment and try again!";
  }

  const responseTimeMs = Date.now() - startedAt;

  // 9. Typing delay
  await sleep(typingDelayMs(replyText));

  // 10. Persist assistant message
  await insertMessage({
    conversationId: conversation.id,
    orgId,
    role: 'assistant',
    content: replyText,
    responseTimeMs,
  });

  // 11. Send reply
  await sendMessage(platform, senderId, replyText, channelCredentials);
}
