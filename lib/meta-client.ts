/**
 * Meta Graph API client — multi-tenant version
 *
 * Credentials are passed as parameters (not env vars) so each tenant
 * can have their own tokens from the `channels` table.
 *
 * Platforms:
 *   - whatsapp   → WhatsApp Business Cloud API
 *   - instagram  → Messenger Platform (object: instagram)
 *   - messenger  → Messenger Platform (object: page)
 */

const GRAPH_URL = 'https://graph.facebook.com/v21.0';

export type Platform = 'instagram' | 'whatsapp' | 'messenger';

export interface ChannelCredentials {
  platform: Platform;
  channelId: string | null;
  // WhatsApp
  whatsappToken?: string;
  phoneNumberId?: string;
  // Instagram / Messenger (same Messenger Platform API)
  pageAccessToken?: string;
}

// ─── Messenger Platform (Instagram + Facebook Messenger) ──────

async function sendMessengerPlatformMessage(
  recipientId: string,
  text: string,
  pageAccessToken: string
): Promise<void> {
  const res = await fetch(`${GRAPH_URL}/me/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${pageAccessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Messenger send failed [${res.status}]: ${body}`);
  }
}

async function sendMessengerTyping(
  recipientId: string,
  pageAccessToken: string
): Promise<void> {
  await fetch(`${GRAPH_URL}/me/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${pageAccessToken}`,
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      sender_action: 'typing_on',
    }),
  }).catch(() => {});
}

// ─── WhatsApp Business Cloud API ──────────────────────────────

async function sendWhatsAppMessage(
  toPhone: string,
  text: string,
  token: string,
  phoneNumberId: string
): Promise<void> {
  const res = await fetch(`${GRAPH_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: toPhone,
      type: 'text',
      text: { body: text },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WhatsApp send failed [${res.status}]: ${body}`);
  }
}

// ─── Unified dispatchers ──────────────────────────────────────

/** Resolve credentials: from params first, then fall back to env vars */
function resolveCredentials(
  platform: Platform,
  creds: ChannelCredentials
): { token: string; phoneNumberId?: string } {
  if (platform === 'whatsapp') {
    const token = creds.whatsappToken || process.env.WHATSAPP_TOKEN || '';
    const phoneNumberId = creds.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '';
    return { token, phoneNumberId };
  }
  // instagram / messenger
  const token = creds.pageAccessToken || process.env.META_PAGE_ACCESS_TOKEN || '';
  return { token };
}

export async function sendMessage(
  platform: Platform,
  recipientId: string,
  text: string,
  creds: ChannelCredentials
): Promise<void> {
  const { token, phoneNumberId } = resolveCredentials(platform, creds);

  if (platform === 'whatsapp') {
    if (!token || !phoneNumberId) throw new Error('Missing WhatsApp credentials');
    await sendWhatsAppMessage(recipientId, text, token, phoneNumberId);
  } else {
    if (!token) throw new Error('Missing Page Access Token');
    await sendMessengerPlatformMessage(recipientId, text, token);
  }
}

export async function sendTypingIndicator(
  platform: Platform,
  recipientId: string,
  creds: ChannelCredentials
): Promise<void> {
  if (platform === 'whatsapp') return; // WhatsApp has no typing API

  const { token } = resolveCredentials(platform, creds);
  if (!token) return;
  await sendMessengerTyping(recipientId, token);
}
