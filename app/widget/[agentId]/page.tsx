'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentInfo {
  id:          string;
  name:        string;
  greeting:    string;
  brandColor:  string;
  avatarUrl:   string | null;
  widgetTitle: string;
}

export default function WidgetPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const [agent, setAgent]       = useState<AgentInfo | null>(null);
  const [error, setError]       = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/widget/${agentId}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return; }
        setAgent(data);
        setMessages([{ role: 'assistant', content: data.greeting }]);
        setTimeout(() => inputRef.current?.focus(), 100);
      })
      .catch(() => setError('Failed to load agent'));
  }, [agentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res  = await fetch(`/api/widget/${agentId}`, {
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

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  if (error) return (
    <div style={styles.errorWrap}>
      <p style={styles.errorText}>{error}</p>
    </div>
  );

  if (!agent) return (
    <div style={styles.loadingWrap}>
      <div style={styles.dots}>
        <span style={{ ...styles.dot, animationDelay: '0ms' }} />
        <span style={{ ...styles.dot, animationDelay: '150ms' }} />
        <span style={{ ...styles.dot, animationDelay: '300ms' }} />
      </div>
    </div>
  );

  const primary = agent.brandColor || PRIMARY;

  return (
    <div style={styles.root}>
      {/* Header */}
      <div style={styles.header}>
        {agent.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={agent.avatarUrl} alt={agent.widgetTitle} style={{ ...styles.avatar, background: 'transparent', objectFit: 'cover' }} />
        ) : (
          <div style={{ ...styles.avatar, background: primary }}>{agent.name.charAt(0).toUpperCase()}</div>
        )}
        <div>
          <p style={styles.agentName}>{agent.widgetTitle}</p>
          <p style={styles.onlineTag}>● Online</p>
        </div>
      </div>

      {/* Messages */}
      <div style={styles.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.role === 'user' ? styles.rowUser : styles.rowBot}>
            {msg.role === 'assistant' && (
              agent.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={agent.avatarUrl} alt="" style={{ ...styles.botAvatar, background: 'transparent', objectFit: 'cover' }} />
              ) : (
                <div style={{ ...styles.botAvatar, background: primary }}>{agent.name.charAt(0).toUpperCase()}</div>
              )
            )}
            <div style={msg.role === 'user' ? { ...styles.bubbleUser, background: primary } : styles.bubbleBot}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={styles.rowBot}>
            <div style={{ ...styles.botAvatar, background: primary }}>{agent.name.charAt(0).toUpperCase()}</div>
            <div style={styles.bubbleBot}>
              <div style={styles.dots}>
                <span style={{ ...styles.dot, animationDelay: '0ms' }} />
                <span style={{ ...styles.dot, animationDelay: '150ms' }} />
                <span style={{ ...styles.dot, animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Type a message..."
          style={styles.input}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={input.trim() && !loading ? { ...styles.sendActive, background: primary } : styles.sendDisabled}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>

      {/* Powered by */}
      <div style={styles.poweredBy}>
        Powered by <a href="https://iupiter.vercel.app" target="_blank" rel="noopener noreferrer" style={styles.link}>Iupiter</a>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}

// ─── Inline styles (no Tailwind — widget runs in iframe) ──────────

const PRIMARY = '#2563EB';

const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex', flexDirection: 'column', height: '100vh',
    fontFamily: "'Inter', sans-serif", background: '#fff', overflow: 'hidden',
  },
  header: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 16px', borderBottom: '1px solid #F0F0F0',
    background: '#fff',
  },
  avatar: {
    width: 38, height: 38, borderRadius: '50%',
    background: PRIMARY, color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 16, flexShrink: 0,
  },
  agentName: { fontWeight: 600, fontSize: 14, color: '#111' },
  onlineTag:  { fontSize: 11, color: '#22C55E', marginTop: 1 },
  messages: {
    flex: 1, overflowY: 'auto', padding: '16px 14px',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  rowBot:  { display: 'flex', alignItems: 'flex-end', gap: 8 },
  rowUser: { display: 'flex', justifyContent: 'flex-end' },
  botAvatar: {
    width: 28, height: 28, borderRadius: '50%',
    background: PRIMARY, color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 12, flexShrink: 0,
  },
  bubbleBot: {
    background: '#F3F4F6', borderRadius: '18px 18px 18px 4px',
    padding: '10px 14px', fontSize: 14, color: '#111',
    lineHeight: 1.5, maxWidth: '80%',
  },
  bubbleUser: {
    background: PRIMARY, borderRadius: '18px 18px 4px 18px',
    padding: '10px 14px', fontSize: 14, color: '#fff',
    lineHeight: 1.5, maxWidth: '80%',
  },
  inputRow: {
    display: 'flex', gap: 8, padding: '10px 12px',
    borderTop: '1px solid #F0F0F0', background: '#fff',
  },
  input: {
    flex: 1, border: '1px solid #E5E7EB', borderRadius: 24,
    padding: '9px 14px', fontSize: 14, outline: 'none',
    color: '#111', background: '#FAFAFA',
  },
  sendActive: {
    width: 38, height: 38, borderRadius: '50%',
    background: PRIMARY, border: 'none',
    color: '#fff', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0, transition: 'opacity 0.15s',
  },
  sendDisabled: {
    width: 38, height: 38, borderRadius: '50%',
    background: '#E5E7EB', border: 'none',
    color: '#9CA3AF', cursor: 'default',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  poweredBy: {
    textAlign: 'center', padding: '6px', fontSize: 11, color: '#9CA3AF',
    borderTop: '1px solid #F9F9F9',
  },
  link: { color: PRIMARY, textDecoration: 'none', fontWeight: 500 },
  dots: { display: 'flex', gap: 4, alignItems: 'center', height: 18 },
  dot: {
    width: 7, height: 7, borderRadius: '50%',
    background: '#9CA3AF', display: 'inline-block',
    animation: 'bounce 1.2s ease-in-out infinite',
  },
  loadingWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh',
  },
  errorWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', padding: 24,
  },
  errorText: { color: '#EF4444', fontSize: 14, textAlign: 'center' },
};
