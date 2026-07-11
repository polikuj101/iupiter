'use client';

import { useRef, useState, useCallback } from 'react';
import { GoogleGenAI, Modality, type Session, type LiveServerMessage } from '@google/genai';

const VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'] as const;

const DEFAULT_PROMPT = `You are a witty, over-the-top voice character for a comedy skit. Stay fully in character, be expressive and funny, and riff naturally with whoever you're talking to. Keep responses short and punchy — this is a live conversation, not a monologue.`;

// Mic capture runs at the browser's native rate (commonly 48kHz); Gemini's
// Live API expects 16kHz PCM16 input. Its own audio output (24kHz) doesn't
// need manual resampling — an AudioBuffer can be created at any sample rate
// and the Web Audio graph resamples it automatically on playback, at full
// quality, no extra code needed.
const GEMINI_INPUT_RATE = 16000;
const GEMINI_OUTPUT_RATE = 24000;
const MIC_BATCH_SAMPLES = 4096;

function floatTo16BitPCM(float32: Float32Array): ArrayBuffer {
  const buffer = new ArrayBuffer(float32.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToInt16(base64: string): Int16Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}

function resampleFloat32(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const newLength = Math.round(input.length / ratio);
  const out = new Float32Array(newLength);
  for (let i = 0; i < newLength; i++) {
    const idx = i * ratio;
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, input.length - 1);
    const frac = idx - lo;
    out[i] = input[lo] + (input[hi] - input[lo]) * frac;
  }
  return out;
}

type Status = 'idle' | 'connecting' | 'live' | 'error';
interface TranscriptLine { role: 'you' | 'ai'; text: string }

