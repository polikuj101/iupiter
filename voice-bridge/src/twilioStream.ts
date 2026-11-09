import type { WebSocket, RawData } from 'ws';
import type { Session } from '@google/genai';
import { fetchVoiceSessionConfig, bookAppointment } from './config.js';
import { openGeminiLiveSession } from './geminiLive.js';
import { transferCall } from './twilioRest.js';
import { twilioAudioToGeminiInput, geminiOutputToTwilioAudio } from './audioCodec.js';

interface TwilioStartEvent {
  event: 'start';
  start: { streamSid: string; callSid: string; customParameters?: Record<string, string> };
}
interface TwilioMediaEvent { event: 'media'; media?: { payload?: string } }
interface TwilioStopEvent { event: 'stop' }
interface TwilioConnectedEvent { event: 'connected' }
type TwilioEvent = TwilioStartEvent | TwilioMediaEvent | TwilioStopEvent | TwilioConnectedEvent;

/** One Gemini Live session, bridged to one Twilio Media Stream WebSocket, for the duration of a single phone call. */
export async function handleTwilioStream(ws: WebSocket): Promise<void> {
  let streamSid: string | null = null;
  let callSid: string | null = null;
  let geminiSession: Session | null = null;
  let forwardPhone: string | null = null;
  let closed = false;

  const safeSend = (payload: object) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(payload));
  };

  function cleanup() {
    if (closed) return;
    closed = true;
    geminiSession?.close();
    console.log(`[bridge] call ended: ${callSid ?? 'unknown'}`);
  }

  async function handleFunctionCall(name: string, args: Record<string, unknown>, id: string) {
    if (!geminiSession) return;

    if (name === 'book_appointment') {
      try {
        const result = await bookAppointment({
          customerName: String(args.customerName ?? ''),
          date: String(args.date ?? ''),
          time: String(args.time ?? ''),
          service: args.service ? String(args.service) : undefined,
          phone: args.phone ? String(args.phone) : undefined,
        });
        geminiSession.sendToolResponse({ functionResponses: [{ id, name, response: result }] });
      } catch (err) {
        console.error('[bridge] book_appointment failed:', err);
        geminiSession.sendToolResponse({
          functionResponses: [{ id, name, response: { success: false, error: String(err) } }],
        });
      }
      return;
    }

    if (name === 'transfer_to_agent') {
      if (!callSid || !forwardPhone) {
        geminiSession.sendToolResponse({
          functionResponses: [{ id, name, response: { success: false, error: 'No forward number configured for this agent' } }],
        });
        return;
      }
      try {
        await transferCall(callSid, forwardPhone);
        // Twilio re-evaluates the live call with new TwiML momentarily, which
        // ends this <Stream> and closes our WebSocket — nothing more to do.
      } catch (err) {
        console.error('[bridge] transfer failed:', err);
        geminiSession.sendToolResponse({
          functionResponses: [{ id, name, response: { success: false, error: String(err) } }],
        });
      }
      return;
    }

    geminiSession.sendToolResponse({
      functionResponses: [{ id, name, response: { success: false, error: `Unknown function: ${name}` } }],
    });
  }

  ws.on('message', async (raw: RawData) => {
    // A malformed frame or a downstream failure here must never throw
    // unhandled — this listener runs per-message for the lifetime of the
    // call, and an uncaught exception/rejection inside it can crash the
    // whole process, taking down every other concurrent call with it.
    try {
      await handleMessage(raw);
    } catch (err) {
      console.error(`[bridge] error handling message for call ${callSid ?? 'unknown'}:`, err);
    }
  });

  async function handleMessage(raw: RawData): Promise<void> {
    let msg: TwilioEvent;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.event) {
      case 'connected':
        break;

      case 'start': {
        // This WS endpoint accepts any connection — anyone who learns the
        // URL (e.g. by POSTing to the public incoming-webhook, which embeds
        // it in the returned TwiML) could otherwise open a real, billed
        // Gemini session and invoke book_appointment/transfer_to_agent
        // without ever placing an actual phone call. The webhook embeds
        // BRIDGE_SHARED_SECRET as a <Stream><Parameter>, which Twilio
        // delivers back here in customParameters — reject anything that
        // doesn't have it.
        const token = msg.start.customParameters?.token;
        const expected = process.env.BRIDGE_SHARED_SECRET;
        if (!expected || token !== expected) {
          console.warn('[bridge] rejected stream with missing/invalid token');
          ws.close(1008, 'unauthorized');
          return;
        }

        streamSid = msg.start.streamSid;
        callSid = msg.start.callSid;
        console.log(`[bridge] call started: ${callSid}`);

        try {
          const cfg = await fetchVoiceSessionConfig();
          forwardPhone = cfg.forwardPhone;

          geminiSession = await openGeminiLiveSession(cfg.systemInstruction, cfg.tools, {
            onAudioChunk: (base64Pcm24k) => {
              if (!streamSid) return;
              safeSend({ event: 'media', streamSid, media: { payload: geminiOutputToTwilioAudio(base64Pcm24k) } });
            },
            onInterrupted: () => {
              // Caller started talking over the AI — clear whatever's still
              // queued for playback on Twilio's side so it stops immediately.
              if (streamSid) safeSend({ event: 'clear', streamSid });
            },
            onFunctionCall: (name, args, id) => {
              handleFunctionCall(name, args, id).catch((err) => {
                console.error(`[bridge] unhandled error in function call ${name}:`, err);
              });
            },
            onSessionClosed: (reason) => {
              console.log(`[bridge] Gemini session closed: ${reason}`);
              if (!closed) ws.close();
            },
          });
        } catch (err) {
          console.error('[bridge] failed to start Gemini session:', err);
          ws.close();
        }
        break;
      }

      case 'media': {
        if (!geminiSession) return; // still connecting — drop early frames
        const payload = msg.media?.payload;
        if (!payload) return; // malformed/empty frame — drop rather than throw
        geminiSession.sendRealtimeInput({
          audio: { data: twilioAudioToGeminiInput(payload), mimeType: 'audio/pcm;rate=16000' },
        });
        break;
      }

      case 'stop':
        cleanup();
        break;
    }
  }

  ws.on('close', cleanup);
  ws.on('error', (err: Error) => {
    console.error('[bridge] Twilio WS error:', err);
    cleanup();
  });
}
