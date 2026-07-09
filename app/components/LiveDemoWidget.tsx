'use client';

import { useEffect, useState, useRef, type CSSProperties, type ReactNode } from 'react';
import { DEMO_LISTINGS, type DemoListingNiche } from '@/lib/demo-listings';
import { DEFAULT_DEMO_PROFILE, type DemoAgentProfile, type LeadCaptureTrigger } from '@/lib/demo-profile';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ACCENT = '#C8FF34';
const AINK   = '#16210A';
const GREEN  = '#2FBF71';
const LINE   = 'rgba(255,255,255,0.10)';
const STRONG = 'rgba(255,255,255,0.18)';
const INK2   = '#141416';
const INK3   = '#1C1C1F';
const MUTED  = '#9B9B96';
const MUTED2 = '#6E6E69';

const NICHES = [
  { key: 'realestate', label: '🏡 Buying a home' },
  { key: 'rental',     label: '🔑 Renting'        },
];

const SUGGESTIONS: Record<string, string[]> = {
  realestate: ['Is 14 Maple Ave still available?', 'Budget €380K — what can I get?', 'Can I book a viewing this weekend?'],
  rental:     ['Any 2-beds in Dublin 4?',           'What\'s your cheapest listing?',  'When can I view a property?'],
};

export default function LiveDemoWidget() {
  const [niche, setNiche]       = useState(NICHES[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [initing, setIniting]   = useState(true);
  const [profile, setProfile]   = useState<DemoAgentProfile>(DEFAULT_DEMO_PROFILE);
  const bottomRef               = useRef<HTMLDivElement>(null);
  const inputRef                = useRef<HTMLInputElement>(null);

  const loadNiche = async (n: typeof NICHES[0]) => {
    setIniting(true);
    setMessages([]);
    setInput('');
    try {
      const res  = await fetch(`/api/demo/${n.key}`);
      const data = await res.json() as { greeting?: string };
      if (data.greeting) {
        setMessages([{ role: 'assistant', content: data.greeting }]);
      }
    } finally {
      setIniting(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  useEffect(() => { loadNiche(niche); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const switchNiche = (n: typeof NICHES[0]) => {
    setNiche(n);
    loadNiche(n);
  };

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading || initing) return;

    const userMsg: Message = { role: 'user', content: msg };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res  = await fetch(`/api/demo/${niche.key}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ history: updated, profile }),
      });
      const data = await res.json() as { reply?: string };
      setMessages([...updated, {
        role:    'assistant',
        content: data.reply ?? 'Something went wrong. Please try again.',
      }]);
    } catch {
      setMessages([...updated, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: 1220, margin: '0 auto', fontFamily: 'var(--font-body)' }}>

      {/* Niche tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, justifyContent: 'center' }}>
        {NICHES.map(n => (
          <button
            key={n.key}
            onClick={() => switchNiche(n)}
            style={{
              padding: '10px 20px',
              borderRadius: 100,
              fontSize: 14,
              fontWeight: 600,
              border: `1px solid ${niche.key === n.key ? ACCENT : STRONG}`,
              background: niche.key === n.key ? ACCENT : 'transparent',
              color: niche.key === n.key ? AINK : MUTED,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'var(--font-body)',
            }}
          >
            {n.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>

      {/* Chat window */}
      <div style={{ flex: '1 1 420px', maxWidth: 680, background: INK2, border: `1px solid ${LINE}`, borderRadius: 20, overflow: 'hidden', boxShadow: '0 40px 80px -30px rgba(0,0,0,0.6)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderBottom: `1px solid ${LINE}`, background: 'rgba(255,255,255,0.02)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: ACCENT, color: AINK, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 18, position: 'relative', flexShrink: 0 }}>
            I
            <span style={{ position: 'absolute', right: -2, bottom: -2, width: 12, height: 12, borderRadius: '50%', background: GREEN, border: '2px solid #141416' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15, color: '#ECEBE6', margin: 0, lineHeight: 1.2 }}>
              {niche.key === 'realestate' ? 'Apex Realty AI' : 'Apex Lettings AI'}
            </p>
            <p style={{ fontSize: 12, color: GREEN, fontWeight: 500, margin: 0, marginTop: 2 }}>● Online now · replies instantly</p>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'rgba(200,255,52,0.12)', color: ACCENT, border: `1px solid rgba(200,255,52,0.25)` }}>
            Live AI demo
          </span>
        </div>

        {/* Messages */}
        <div style={{ minHeight: 280, maxHeight: 360, overflowY: 'auto', padding: '20px 20px 12px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {initing ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120 }}>
              <BouncingDots />
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 8 }}>
                {msg.role === 'assistant' && (
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: ACCENT, color: AINK, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 13, flexShrink: 0, marginBottom: 2 }}>
                    I
                  </div>
                )}
                <div style={{
                  maxWidth: '75%',
                  padding: '11px 15px',
                  fontSize: 14.5,
                  lineHeight: 1.45,
                  borderRadius: 18,
                  ...(msg.role === 'user'
                    ? { background: INK3, color: '#ECEBE6', borderBottomRightRadius: 4, border: `1px solid ${LINE}` }
                    : { background: ACCENT, color: AINK, borderBottomLeftRadius: 4, fontWeight: 500 }),
                }}>
                  {msg.content}
                </div>
              </div>
            ))
          )}

          {loading && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: ACCENT, color: AINK, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 13, flexShrink: 0 }}>I</div>
              <div style={{ padding: '13px 16px', borderRadius: 18, borderBottomLeftRadius: 4, background: ACCENT }}>
                <BouncingDots dark />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        {messages.length === 1 && !loading && !initing && (
          <div style={{ padding: '0 20px 14px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(SUGGESTIONS[niche.key] ?? []).map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                style={{
                  fontSize: 12.5,
                  padding: '6px 14px',
                  borderRadius: 100,
                  border: `1px solid ${STRONG}`,
                  background: 'transparent',
                  color: MUTED,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-body)',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = ACCENT; (e.currentTarget as HTMLButtonElement).style.color = ACCENT; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = STRONG; (e.currentTarget as HTMLButtonElement).style.color = MUTED; }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${LINE}`, display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void send(); } }}
            placeholder="Ask something…"
            disabled={initing}
            style={{
              flex: 1,
              border: `1px solid ${LINE}`,
              borderRadius: 100,
              padding: '10px 18px',
              fontSize: 14,
              outline: 'none',
              background: INK3,
              color: '#ECEBE6',
              fontFamily: 'var(--font-body)',
              opacity: initing ? 0.5 : 1,
            }}
            onFocus={e => { (e.currentTarget as HTMLInputElement).style.borderColor = STRONG; }}
            onBlur={e => { (e.currentTarget as HTMLInputElement).style.borderColor = LINE; }}
          />
          <button
            onClick={() => void send()}
            disabled={!input.trim() || loading || initing}
            style={{
              width: 40, height: 40,
              borderRadius: '50%',
              background: ACCENT,
              border: 'none',
              display: 'grid',
              placeItems: 'center',
              cursor: !input.trim() || loading || initing ? 'not-allowed' : 'pointer',
              opacity: !input.trim() || loading || initing ? 0.35 : 1,
              transition: 'opacity 0.2s',
              flexShrink: 0,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={AINK}>
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>

      <ContextBasePanel niche={niche.key as DemoListingNiche} profile={profile} onChange={setProfile} />

      </div>

      <style>{`
        @keyframes liveDemo-bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-5px); }
        }
      `}</style>
    </div>
  );
}

type SectionKey = 'identity' | 'geographies' | 'superpowers' | 'vendors' | 'leadCapture' | 'listings';

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'identity',    label: 'Professional Identity & Contact Routing' },
  { key: 'geographies', label: 'Dynamic Target Geographies (Zip Codes/Neighborhoods)' },
  { key: 'superpowers', label: '"My Superpowers"' },
  { key: 'vendors',     label: 'Preferred Vendor Recommendations' },
  { key: 'leadCapture', label: 'The Lead-Capture Trigger' },
  { key: 'listings',    label: 'Sample Listings' },
];

const fieldStyle: CSSProperties = {
  width: '100%', border: `1px solid ${LINE}`, borderRadius: 10,
  padding: '8px 11px', fontSize: 12.5, outline: 'none',
  background: INK3, color: '#ECEBE6', fontFamily: 'var(--font-body)',
  marginBottom: 10,
};

function FieldLabel({ children }: { children: ReactNode }) {
  return <label style={{ display: 'block', fontSize: 11, color: MUTED, marginBottom: 4 }}>{children}</label>;
}

function ContextBasePanel({
  niche, profile, onChange,
}: {
  niche: DemoListingNiche;
  profile: DemoAgentProfile;
  onChange: (p: DemoAgentProfile) => void;
}) {
  const [active, setActive] = useState<SectionKey>('identity');
  const listings = DEMO_LISTINGS[niche];

  const activeLabel = SECTIONS.find((s) => s.key === active)?.label ?? '';

  return (
    <div style={{
      flex: '1 1 460px', maxWidth: 520, minHeight: 420,
      display: 'flex', background: INK2, border: `1px solid ${LINE}`, borderRadius: 20,
      overflow: 'hidden', boxShadow: '0 40px 80px -30px rgba(0,0,0,0.6)',
    }}>
      {/* Section list */}
      <div style={{ width: 170, flexShrink: 0, borderRight: `1px solid ${LINE}`, padding: '14px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <p style={{ fontSize: 10, fontWeight: 700, color: MUTED2, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px 10px' }}>
          📋 Context base
        </p>
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            style={{
              textAlign: 'left', fontSize: 11.5, lineHeight: 1.35, fontWeight: 600,
              padding: '8px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: active === s.key ? 'rgba(200,255,52,0.12)' : 'transparent',
              color: active === s.key ? ACCENT : MUTED,
              fontFamily: 'var(--font-body)', transition: 'all 0.15s',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Selected section content */}
      <div style={{ flex: 1, padding: '16px 18px', overflowY: 'auto', maxHeight: 460 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13.5, color: '#ECEBE6', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          {activeLabel}
        </p>
        <p style={{ fontSize: 11, color: MUTED2, margin: '0 0 14px', lineHeight: 1.4 }}>
          Fill this in as if it were your own agent profile — the AI adapts live. Real customers connect their own private data instead of typing it here each time.
        </p>

        {active === 'identity' && (
          <>
            <FieldLabel>Direct phone</FieldLabel>
            <input style={fieldStyle} value={profile.identity.phone}
              onChange={(e) => onChange({ ...profile, identity: { ...profile.identity, phone: e.target.value } })} />
            <FieldLabel>WhatsApp</FieldLabel>
            <input style={fieldStyle} value={profile.identity.whatsapp}
              onChange={(e) => onChange({ ...profile, identity: { ...profile.identity, whatsapp: e.target.value } })} />
            <FieldLabel>Calendar link</FieldLabel>
            <input style={fieldStyle} value={profile.identity.calendarLink}
              onChange={(e) => onChange({ ...profile, identity: { ...profile.identity, calendarLink: e.target.value } })} />
            <FieldLabel>License number (e.g. DRE/TREC)</FieldLabel>
            <input style={{ ...fieldStyle, marginBottom: 0 }} value={profile.identity.licenseNumber}
              onChange={(e) => onChange({ ...profile, identity: { ...profile.identity, licenseNumber: e.target.value } })} />
          </>
        )}

        {active === 'geographies' && (
          <>
            <FieldLabel>Core zip codes (comma-separated)</FieldLabel>
            <input style={fieldStyle} value={profile.geographies.zipCodes.join(', ')}
              onChange={(e) => onChange({ ...profile, geographies: { ...profile.geographies, zipCodes: splitList(e.target.value) } })} />
            <FieldLabel>Neighborhood tags (comma-separated)</FieldLabel>
            <input style={{ ...fieldStyle, marginBottom: 0 }} value={profile.geographies.neighborhoods.join(', ')}
              onChange={(e) => onChange({ ...profile, geographies: { ...profile.geographies, neighborhoods: splitList(e.target.value) } })} />
          </>
        )}

        {active === 'superpowers' && (
          <>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {(Object.keys(profile.superpowers) as (keyof DemoAgentProfile['superpowers'])[])
                .filter((k) => k !== 'languages')
                .map((k) => (
                  <Chip
                    key={k}
                    active={profile.superpowers[k] as boolean}
                    onClick={() => onChange({ ...profile, superpowers: { ...profile.superpowers, [k]: !profile.superpowers[k] } })}
                  >
                    {SUPERPOWER_LABELS[k]}
                  </Chip>
                ))}
            </div>
            <FieldLabel>Languages spoken (comma-separated)</FieldLabel>
            <input style={{ ...fieldStyle, marginBottom: 0 }} value={profile.superpowers.languages.join(', ')}
              onChange={(e) => onChange({ ...profile, superpowers: { ...profile.superpowers, languages: splitList(e.target.value) } })} />
          </>
        )}

        {active === 'vendors' && (
          <>
            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, margin: '0 0 6px' }}>Preferred lender</p>
            <FieldLabel>Name</FieldLabel>
            <input style={fieldStyle} value={profile.vendors.lender.name}
              onChange={(e) => onChange({ ...profile, vendors: { ...profile.vendors, lender: { ...profile.vendors.lender, name: e.target.value } } })} />
            <FieldLabel>Profession / company</FieldLabel>
            <input style={fieldStyle} value={profile.vendors.lender.profession}
              onChange={(e) => onChange({ ...profile, vendors: { ...profile.vendors, lender: { ...profile.vendors.lender, profession: e.target.value } } })} />
            <FieldLabel>Phone</FieldLabel>
            <input style={fieldStyle} value={profile.vendors.lender.phone}
              onChange={(e) => onChange({ ...profile, vendors: { ...profile.vendors, lender: { ...profile.vendors.lender, phone: e.target.value } } })} />

            <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, margin: '14px 0 6px' }}>Go-to inspector</p>
            <FieldLabel>Name</FieldLabel>
            <input style={fieldStyle} value={profile.vendors.inspector.name}
              onChange={(e) => onChange({ ...profile, vendors: { ...profile.vendors, inspector: { ...profile.vendors.inspector, name: e.target.value } } })} />
            <FieldLabel>Profession / company</FieldLabel>
            <input style={fieldStyle} value={profile.vendors.inspector.profession}
              onChange={(e) => onChange({ ...profile, vendors: { ...profile.vendors, inspector: { ...profile.vendors.inspector, profession: e.target.value } } })} />
            <FieldLabel>Phone</FieldLabel>
            <input style={{ ...fieldStyle, marginBottom: 0 }} value={profile.vendors.inspector.phone}
              onChange={(e) => onChange({ ...profile, vendors: { ...profile.vendors, inspector: { ...profile.vendors.inspector, phone: e.target.value } } })} />
          </>
        )}

        {active === 'leadCapture' && (
          <>
            <FieldLabel>What should the bot optimize for?</FieldLabel>
            <select
              style={{ ...fieldStyle, marginBottom: 10 }}
              value={profile.leadCaptureTrigger}
              onChange={(e) => onChange({ ...profile, leadCaptureTrigger: e.target.value as LeadCaptureTrigger })}
            >
              <option value="aggressive">Aggressive — capture contact before details</option>
              <option value="value-first">Value-First — answer 3 questions first</option>
              <option value="consultative">Consultative — always push to book a call</option>
            </select>
            <p style={{ fontSize: 11, color: MUTED2, lineHeight: 1.4, margin: 0 }}>
              {LEAD_CAPTURE_DESCRIPTIONS[profile.leadCaptureTrigger]}
            </p>
          </>
        )}

        {active === 'listings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {listings.map((l) => (
              <div key={l.address} style={{
                border: `1px solid ${LINE}`, borderRadius: 12, padding: '10px 12px', background: 'rgba(255,255,255,0.02)',
              }}>
                <p style={{ fontSize: 12.5, fontWeight: 600, color: '#ECEBE6', margin: '0 0 2px' }}>{l.address}</p>
                <p style={{ fontSize: 12, fontWeight: 700, color: ACCENT, margin: '0 0 4px' }}>{l.price}</p>
                <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>
                  {l.beds > 0 ? `${l.beds}bd/${l.baths}ba · ` : ''}{l.sqft.toLocaleString()} sqft
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function splitList(raw: string): string[] {
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: 11, fontWeight: 600, padding: '6px 12px', borderRadius: 100, cursor: 'pointer',
        border: `1px solid ${active ? ACCENT : STRONG}`,
        background: active ? 'rgba(200,255,52,0.12)' : 'transparent',
        color: active ? ACCENT : MUTED,
        fontFamily: 'var(--font-body)', transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  );
}

const SUPERPOWER_LABELS: Record<Exclude<keyof DemoAgentProfile['superpowers'], 'languages'>, string> = {
  firstTimeBuyers: 'First-Time Homebuyers',
  luxury: 'Luxury Properties',
  foreclosures: 'Foreclosures / Short Sales',
  militaryVA: 'Military / VA Relocation',
  commercial: 'Commercial Real Estate',
};

const LEAD_CAPTURE_DESCRIPTIONS: Record<LeadCaptureTrigger, string> = {
  aggressive: 'The bot asks for email or phone before sharing specific listing details or pricing.',
  'value-first': 'The bot answers 2-3 real questions first, then asks for contact info.',
  consultative: 'The bot always steers toward booking a call via the calendar link, rather than answering everything in chat.',
};

function BouncingDots({ dark }: { dark?: boolean }) {
  const color = dark ? AINK : MUTED2;
  return (
    <span style={{ display: 'flex', gap: 4, alignItems: 'center', height: 16 }}>
      {[0, 150, 300].map(delay => (
        <span
          key={delay}
          style={{
            width: 7, height: 7, borderRadius: '50%',
            background: color, display: 'inline-block',
            animation: `liveDemo-bounce 1.2s ease-in-out ${delay}ms infinite`,
          }}
        />
      ))}
    </span>
  );
}