export default function VoiceDemoPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_PROMPT);
  const [voiceName, setVoiceName] = useState<(typeof VOICES)[number]>('Puck');
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const nextPlayTimeRef = useRef(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const micBatchRef = useRef<Float32Array[]>([]);
  const micBatchLengthRef = useRef(0);
  const recordDestRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const appendTranscript = useCallback((role: TranscriptLine['role'], text: string) => {
    if (!text) return;
    setTranscript((prev) => {
      const last = prev[prev.length - 1];
      // Gemini streams transcription incrementally — keep appending to the
      // same line until the other speaker's role interrupts it.
      if (last && last.role === role) {
        return [...prev.slice(0, -1), { role, text: last.text + text }];
      }
      return [...prev, { role, text }];
    });
  }, []);

  const flushMicBatch = useCallback(() => {
    const batch = micBatchRef.current;
    const total = micBatchLengthRef.current;
    if (total === 0) return;
    const merged = new Float32Array(total);
    let offset = 0;
    for (const chunk of batch) { merged.set(chunk, offset); offset += chunk.length; }
    micBatchRef.current = [];
    micBatchLengthRef.current = 0;

    const ctx = audioContextRef.current;
    const session = sessionRef.current;
    if (!ctx || !session) return;

    const resampled = resampleFloat32(merged, ctx.sampleRate, GEMINI_INPUT_RATE);
    const pcm = floatTo16BitPCM(resampled);
    session.sendRealtimeInput({
      audio: { data: arrayBufferToBase64(pcm), mimeType: `audio/pcm;rate=${GEMINI_INPUT_RATE}` },
    });
  }, []);

  const playAudioChunk = useCallback((base64Pcm24k: string) => {
    const ctx = audioContextRef.current;
    const recordDest = recordDestRef.current;
    if (!ctx) return;

    const int16 = base64ToInt16(base64Pcm24k);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 0x8000;

    // Created at Gemini's native 24kHz — the Web Audio graph resamples to
    // the context's own rate automatically on playback, at full quality.
    const buffer = ctx.createBuffer(1, float32.length, GEMINI_OUTPUT_RATE);
    buffer.copyToChannel(float32, 0);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    if (recordDest) source.connect(recordDest);

    const startAt = Math.max(nextPlayTimeRef.current, ctx.currentTime);
    source.start(startAt);
    nextPlayTimeRef.current = startAt + buffer.duration;
    scheduledSourcesRef.current.push(source);
    source.onended = () => {
      scheduledSourcesRef.current = scheduledSourcesRef.current.filter((s) => s !== source);
    };
  }, []);

  const handleInterrupted = useCallback(() => {
    for (const source of scheduledSourcesRef.current) {
      try { source.stop(); } catch { /* already stopped */ }
    }
    scheduledSourcesRef.current = [];
    nextPlayTimeRef.current = audioContextRef.current?.currentTime ?? 0;
  }, []);

  const handleMessage = useCallback((msg: LiveServerMessage) => {
    if (msg.data) playAudioChunk(msg.data);
    if (msg.serverContent?.interrupted) handleInterrupted();
    const inputText = msg.serverContent?.inputTranscription?.text;
    const outputText = msg.serverContent?.outputTranscription?.text;
    if (inputText) appendTranscript('you', inputText);
    if (outputText) appendTranscript('ai', outputText);
  }, [playAudioChunk, handleInterrupted, appendTranscript]);

  const startCall = useCallback(async () => {
    setStatus('connecting');
    setErrorMsg('');
    setTranscript([]);
    setRecordingUrl(null);

    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = micStream;

      const ctx = new AudioContext();
      audioContextRef.current = ctx;
      nextPlayTimeRef.current = ctx.currentTime;

      const recordDest = ctx.createMediaStreamDestination();
      recordDestRef.current = recordDest;
      recordedChunksRef.current = [];
      const recorder = new MediaRecorder(recordDest.stream);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) recordedChunksRef.current.push(e.data); };
      mediaRecorderRef.current = recorder;
      recorder.start();

      await ctx.audioWorklet.addModule('/mic-processor.js');
      const micSource = ctx.createMediaStreamSource(micStream);
      micSource.connect(recordDest); // capture your side of the conversation too
      const worklet = new AudioWorkletNode(ctx, 'mic-processor');
      workletNodeRef.current = worklet;
      worklet.port.onmessage = (e: MessageEvent<Float32Array>) => {
        micBatchRef.current.push(e.data);
        micBatchLengthRef.current += e.data.length;
        if (micBatchLengthRef.current >= MIC_BATCH_SAMPLES) flushMicBatch();
      };
      micSource.connect(worklet);

      const tokenRes = await fetch('/api/voice-demo/token', { method: 'POST' });
      if (!tokenRes.ok) throw new Error(`Failed to get session token (${tokenRes.status})`);
      const { token, model } = await tokenRes.json() as { token: string; model: string };

      const ai = new GoogleGenAI({ apiKey: token, httpOptions: { apiVersion: 'v1alpha' } });

      let setupDone = false;
      await new Promise<void>((resolve, reject) => {
        ai.live.connect({
          model,
          config: {
            responseModalities: [Modality.AUDIO],
            systemInstruction: systemPrompt,
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName } } },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
          },
          callbacks: {
            onopen: () => {},
            onmessage: (msg) => {
              if (!setupDone) {
                if (msg.setupComplete) { setupDone = true; resolve(); }
                return;
              }
              handleMessage(msg);
            },
            onerror: (e) => { if (!setupDone) reject(new Error(e?.message || 'connection error')); },
            onclose: (e) => { if (!setupDone) reject(new Error(`closed: ${e?.code} ${e?.reason || ''}`)); },
          },
        }).then((s) => { sessionRef.current = s; }).catch((e) => { if (!setupDone) reject(e); });
      });

      setStatus('live');
    } catch (err) {
      console.error('[voice-demo] failed to start:', err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setStatus('error');
      stopCallInternal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemPrompt, voiceName, handleMessage, flushMicBatch]);

  function stopCallInternal() {
    flushMicBatch();
    sessionRef.current?.close();
    sessionRef.current = null;
    workletNodeRef.current?.disconnect();
    workletNodeRef.current = null;
    micStreamRef.current?.getTracks().forEach((t) => t.stop());
    micStreamRef.current = null;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        setRecordingUrl(URL.createObjectURL(blob));
      };
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    audioContextRef.current?.close();
    audioContextRef.current = null;
  }

  const stopCall = useCallback(() => {
    stopCallInternal();
    setStatus('idle');
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Voice Demo</h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Talk live to Gemini&apos;s native audio model, right in your browser — no phone call, no cost.
        Runs directly against your Google account&apos;s free tier.
      </p>

      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Persona / system prompt</label>
      <textarea
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        disabled={status === 'live' || status === 'connecting'}
        rows={4}
        style={{ width: '100%', padding: 10, fontSize: 14, borderRadius: 8, border: '1px solid #ccc', marginBottom: 16, fontFamily: 'inherit' }}
      />

      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Voice</label>
      <select
        value={voiceName}
        onChange={(e) => setVoiceName(e.target.value as (typeof VOICES)[number])}
        disabled={status === 'live' || status === 'connecting'}
        style={{ padding: 8, fontSize: 14, borderRadius: 8, border: '1px solid #ccc', marginBottom: 20 }}
      >
        {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {status === 'idle' || status === 'error' ? (
          <button onClick={startCall} style={{ padding: '10px 20px', borderRadius: 100, background: '#111', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            Start talking
          </button>
        ) : (
          <button onClick={stopCall} disabled={status === 'connecting'} style={{ padding: '10px 20px', borderRadius: 100, background: '#dc2626', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            {status === 'connecting' ? 'Connecting…' : 'Stop'}
          </button>
        )}
        <span style={{ alignSelf: 'center', fontSize: 13, color: status === 'live' ? '#16a34a' : '#666' }}>
          {status === 'live' && '● Live — speak naturally'}
          {status === 'connecting' && 'Connecting…'}
          {status === 'error' && `Error: ${errorMsg}`}
        </span>
      </div>

      {recordingUrl && (
        <a href={recordingUrl} download="voice-demo-recording.webm" style={{ display: 'inline-block', marginBottom: 20, fontSize: 14, color: '#2563eb' }}>
          ⬇ Download the recording (for your skit)
        </a>
      )}

      <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 16, minHeight: 200, background: '#fafafa' }}>
        {transcript.length === 0 && <p style={{ color: '#999', fontSize: 13 }}>Transcript will appear here once you start talking.</p>}
        {transcript.map((line, i) => (
          <p key={i} style={{ margin: '0 0 8px', fontSize: 14 }}>
            <strong style={{ color: line.role === 'you' ? '#2563eb' : '#111' }}>{line.role === 'you' ? 'You: ' : 'AI: '}</strong>
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
