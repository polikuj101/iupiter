/**
 * In-memory conversation store with per-sender history and TTL cleanup.
 * For production replace with Redis (ioredis) using the same interface.
 *
 * Key: sender_id (Instagram PSID or WhatsApp phone number)
 * Value: ordered array of {role, content} messages for the LLM context window
 */

export type Role = 'user' | 'assistant';

export interface Message {
  role: Role;
  content: string;
}

interface ConversationEntry {
  messages: Message[];
  lastActivity: number; // unix ms
}

// How long an idle conversation is kept in memory (24 hours)
const TTL_MS = 24 * 60 * 60 * 1000;

// Max messages per conversation to cap context window cost
const MAX_MESSAGES = 40;

class ConversationStore {
  private store = new Map<string, ConversationEntry>();

  /** Append a user or assistant turn for the given sender. */
  add(senderId: string, role: Role, content: string): void {
    const entry = this.store.get(senderId) ?? { messages: [], lastActivity: 0 };

    entry.messages.push({ role, content });
    entry.lastActivity = Date.now();

    // Keep the last MAX_MESSAGES turns (always preserve full pairs)
    if (entry.messages.length > MAX_MESSAGES) {
      entry.messages = entry.messages.slice(-MAX_MESSAGES);
    }

    this.store.set(senderId, entry);
  }

  /** Return the full message history for the given sender (newest last). */
  getHistory(senderId: string): Message[] {
    return this.store.get(senderId)?.messages ?? [];
  }

  /** Remove a conversation (e.g. user sent "reset" or "start over"). */
  clear(senderId: string): void {
    this.store.delete(senderId);
  }

  /** Evict conversations that have been silent longer than TTL_MS. */
  evictStale(): void {
    const cutoff = Date.now() - TTL_MS;
    for (const [id, entry] of this.store.entries()) {
      if (entry.lastActivity < cutoff) {
        this.store.delete(id);
      }
    }
  }
}

// Singleton — survives across hot-reloads in dev because of Next.js module cache
const globalForStore = globalThis as unknown as { conversationStore?: ConversationStore };
export const conversationStore =
  globalForStore.conversationStore ?? (globalForStore.conversationStore = new ConversationStore());

// Run eviction every 30 minutes in the background
if (typeof setInterval !== 'undefined') {
  setInterval(() => conversationStore.evictStale(), 30 * 60 * 1000);
}
