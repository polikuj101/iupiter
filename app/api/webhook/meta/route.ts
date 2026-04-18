/**
 * Meta Webhook — multi-tenant version
 *
 * GET  → Verification challenge
 * POST → Route incoming events to the correct org/agent
 *
 * Multi-tenant routing:
 *   WhatsApp  → lookup by phone_number_id  in channels.config
 *   Instagram → lookup by page_id          in channels.config
 *   Messenger → lookup by page_id          in channels.config
 *
 * Falls back to env-var credentials when no channel record is found (dev mode).
 */

import { NextRequest, NextResponse } from 'next/server';
import { handleIncomingMessage } from '@/lib/agent';
import { getChannelByPlatformId } from '@/lib/db/channels';
import type { Platform, ChannelCredentials } from '@/lib/meta-client';

// ─── GET — Webhook verification ───────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const mode      = searchParams.get('hub.mode');
  const token     = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    console.log('[webhook] verified');
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

// ─── POST — Incoming events ───────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // Respond immediately — process async
  processEvent(body).catch((err) =>
    console.error('[webhook] processing error:', err)
  );

  return new NextResponse('EVENT_RECEIVED', { status: 200 });
}

// ─── Event router ─────────────────────────────────────────────

async function processEvent(body: Record<string, unknown>): Promise<void> {
  const objectType = body.object as string | undefined;

  if (objectType === 'instagram') {
    await processMessengerPlatformEvents(body, 'instagram');
  } else if (objectType === 'page') {
    await processMessengerPlatformEvents(body, 'messenger');
  } else if (objectType === 'whatsapp_business_account') {
    await processWhatsAppEvents(body);
  } else {
    console.log(`[webhook] unknown object type: ${objectType}`);
  }
}

// ─── Instagram + Messenger (same Messenger Platform JSON) ─────

async function processMessengerPlatformEvents(
  body: Record<string, unknown>,
  platform: 'instagram' | 'messenger'
): Promise<void> {
  const entries = body.entry as Array<Record<string, unknown>> | undefined;
  if (!entries) return;

  for (const entry of entries) {
    const pageId   = entry.id as string | undefined;
    const events   = entry.messaging as Array<Record<string, unknown>> | undefined;
    if (!events) continue;

    // Resolve org/agent via channel lookup
    const { agentConfig, credentials } = await resolveChannelConfig(platform, pageId);

    for (const event of events) {
      const message = event.message as Record<string, unknown> | undefined;
      if (!message || message.is_echo) continue;

      const senderId  = (event.sender as Record<string, string>)?.id;
      const messageId = message.mid as string | undefined;
      const text      = message.text as string | undefined;
      if (!senderId || !messageId || !text) continue;

      console.log(`[${platform}] from=${senderId} text="${text}"`);

      await handleIncomingMessage({
        platform,
        senderId,
        messageId,
        text,
        agentConfig,
        channelCredentials: credentials,
      });
    }
  }
}

// ─── WhatsApp ─────────────────────────────────────────────────

async function processWhatsAppEvents(body: Record<string, unknown>): Promise<void> {
  const entries = body.entry as Array<Record<string, unknown>> | undefined;
  if (!entries) return;

  for (const entry of entries) {
    const changes = entry.changes as Array<Record<string, unknown>> | undefined;
    if (!changes) continue;

    for (const change of changes) {
      if (change.field !== 'messages') continue;

      const value    = change.value as Record<string, unknown> | undefined;
      const messages = value?.messages as Array<Record<string, unknown>> | undefined;
      if (!messages) continue;

      const metadata      = value?.metadata as Record<string, string> | undefined;
      const phoneNumberId = metadata?.phone_number_id;

      const { agentConfig, credentials } = await resolveChannelConfig('whatsapp', phoneNumberId);

      for (const message of messages) {
        if (message.type !== 'text') continue;

        const senderId  = message.from as string | undefined;
        const messageId = message.id  as string | undefined;
        const textObj   = message.text as Record<string, string> | undefined;
        const text      = textObj?.body;
        if (!senderId || !messageId || !text) continue;

        console.log(`[whatsapp] from=${senderId} text="${text}"`);

        await handleIncomingMessage({
          platform: 'whatsapp',
          senderId,
          messageId,
          text,
          agentConfig,
          channelCredentials: credentials,
        });
      }
    }
  }
}

// ─── Channel resolution ───────────────────────────────────────

async function resolveChannelConfig(
  platform: Platform,
  platformIdentifier: string | undefined
): Promise<{
  agentConfig: import('@/lib/agent').AgentConfig;
  credentials: ChannelCredentials;
}> {
  // Try DB lookup first
  if (platformIdentifier) {
    const channel = await getChannelByPlatformId(platform, platformIdentifier);
    if (channel && channel.agents && channel.organizations) {
      const agent = channel.agents as Record<string, unknown>;
      const org   = channel.organizations as Record<string, unknown>;

      return {
        agentConfig: {
          id:              agent.id as string,
          orgId:           org.id as string,
          name:            agent.name as string,
          systemPrompt:    agent.system_prompt as string | null,
          businessContext: agent.business_context as string | null,
          llmModel:        agent.llm_model as string,
          temperature:     agent.temperature as number,
          maxTokens:       agent.max_tokens as number,
        },
        credentials: {
          platform,
          channelId:       channel.id,
          whatsappToken:   channel.config.whatsapp_token,
          phoneNumberId:   channel.config.phone_number_id,
          pageAccessToken: channel.config.page_access_token,
        },
      };
    }
  }

  // Fallback to env vars (dev mode / single-tenant)
  console.log('[webhook] no channel record found, falling back to env vars');
  return {
    agentConfig: {
      id:    'dev-agent',
      orgId: 'dev-org',
      name:  'Dev Agent',
      businessContext: process.env.BUSINESS_CONTEXT,
    },
    credentials: {
      platform,
      channelId:       null,
      whatsappToken:   process.env.WHATSAPP_TOKEN,
      phoneNumberId:   process.env.WHATSAPP_PHONE_NUMBER_ID,
      pageAccessToken: process.env.META_PAGE_ACCESS_TOKEN,
    },
  };
}
