'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { GoogleGenAI, Modality, type Session, type LiveServerMessage } from '@google/genai';
import {
  DEFAULT_VOICE_AGENT_PROFILE, CURRENCIES, TIMEZONES,
  buildVoiceAgentSystemPrompt, explainAgentDesign,
  type VoiceAgentProfile,
} from '@/lib/voice-agent-profile';

const VOICES = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Aoede'] as const;
const INK = '#111';
const MUTED = '#666';

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

type Step = 'info' | 'explain' | 'building' | 'call';
type CallStatus = 'idle' | 'connecting' | 'live' | 'error';
interface TranscriptLine { role: 'you' | 'ai'; text: string }

const BUILD_CHECKLIST = [
  'Choosing the right model and voice for your agent…',
  'Generating the system prompt from your business info…',
  'Setting up call handling and guardrails…',
  'Final touches…',
];

const WAIT_TIPS = [
  '💡 Try asking about a specific neighborhood or school district.',
  '💡 Ask it to book you a call — see how it closes.',
  '💡 Interrupt it mid-sentence. It should stop and listen.',
  '💡 Ask if it\'s an AI — see how it handles that.',
];

export default function VoiceDemoPage() {
  const [step, setStep] = useState<Step>('info');
  const [profile, setProfile] = useState<VoiceAgentProfile>(DEFAULT_VOICE_AGENT_PROFILE);
  const [advantagesText, setAdvantagesText] = useState(DEFAULT_VOICE_AGENT_PROFILE.keyAdvantages.join('\n'));
  const [systemPrompt, setSystemPrompt] = useState('');
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  // Call state (unchanged from the original single-page version)
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
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

  const updateProfile = (patch: Partial<VoiceAgentProfile>) => setProfile((p) => ({ ...p, ...patch }));

  const goToExplain = () => {
    const finalProfile = { ...profile, keyAdvantages: advantagesText.split('\n').map((s) => s.trim()).filter(Boolean) };
    setProfile(finalProfile);
    setSystemPrompt(buildVoiceAgentSystemPrompt(finalProfile));
    setStep('explain');
  };

  const appendTranscript = useCallback((role: TranscriptLine['role'], text: string) => {
    if (!text) return;
    setTranscript((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === role) return [...prev.slice(0, -1), { role, text: last.text + text }];
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
    session.sendRealtimeInput({ audio: { data: arrayBufferToBase64(pcm), mimeType: `audio/pcm;rate=${GEMINI_INPUT_RATE}` } });
  }, []);

  const playAudioChunk = useCallback((base64Pcm24k: string) => {
    const ctx = audioContextRef.current;
    const recordDest = recordDestRef.current;
    if (!ctx) return;

    const int16 = base64ToInt16(base64Pcm24k);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 0x8000;

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
    source.onended = () => { scheduledSourcesRef.current = scheduledSourcesRef.current.filter((s) => s !== source); };
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

  const startCall = useCallback(async () => {
    setCallStatus('connecting');
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
      micSource.connect(recordDest);
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
              if (!setupDone) { if (msg.setupComplete) { setupDone = true; resolve(); } return; }
              handleMessage(msg);
            },
            onerror: (e) => { if (!setupDone) reject(new Error(e?.message || 'connection error')); },
            onclose: (e) => { if (!setupDone) reject(new Error(`closed: ${e?.code} ${e?.reason || ''}`)); },
          },
        }).then((s) => { sessionRef.current = s; }).catch((e) => { if (!setupDone) reject(e); });
      });

      setCallStatus('live');
    } catch (err) {
      console.error('[voice-demo] failed to start:', err);
      setErrorMsg(err instanceof Error ? err.message : String(err));
      setCallStatus('error');
      stopCallInternal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [systemPrompt, voiceName, handleMessage, flushMicBatch]);

  const stopCall = useCallback(() => {
    stopCallInternal();
    setCallStatus('idle');
  }, []);

  return (
    // Explicit light background: the site body defaults to a dark theme, but this page is light-themed throughout.
    <div style={{ minHeight: '100vh', background: '#fff' }}>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '32px 20px', fontFamily: 'system-ui, sans-serif', color: INK }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4, color: INK }}>Set up your voice agent</h1>
        <p style={{ color: MUTED, marginBottom: 24 }}>
          Runs directly against your Google account&apos;s free tier — no phone call, no cost.
        </p>

        <StepDots step={step} />

      {step === 'info' && (
        <InfoStep
          profile={profile}
          advantagesText={advantagesText}
          onAdvantagesChange={setAdvantagesText}
          onChange={updateProfile}
          onNext={goToExplain}
        />
      )}

      {step === 'explain' && (
        <ExplainStep
          profile={profile}
          systemPrompt={systemPrompt}
          showEditor={showPromptEditor}
          onToggleEditor={() => setShowPromptEditor((v) => !v)}
          onPromptChange={setSystemPrompt}
          onBack={() => setStep('info')}
          onNext={() => setStep('building')}
        />
      )}

      {step === 'building' && (
        <BuildingStep agentName={profile.agentName} onDone={() => setStep('call')} />
      )}

      {step === 'call' && (
        <CallStep
          profile={profile}
          voiceName={voiceName}
          onVoiceChange={setVoiceName}
          status={callStatus}
          errorMsg={errorMsg}
          transcript={transcript}
          recordingUrl={recordingUrl}
          onStart={startCall}
          onStop={stopCall}
          onEditSetup={() => setStep('info')}
        />
      )}
      </div>
    </div>
  );
}

