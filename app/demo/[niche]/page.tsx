'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface DemoConfig {
  name: string;
  color: string;
  greeting: string;
}

const NICHE_META: Record<string, {
  headline: string;
  subline: string;
  emoji: string;
  suggestions: string[];
}> = {
  dental: {
    emoji: '🦷',
    headline: 'See how a dental clinic never misses a patient again',
    subline: 'This AI receptionist answers questions, quotes prices, and guides patients to book — 24/7, no staff needed.',
    suggestions: ['How much does teeth whitening cost?', 'Do you accept insurance?', 'I need an emergency appointment'],
  },
  hvac: {
    emoji: '❄️',
    headline: 'See how an HVAC company books jobs while the owner sleeps',
    subline: 'This AI assistant handles pricing questions, qualifies leads, and schedules service calls automatically.',
    suggestions: ['My AC stopped working', 'How much does a tune-up cost?', 'Do you offer emergency service?'],
  },
  fitness: {
    emoji: '💪',
    headline: 'See how a gym captures leads at 10pm without lifting a finger',
    subline: 'This AI assistant answers membership questions, books free trials, and converts website visitors into members — 24/7.',
    suggestions: ['How much is a membership?', 'Do you offer a free trial?', 'What classes do you have?'],
  },
  medspa: {
    emoji: '✨',
    headline: 'See how a med spa books consultations while the staff focuses on clients',
    subline: 'This AI receptionist answers treatment questions, quotes pricing ranges, and guides visitors to book a free consultation.',
    suggestions: ['How much is Botox?', 'Do you offer laser hair removal?', 'I want a free consultation'],
  },
  auto: {
    emoji: '🚗',
    headline: 'See how a car dealership books test drives while the sales team focuses on the floor',
    subline: 'This AI assistant answers inventory questions, explains financing options, and guides visitors to schedule a test drive — 24/7.',
    suggestions: ['What SUVs do you have in stock?', 'Can I trade in my car?', 'What are your financing options?'],
  },
  realestate: {
    emoji: '🏡',
    headline: 'See how a real estate agent never loses a lead at 11pm again',
    subline: 'This AI assistant answers property questions, qualifies buyers and sellers, and schedules tours — 24/7, before the competition responds.',
    suggestions: ['I\'m looking to buy a home under $500k', 'What\'s my home worth?', 'I want to schedule a tour'],
  },
};

export default function DemoPage() {
  const { niche } = useParams<{ niche: string }>();
  const [config, setConfig]     = useState<DemoConfig | null>(null);
  const [error, setError]       = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  const meta = NICHE_META[niche?.toLowerCase()] ?? {
    emoji: '🤖',
    headline: 'Live AI Agent Demo',
    subline: 'Try a real conversation with an AI agent built for your business.',
    suggestions: ['What services do you offer?', 'How much does it cost?', 'How do I get started?'],
  };

  useEffect(() => {
    fetch(`/api/demo/${niche}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setConfig(data);
        setMessages([{ role: 'assistant', content: data.greeting }]);
        setTimeout(() => inputRef.current?.focus(), 200);
      })
      .catch(() => setError('Failed to load demo'));
  }, [niche]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: 'user', content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res  = await fetch(`/api/demo/${niche}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: updated }),
      });
      const data = await res.json();
      setMessages([...updated, {
        role: 'assistant',
        content: data.reply || data.error || 'Something went wrong.',
      }]);
    } catch {
      setMessages([...updated, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const color = config?.color ?? '#2563EB';

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-500 text-sm">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">

      {/* ── Top bar ── */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-slate-900 tracking-tight">
          Iupiter
        </Link>
        <a
          href="https://calendar.app.google/vfPk2wjM7XMiLxtD8"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
          style={{ background: color }}
        >
          Book a Call →
        </a>
      </header>

      {/* ── Hero text ── */}
      <div className="text-center pt-10 pb-6 px-4">
        <p className="text-3xl mb-3">{meta.emoji}</p>
        <h1 className="text-2xl font-bold text-slate-900 max-w-xl mx-auto leading-snug">
          {meta.headline}
        </h1>
        <p className="text-slate-500 text-sm mt-2 max-w-md mx-auto">
          {meta.subline}
        </p>
      </div>

      {/* ── Chat window ── */}
      <div className="flex-1 flex justify-center px-4 pb-10">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-100 flex flex-col overflow-hidden" style={{ maxHeight: 560 }}>

          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: color }}
            >
              {config?.name.charAt(0) ?? '…'}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">{config?.name ?? 'Loading…'}</p>
              <p className="text-xs text-green-500 font-medium">● Online now</p>
            </div>
            <span className="ml-auto text-xs font-medium bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">
              Live demo
            </span>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={msg.role === 'user' ? 'flex justify-end' : 'flex items-end gap-2'}>
                {msg.role === 'assistant' && (
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: color }}
                  >
                    {config?.name.charAt(0) ?? 'A'}
                  </div>
                )}
                <div
                  className="max-w-[78%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === 'user'
                    ? { background: color, color: '#fff', borderBottomRightRadius: 4 }
                    : { background: '#F3F4F6', color: '#111827', borderBottomLeftRadius: 4 }
                  }
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-end gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: color }}
                >
                  {config?.name.charAt(0) ?? 'A'}
                </div>
                <div className="bg-slate-100 px-4 py-3 rounded-2xl" style={{ borderBottomLeftRadius: 4 }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions (show only before user sends first message) */}
          {messages.length === 1 && !loading && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {meta.suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-xs px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div className="px-3 py-3 border-t border-slate-100 flex gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Type a message…"
              className="flex-1 border border-slate-200 rounded-full px-4 py-2 text-sm outline-none focus:border-slate-400 bg-slate-50 text-slate-900"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
              style={{ background: color }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── CTA banner ── */}
      <div className="border-t border-slate-200 bg-white px-6 py-6 text-center">
        <p className="text-slate-700 font-semibold text-base mb-1">
          Want this on your website?
        </p>
        <p className="text-slate-500 text-sm mb-4">
          Book a free 15-min call — we'll set it up for your business.
        </p>
        <a
          href="https://calendar.app.google/vfPk2wjM7XMiLxtD8"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-opacity hover:opacity-90"
          style={{ background: color }}
        >
          Book a Call — free 15-min demo
        </a>
      </div>
    </div>
  );
}

// ─── Typing animation ─────────────────────────────────────────────

function TypingDots() {
  return (
    <>
      <style>{`
        @keyframes iup-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
        .iup-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #9CA3AF; display: inline-block;
          animation: iup-bounce 1.2s ease-in-out infinite;
        }
      `}</style>
      <span style={{ display: 'flex', gap: 4, alignItems: 'center', height: 16 }}>
        <span className="iup-dot" style={{ animationDelay: '0ms' }} />
        <span className="iup-dot" style={{ animationDelay: '150ms' }} />
        <span className="iup-dot" style={{ animationDelay: '300ms' }} />
      </span>
    </>
  );
}
