'use client';

import { useEffect, useState, useRef } from 'react';

interface Message { role: 'user' | 'assistant'; content: string; }

const ACCENT = '#C8FF34';
const AINK   = '#16210A';
const GREEN  = '#2FBF71';
const LINE   = 'rgba(255,255,255,0.10)';
const STRONG = 'rgba(255,255,255,0.18)';
const INK2   = '#141416';
const INK3   = '#1C1C1F';
const MUTED  = '#9B9B96';
const MUTED2 = '#6E6E69';

const SUGGESTIONS = [
  'Do you accept new patients?',
  'I have a toothache — can I come today?',
  'How much is a cleaning without insurance?',
];

export default function DentistDemo() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [initing, setIniting]   = useState(true);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/demo/dental')
      .then(r => r.json() as Promise<{ greeting?: string }>)
      .then(d => { if (d.greeting) setMessages([{ role: 'assistant', content: d.greeting }]); })
      .finally(() => { setIniting(false); setTimeout(() => inputRef.current?.focus(), 100); });
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading || initing) return;
    const updated: Message[] = [...messages, { role: 'user', content: msg }];
    setMessages(updated);
    setInput('');
    setLoading(true);
    try {
      const res  = await fetch('/api/demo/dental', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ history: updated }) });
      const data = await res.json() as { reply?: string };
      setMessages([...updated, { role: 'assistant', content: data.reply ?? 'Something went wrong.' }]);
    } catch {
      setMessages([...updated, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 680, margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <div style={{ background: INK2, border: `1px solid ${LINE}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 80px -30px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${LINE}`, background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: ACCENT, color: AINK, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, position: 'relative', flexShrink: 0 }}>
            I
            <span style={{ position: 'absolute', right: -2, bottom: -2, width: 12, height: 12, borderRadius: '50%', background: GREEN, border: '2px solid #141416' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#ECEBE6', margin: 0, lineHeight: 1.2 }}>SmileCare AI</p>
            <p style={{ fontSize: 12, color: GREEN, fontWeight: 500, margin: 0, marginTop: 2 }}>● Online now · replies instantly</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'rgba(200,255,52,0.12)', color: ACCENT, border: '1px solid rgba(200,255,52,0.25)' }}>Live AI demo</span>
        </div>

        {/* Messages */}
        <div style={{ minHeight: 280, maxHeight: 360, overflowY: 'auto', padding: '20px 20px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {initing ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}><Dots /></div>
          ) : messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
              {msg.role === 'assistant' && (
                <div style={{ width: 28, height: 28, borderRadius: 8, background: ACCENT, color: AINK, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 13, flexShrink: 0, marginBottom: 2 }}>I</div>
              )}
              <div style={{ maxWidth: '75%', padding: '11px 15px', fontSize: 14.5, lineHeight: 1.45, borderRadius: 18, ...(msg.role === 'user' ? { background: INK3, color: '#ECEBE6', borderBottomRightRadius: 4, border: `1px solid ${LINE}` } : { background: ACCENT, color: AINK, borderBottomLeftRadius: 4, fontWeight: 500 }) }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: ACCENT, color: AINK, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 13, flexShrink: 0 }}>I</div>
              <div style={{ padding: '13px 16px', borderRadius: 18, borderBottomLeftRadius: 4, background: ACCENT }}><Dots dark /></div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length === 1 && !loading && !initing && (
          <div style={{ padding: '0 20px 14px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} style={{ fontSize: 12.5, padding: '6px 14px', borderRadius: 100, border: `1px solid ${STRONG}`, background: 'transparent', color: MUTED, cursor: 'pointer', fontFamily: 'var(--font-body)', transition: 'all 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT; (e.currentTarget as HTMLButtonElement).style.color = ACCENT; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = STRONG; (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}>
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${LINE}`, display: 'flex', gap: 10, alignItems: 'center' }}>
          <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }} placeholder="Ask something…" disabled={initing}
            style={{ flex: 1, border: `1px solid ${LINE}`, borderRadius: 100, padding: '10px 18px', fontSize: 14, outline: 'none', background: INK3, color: '#ECEBE6', fontFamily: 'var(--font-body)', opacity: initing ? 0.5 : 1 }}
            onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = STRONG; }}
            onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = LINE; }} />
          <button onClick={() => void send()} disabled={!input.trim() || loading || initing}
            style={{ width: 40, height: 40, borderRadius: '50%', background: ACCENT, border: 'none', display: 'grid', placeItems: 'center', cursor: !input.trim() || loading || initing ? 'not-allowed' : 'pointer', opacity: !input.trim() || loading || initing ? 0.35 : 1, transition: 'opacity 0.2s', flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={AINK}><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
        </div>
      </div>
      <style>{`@keyframes dentist-bounce{0%,80%,100%{transform:translateY(0);}40%{transform:translateY(-5px);}}`}</style>
    </div>
  );
}

function Dots({ dark }: { dark?: boolean }) {
  const color = dark ? AINK : MUTED2;
  return (
    <span style={{ display: 'flex', gap: 4, alignItems: 'center', height: 16 }}>
      {[0, 150, 300].map(d => <span key={d} style={{ width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block', animation: `dentist-bounce 1.2s ease-in-out ${d}ms infinite` }} />)}
    </span>
  );
}
