'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NICHES = [
  { value: 'real_estate', label: '🏠 Real Estate',    hint: 'Answer property inquiries, schedule viewings, qualify buyers' },
  { value: 'dental',      label: '🦷 Dental',          hint: 'Book appointments, answer service questions, handle after-hours calls' },
  { value: 'hvac',        label: '❄️ HVAC',            hint: 'Capture repair requests, quote jobs, dispatch technicians' },
  { value: 'ecommerce',   label: '🛍️ E-Commerce',     hint: 'Order status, returns, product Q&A, cart recovery' },
  { value: 'other',       label: '✨ Other business',  hint: 'General customer support and lead capture' },
];

const NICHE_PROMPTS: Record<string, string> = {
  real_estate: `We are a real estate agency helping clients buy, sell, and rent properties. We offer free property valuations and consultations. Our team is available 6 days a week. We specialize in residential properties and have 10+ years of experience in the local market.`,
  dental:      `We are a modern dental clinic offering general dentistry, cosmetic treatments, and orthodontics. We accept most insurance plans. New patient appointments are available within 48 hours. We use the latest pain-free dental technology.`,
  hvac:        `We provide HVAC installation, maintenance, and emergency repair services. We service all major brands. 24/7 emergency call-out available. Free quotes for new installations. Licensed and insured technicians.`,
  ecommerce:   `We are an online store. We offer free shipping on orders over $50, a 30-day return policy, and 24-hour dispatch on in-stock items. Customer service is available Monday–Friday 9am–6pm.`,
  other:       `We are a service business dedicated to helping our customers. We pride ourselves on fast response times and high-quality service. Contact us to learn more about what we offer.`,
};