// ─── Step 1: business info + live preview ─────────────────────────────

function InfoStep({ profile, advantagesText, onAdvantagesChange, onChange, onNext }: {
  profile: VoiceAgentProfile;
  advantagesText: string;
  onAdvantagesChange: (v: string) => void;
  onChange: (patch: Partial<VoiceAgentProfile>) => void;
  onNext: () => void;
}) {
  const label: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: INK };
  const field: React.CSSProperties = { width: '100%', padding: 10, fontSize: 14, borderRadius: 8, border: '1px solid #ccc', marginBottom: 16, fontFamily: 'inherit', color: INK, background: '#fff' };

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 380px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 2, color: INK }}>Review the information</h2>
        <p style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>Fill this in for your agency — the preview updates live.</p>

        <label style={label}>Agent name</label>
        <input style={field} value={profile.agentName} onChange={(e) => onChange({ agentName: e.target.value })} />

        <label style={label}>Company name</label>
        <input style={field} value={profile.companyName} onChange={(e) => onChange({ companyName: e.target.value })} />

        <label style={label}>Description</label>
        <textarea style={{ ...field, minHeight: 60 }} value={profile.description} onChange={(e) => onChange({ description: e.target.value })} />

        <label style={label}>Main goal</label>
        <input style={field} value={profile.mainGoal} onChange={(e) => onChange({ mainGoal: e.target.value })} />

        <label style={label}>Key advantages (one per line)</label>
        <textarea style={{ ...field, minHeight: 70 }} value={advantagesText} onChange={(e) => onAdvantagesChange(e.target.value)} />

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 140px' }}>
            <label style={label}>Currency</label>
            <select style={field} value={profile.currency} onChange={(e) => onChange({ currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <label style={label}>Timezone</label>
            <select style={field} value={profile.timezone} onChange={(e) => onChange({ timezone: e.target.value })}>
              {TIMEZONES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 140px' }}>
            <label style={label}>Writing style</label>
            <select style={field} value={profile.writingStyle} onChange={(e) => onChange({ writingStyle: e.target.value as VoiceAgentProfile['writingStyle'] })}>
              <option value="casual">Casual</option>
              <option value="formal">Formal</option>
            </select>
          </div>
          <div style={{ flex: '1 1 140px' }}>
            <label style={label}>Tone</label>
            <select style={field} value={profile.formality} onChange={(e) => onChange({ formality: e.target.value as VoiceAgentProfile['formality'] })}>
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
            </select>
          </div>
        </div>

        <button onClick={onNext} style={{ padding: '10px 20px', borderRadius: 100, background: '#111', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
          Generate agent →
        </button>
      </div>

      <PreviewCard profile={profile} advantagesText={advantagesText} />
    </div>
  );
}

function PreviewCard({ profile, advantagesText }: { profile: VoiceAgentProfile; advantagesText: string }) {
  const advantages = advantagesText.split('\n').map((s) => s.trim()).filter(Boolean);
  return (
    <div style={{ flex: '1 1 260px', maxWidth: 320, border: '1px solid #eee', borderRadius: 16, padding: 20, background: '#fafafa', position: 'sticky', top: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#111', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
          {(profile.agentName || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 14, color: INK, margin: 0 }}>{profile.agentName || 'Agent'}</p>
          <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{profile.companyName || 'Company'}</p>
        </div>
      </div>
      <PreviewRow label="MY GOAL" value={profile.mainGoal} />
      <PreviewRow label={`ABOUT ${profile.companyName || 'COMPANY'}`.toUpperCase()} value={profile.description} />
      {advantages.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, marginBottom: 4, letterSpacing: 0.4 }}>KEY ADVANTAGES</p>
          {advantages.map((a, i) => <p key={i} style={{ fontSize: 12, color: INK, margin: '0 0 2px' }}>• {a}</p>)}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <Badge>{profile.timezone}</Badge>
        <Badge>{profile.currency}</Badge>
      </div>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: MUTED, marginBottom: 2, letterSpacing: 0.4 }}>{label}</p>
      <p style={{ fontSize: 12, color: INK, margin: 0 }}>{value || '—'}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span style={{ fontSize: 11, color: INK, border: '1px solid #ddd', borderRadius: 100, padding: '2px 10px' }}>{children}</span>;
}

// ─── Step 2: transparency / explanation ────────────────────────────────

function ExplainStep({ profile, systemPrompt, showEditor, onToggleEditor, onPromptChange, onBack, onNext }: {
  profile: VoiceAgentProfile;
  systemPrompt: string;
  showEditor: boolean;
  onToggleEditor: () => void;
  onPromptChange: (v: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const bullets = explainAgentDesign(profile);
  return (
    <div style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: INK }}>💡 How your agent was designed</h2>
      <p style={{ fontSize: 13, color: MUTED, marginBottom: 16 }}>
        It&apos;s worth reviewing this — the quality of the setup directly affects how well the agent performs on real calls.
      </p>
      <div style={{ border: '1px solid #eee', borderRadius: 12, padding: 18, background: '#fafafa', marginBottom: 16 }}>
        {bullets.map((b, i) => (
          <p key={i} style={{ fontSize: 13, color: INK, lineHeight: 1.5, margin: '0 0 12px' }}>{b}</p>
        ))}
      </div>

      <button onClick={onToggleEditor} style={{ fontSize: 13, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12 }}>
        {showEditor ? '▾ Hide generated system prompt' : '▸ View / edit the generated system prompt'}
      </button>
      {showEditor && (
        <textarea
          value={systemPrompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={10}
          style={{ width: '100%', padding: 10, fontSize: 13, borderRadius: 8, border: '1px solid #ccc', marginBottom: 16, fontFamily: 'monospace', color: INK, background: '#fff' }}
        />
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack} style={{ padding: '10px 20px', borderRadius: 100, background: '#fff', color: INK, border: '1px solid #ccc', fontWeight: 600, cursor: 'pointer' }}>
          ← Back
        </button>
        <button onClick={onNext} style={{ padding: '10px 20px', borderRadius: 100, background: '#111', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
          Looks good, build my agent →
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: animated "building" screen ────────────────────────────────

function BuildingStep({ agentName, onDone }: { agentName: string; onDone: () => void }) {
  const [headline, setHeadline] = useState('');
  const [doneCount, setDoneCount] = useState(0);
  const fullHeadline = `${agentName} is ready to start taking calls`;
  const tip = WAIT_TIPS[Math.floor(Math.random() * WAIT_TIPS.length)];

  useEffect(() => {
    let i = 0;
    const typeInterval = setInterval(() => {
      i++;
      setHeadline(fullHeadline.slice(0, i));
      if (i >= fullHeadline.length) clearInterval(typeInterval);
    }, 35);
    return () => clearInterval(typeInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setDoneCount((c) => {
        const next = c + 1;
        if (next >= BUILD_CHECKLIST.length) {
          clearInterval(stepInterval);
          setTimeout(onDone, 500);
        }
        return next;
      });
    }, 700);
    return () => clearInterval(stepInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
      <div style={{ flex: '1 1 320px' }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: INK, minHeight: 32 }}>{headline}<span style={{ opacity: 0.4 }}>|</span></h2>
        <p style={{ fontSize: 13, color: MUTED, marginTop: 8 }}>Setting up your voice agent…</p>
        <div style={{ marginTop: 20, border: '1px solid #eee', borderRadius: 12, padding: 16, background: '#fafafa', maxWidth: 320 }}>
          <p style={{ fontSize: 13, color: INK, margin: 0 }}>{tip}</p>
        </div>
      </div>
      <div style={{ flex: '1 1 280px', maxWidth: 320, border: '1px solid #eee', borderRadius: 16, padding: 20 }}>
        {BUILD_CHECKLIST.map((item, i) => (
          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, opacity: i <= doneCount ? 1 : 0.35 }}>
            <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11, flexShrink: 0, background: i < doneCount ? '#16a34a' : '#eee', color: i < doneCount ? '#fff' : '#999' }}>
              {i < doneCount ? '✓' : i + 1}
            </span>
            <span style={{ fontSize: 13, color: INK }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Step 4: test the agent (the actual voice call) ────────────────────

function CallStep({ profile, voiceName, onVoiceChange, status, errorMsg, transcript, recordingUrl, onStart, onStop, onEditSetup }: {
  profile: VoiceAgentProfile;
  voiceName: (typeof VOICES)[number];
  onVoiceChange: (v: (typeof VOICES)[number]) => void;
  status: CallStatus;
  errorMsg: string;
  transcript: TranscriptLine[];
  recordingUrl: string | null;
  onStart: () => void;
  onStop: () => void;
  onEditSetup: () => void;
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#111', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700 }}>
          {(profile.agentName || '?').charAt(0).toUpperCase()}
        </div>
        <div>
          <p style={{ fontWeight: 700, fontSize: 15, color: INK, margin: 0 }}>{profile.agentName}</p>
          <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{profile.companyName}</p>
        </div>
      </div>
      <p style={{ fontSize: 13, color: MUTED, margin: '10px 0 20px' }}>
        Talk to it and see how it handles objections — treat the conversation as if you were a client.{' '}
        <button onClick={onEditSetup} style={{ color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13 }}>Edit setup</button>
      </p>

      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6, color: INK }}>Voice</label>
      <select
        value={voiceName}
        onChange={(e) => onVoiceChange(e.target.value as (typeof VOICES)[number])}
        disabled={status === 'live' || status === 'connecting'}
        style={{ padding: 8, fontSize: 14, borderRadius: 8, border: '1px solid #ccc', marginBottom: 20, color: INK, background: '#fff' }}
      >
        {VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
      </select>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        {status === 'idle' || status === 'error' ? (
          <button onClick={onStart} style={{ padding: '10px 20px', borderRadius: 100, background: '#111', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            Start talking
          </button>
        ) : (
          <button onClick={onStop} disabled={status === 'connecting'} style={{ padding: '10px 20px', borderRadius: 100, background: '#dc2626', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' }}>
            {status === 'connecting' ? 'Connecting…' : 'Stop'}
          </button>
        )}
        <span style={{ alignSelf: 'center', fontSize: 13, color: status === 'live' ? '#16a34a' : MUTED }}>
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
        {transcript.length === 0 && <p style={{ color: MUTED, fontSize: 13 }}>Transcript will appear here once you start talking.</p>}
        {transcript.map((line, i) => (
          <p key={i} style={{ margin: '0 0 8px', fontSize: 14, color: INK }}>
            <strong style={{ color: line.role === 'you' ? '#2563eb' : INK }}>{line.role === 'you' ? 'You: ' : `${profile.agentName}: `}</strong>
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}

function StepDots({ step }: { step: Step }) {
  const steps: Step[] = ['info', 'explain', 'building', 'call'];
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
      {steps.map((s) => (
        <span key={s} style={{ width: s === step ? 24 : 8, height: 8, borderRadius: 100, background: steps.indexOf(s) <= steps.indexOf(step) ? '#111' : '#ddd', transition: 'all 0.2s' }} />
      ))}
    </div>
  );
}