export default function OnboardingPage() {
  const router = useRouter();

  const [step,   setStep]   = useState(1);
  const [saving, setSaving] = useState(false);

  const [agentName,            setAgentName]            = useState('');
  const [niche,                setNiche]                = useState('');
  const [businessDescription,  setBusinessDescription]  = useState('');
  const [agentId,              setAgentId]              = useState<string | null>(null);

  const handleNicheSelect = (val: string) => {
    setNiche(val);
    if (!businessDescription) {
      setBusinessDescription(NICHE_PROMPTS[val] ?? '');
    }
  };

  const handleStep1 = () => {
    if (!agentName.trim()) return;
    setStep(2);
  };

  const handleStep2 = async () => {
    if (!niche || !businessDescription.trim()) return;
    setSaving(true);

    const res  = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agentName: agentName.trim(), businessDescription: businessDescription.trim(), niche }),
    });
    const data = await res.json();
    setSaving(false);

    if (data.agentId) {
      setAgentId(data.agentId);
      setStep(3);
    }
  };

  const origin   = typeof window !== 'undefined' ? window.location.origin : 'https://iupiter.vercel.app';
  const snippet  = agentId
    ? `<script>\n  window.IupiterConfig = {\n    agentId: '${agentId}',\n    color: '#2563EB',\n    position: 'right'\n  };\n</script>\n<script src="${origin}/widget.js" defer></script>`
    : '';

  const [copied, setCopied] = useState(false);
  const copySnippet = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: '#0A0A0B' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map(n => (
            <div key={n} style={{
              flex: 1, height: 4, borderRadius: 2,
              background: n <= step ? '#C8FF34' : 'rgba(255,255,255,0.10)',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        {/* ── Step 1: Agent name ── */}
        {step === 1 && (
          <div>
            <p style={{ color: '#C8FF34', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Step 1 of 3</p>
            <h1 style={{ color: '#ECEBE6', fontSize: 26, fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Name your AI agent</h1>
            <p style={{ color: '#9B9B96', fontSize: 14, marginBottom: 32, lineHeight: 1.5 }}>
              This is the name your customers will see when they chat with your agent. Your business name works great.
            </p>

            <label style={{ display: 'block', color: '#ECEBE6', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Agent name</label>
            <input
              autoFocus
              value={agentName}
              onChange={e => setAgentName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStep1()}
              placeholder="e.g. SunRise Realty Bot"
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)', background: '#141416',
                color: '#ECEBE6', fontSize: 15, outline: 'none', boxSizing: 'border-box',
              }}
            />

            <button
              onClick={handleStep1}
              disabled={!agentName.trim()}
              style={{
                width: '100%', marginTop: 20, padding: '13px 0', borderRadius: 10,
                background: agentName.trim() ? '#C8FF34' : 'rgba(200,255,52,0.2)',
                color: agentName.trim() ? '#16210A' : '#9B9B96',
                fontWeight: 700, fontSize: 15, border: 'none',
                cursor: agentName.trim() ? 'pointer' : 'default', transition: 'all 0.15s',
              }}
            >
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Business description ── */}
        {step === 2 && (
          <div>
            <p style={{ color: '#C8FF34', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Step 2 of 3</p>
            <h1 style={{ color: '#ECEBE6', fontSize: 26, fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Describe your business</h1>
            <p style={{ color: '#9B9B96', fontSize: 14, marginBottom: 24, lineHeight: 1.5 }}>
              Pick your niche — we'll pre-fill a description you can edit. The more detail you add, the smarter your agent.
            </p>

            {/* Niche selector */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
              {NICHES.map(n => (
                <button
                  key={n.value}
                  onClick={() => handleNicheSelect(n.value)}
                  style={{
                    padding: '10px 12px', borderRadius: 10, textAlign: 'left',
                    border: niche === n.value ? '1.5px solid #C8FF34' : '1px solid rgba(255,255,255,0.10)',
                    background: niche === n.value ? 'rgba(200,255,52,0.08)' : '#141416',
                    color: niche === n.value ? '#ECEBE6' : '#9B9B96',
                    cursor: 'pointer', transition: 'all 0.15s',
                    fontSize: 13, fontWeight: niche === n.value ? 600 : 400,
                  }}
                >
                  {n.label}
                </button>
              ))}
            </div>

            <label style={{ display: 'block', color: '#ECEBE6', fontSize: 13, fontWeight: 500, marginBottom: 8 }}>Business description</label>
            <textarea
              rows={6}
              value={businessDescription}
              onChange={e => setBusinessDescription(e.target.value)}
              placeholder="Describe your services, prices, hours, location, FAQs..."
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)', background: '#141416',
                color: '#ECEBE6', fontSize: 14, outline: 'none',
                resize: 'none', boxSizing: 'border-box', lineHeight: 1.5,
              }}
            />

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  padding: '13px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                  background: 'transparent', color: '#9B9B96', fontWeight: 600, fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={handleStep2}
                disabled={!niche || !businessDescription.trim() || saving}
                style={{
                  flex: 1, padding: '13px 0', borderRadius: 10,
                  background: (niche && businessDescription.trim() && !saving) ? '#C8FF34' : 'rgba(200,255,52,0.2)',
                  color: (niche && businessDescription.trim() && !saving) ? '#16210A' : '#9B9B96',
                  fontWeight: 700, fontSize: 15, border: 'none',
                  cursor: (niche && businessDescription.trim() && !saving) ? 'pointer' : 'default',
                }}
              >
                {saving ? 'Saving...' : 'Create my agent →'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Embed code ── */}
        {step === 3 && (
          <div>
            <p style={{ color: '#C8FF34', fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Step 3 of 3</p>
            <h1 style={{ color: '#ECEBE6', fontSize: 26, fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Your agent is ready! 🎉</h1>
            <p style={{ color: '#9B9B96', fontSize: 14, marginBottom: 28, lineHeight: 1.5 }}>
              Paste this snippet before <code style={{ color: '#C8FF34' }}>&lt;/body&gt;</code> on your website. Your agent will appear instantly.
            </p>

            <div style={{ position: 'relative', marginBottom: 20 }}>
              <pre style={{
                background: '#141416', border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 10, padding: '16px', fontSize: 12, color: '#C8FF34',
                overflowX: 'auto', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
              }}>
                {snippet}
              </pre>
              <button
                onClick={copySnippet}
                style={{
                  position: 'absolute', top: 10, right: 10,
                  padding: '6px 14px', borderRadius: 6,
                  background: copied ? '#22C55E' : 'rgba(255,255,255,0.1)',
                  color: '#ECEBE6', border: 'none', fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24 }}>
              {[
                { name: 'WordPress', hint: 'Appearance → Theme File Editor → footer.php' },
                { name: 'Wix',       hint: 'Settings → Custom Code → Body End' },
                { name: 'Shopify',   hint: 'Online Store → Themes → theme.liquid before </body>' },
                { name: 'Tilda',     hint: 'Site Settings → More → HTML in <head>' },
              ].map(p => (
                <div key={p.name} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)', background: '#141416' }}>
                  <p style={{ color: '#ECEBE6', fontSize: 12, fontWeight: 600, marginBottom: 3 }}>{p.name}</p>
                  <p style={{ color: '#6E6E69', fontSize: 11, lineHeight: 1.4 }}>{p.hint}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => router.push('/dashboard')}
              style={{
                width: '100%', padding: '13px 0', borderRadius: 10,
                background: '#C8FF34', color: '#16210A',
                fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
              }}
            >
              Go to dashboard →
            </button>

            {agentId && (
              <a
                href={`/widget/${agentId}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'block', textAlign: 'center', marginTop: 12, color: '#9B9B96', fontSize: 13 }}
              >
                Preview your widget →
              </a>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
