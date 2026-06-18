'use client';

import { useEffect, useRef } from 'react';

const ACCENT = '#C8FF34';
const AINK   = '#16210A';
const GREEN  = '#2FBF71';
const LINE   = 'rgba(255,255,255,0.10)';
const STRONG = 'rgba(255,255,255,0.18)';

const SCRIPT = [
  { type: 'lead', tag: 'New lead · 9:42 PM', text: "Hi, is the 3-bed on Maple Street still available?" },
  { type: 'typing' },
  { type: 'ai',   text: "Hi! Yes — 142 Maple is still on the market. Are you looking to buy or just exploring?", latency: "replied in 1.8s" },
  { type: 'lead', text: "Looking to buy, pre-approved up to $650k." },
  { type: 'typing' },
  { type: 'ai',   text: "Perfect — it's listed at $619k, right in range. Want to see it this weekend? I have Sat 11 AM or Sun 2 PM open.", latency: "replied in 1.6s" },
  { type: 'lead', text: "Saturday 11 works great." },
  { type: 'typing' },
  { type: 'ai',   text: "Done ✅ You're booked for Sat 11:00 AM. I'll text you the address & a reminder. See you there!", latency: "replied in 1.9s" },
  { type: 'outcome' },
] as const;

function makeDot(): HTMLElement {
  const dot = document.createElement('i');
  Object.assign(dot.style, {
    width: '7px', height: '7px', borderRadius: '50%',
    background: AINK, opacity: '0.4',
    animation: 'typed 1.2s infinite', display: 'inline-block',
  });
  return dot;
}

function makeTypingRow(): HTMLElement {
  const row = document.createElement('div');
  row.className = 'msg-row';
  Object.assign(row.style, {
    display: 'flex', justifyContent: 'flex-end',
    opacity: '0', transform: 'translateY(10px)',
  });

  const bubble = document.createElement('div');
  Object.assign(bubble.style, {
    display: 'inline-flex', alignItems: 'center', gap: '4px',
    background: ACCENT, padding: '13px 16px',
    borderRadius: '18px', borderBottomRightRadius: '5px',
  });
  const delays = ['0s', '0.18s', '0.36s'];
  delays.forEach((delay) => {
    const d = makeDot();
    d.style.animationDelay = delay;
    bubble.appendChild(d);
  });

  row.appendChild(bubble);
  return row;
}

function makeBubbleRow(item: typeof SCRIPT[number] & { type: 'lead' | 'ai' }): HTMLElement {
  const isAI = item.type === 'ai';

  const row = document.createElement('div');
  row.className = 'msg-row';
  Object.assign(row.style, {
    display: 'flex',
    justifyContent: isAI ? 'flex-end' : 'flex-start',
    opacity: '0',
    transform: 'translateY(10px)',
  });

  const bubble = document.createElement('div');
  Object.assign(bubble.style, {
    maxWidth: '78%', padding: '11px 15px',
    fontSize: '14.5px', lineHeight: '1.42', borderRadius: '18px',
    ...(isAI
      ? { background: ACCENT, color: AINK, borderBottomRightRadius: '5px', fontWeight: '500' }
      : { background: '#1E2024', color: '#E7E7E4', borderBottomLeftRadius: '5px' }),
  });

  if (!isAI && 'tag' in item && item.tag) {
    const tagEl = document.createElement('span');
    Object.assign(tagEl.style, {
      display: 'block', fontSize: '10.5px', fontWeight: '700',
      letterSpacing: '0.04em', textTransform: 'uppercase',
      marginBottom: '4px', opacity: '0.6', color: AINK,
    });
    tagEl.textContent = item.tag;
    bubble.appendChild(tagEl);
  }

  const text = document.createElement('span');
  text.textContent = item.text;
  bubble.appendChild(text);

  row.appendChild(bubble);
  return row;
}

function makeLatencyChip(latency: string): HTMLElement {
  const chip = document.createElement('div');
  chip.className = 'latency-chip';
  Object.assign(chip.style, {
    display: 'flex', justifyContent: 'flex-end',
    alignItems: 'center', gap: '5px',
    fontSize: '11px', color: GREEN, fontWeight: '600',
    opacity: '0', transition: 'opacity 0.4s ease', padding: '2px 0',
  });

  // SVG bolt icon — created via DOM, no innerHTML
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', GREEN);
  svg.setAttribute('stroke-width', '3');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'M13 2 3 14h9l-1 8 10-12h-9z');
  svg.appendChild(path);

  const label = document.createElement('span');
  label.textContent = latency;

  chip.appendChild(svg);
  chip.appendChild(label);
  return chip;
}

export default function HeroPhone() {
  const feedRef    = useRef<HTMLDivElement>(null);
  const outcomeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    async function run() {
      if (cancelled) return;
      const feed    = feedRef.current;
      const outcome = outcomeRef.current;
      if (!feed || !outcome) return;

      feed.querySelectorAll('.msg-row, .latency-chip').forEach(n => n.remove());
      outcome.style.opacity   = '0';
      outcome.style.transform = 'translateY(8px)';

      await wait(700);

      for (const item of SCRIPT) {
        if (cancelled) return;

        if (item.type === 'outcome') {
          await wait(500);
          outcome.style.transition = 'all 0.5s ease';
          outcome.style.opacity    = '1';
          outcome.style.transform  = 'translateY(0)';
          feed.scrollTop = feed.scrollHeight;
          continue;
        }

        if (item.type === 'typing') {
          const row = makeTypingRow();
          feed.appendChild(row);
          feed.scrollTop = feed.scrollHeight;
          requestAnimationFrame(() => {
            row.style.transition = 'all 0.45s cubic-bezier(.2,.7,.3,1)';
            row.style.opacity    = '1';
            row.style.transform  = 'translateY(0)';
          });
          await wait(1300);
          if (cancelled) return;
          row.remove();
          continue;
        }

        const row = makeBubbleRow(item);
        feed.appendChild(row);
        feed.scrollTop = feed.scrollHeight;

        requestAnimationFrame(() => {
          row.style.transition = 'all 0.45s cubic-bezier(.2,.7,.3,1)';
          row.style.opacity    = '1';
          row.style.transform  = 'translateY(0)';
        });

        if (item.type === 'ai' && 'latency' in item) {
          await wait(300);
          const chip = makeLatencyChip(item.latency);
          feed.appendChild(chip);
          feed.scrollTop = feed.scrollHeight;
          requestAnimationFrame(() => { chip.style.opacity = '1'; });
          await wait(1500);
        } else {
          await wait(1100);
        }
      }

      await wait(4200);
      if (!cancelled) run();
    }

    run();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {/* LIVE badge */}
      <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', zIndex: 5, background: '#141416', border: `1px solid ${STRONG}`, borderRadius: 100, padding: '8px 16px', fontSize: 12.5, fontWeight: 600, color: '#9B9B96', display: 'flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap' }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#FF5B5B', animation: 'pulse-red 1.4s infinite', display: 'inline-block' }} />
        LIVE — watch it happen
      </div>

      {/* Floating stat card */}
      <div style={{ position: 'absolute', left: -38, bottom: 64, background: '#141416', border: `1px solid ${STRONG}`, borderRadius: 16, padding: '16px 18px', boxShadow: '0 24px 60px -20px rgba(0,0,0,0.7)', zIndex: 6, maxWidth: 200 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 34, letterSpacing: '-0.03em', color: ACCENT, lineHeight: 1 }}>78%</div>
        <div style={{ fontSize: 12.5, color: '#9B9B96', lineHeight: 1.35, marginTop: 6 }}>of deals go to whoever responds first. Iupiter is always first.</div>
      </div>

      {/* Phone shell */}
      <div style={{ position: 'relative', width: 340, maxWidth: '86vw', background: 'linear-gradient(180deg,#16171A,#101113)', borderRadius: 38, padding: 13, border: `1px solid ${STRONG}`, boxShadow: '0 40px 90px -30px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.03) inset' }}>
        <div style={{ background: '#0C0D0F', borderRadius: 28, overflow: 'hidden', height: 600, display: 'flex', flexDirection: 'column' }}>

          {/* Phone header */}
          <div style={{ padding: '16px 20px 14px', borderBottom: `1px solid ${LINE}`, display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(255,255,255,0.015)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: ACCENT, color: AINK, display: 'grid', placeItems: 'center', fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 19, position: 'relative', flexShrink: 0 }}>
              I
              <span style={{ position: 'absolute', right: -3, bottom: -3, width: 13, height: 13, borderRadius: '50%', background: GREEN, border: '2.5px solid #0C0D0F' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15.5, color: '#ECEBE6', lineHeight: 1.2 }}>Iupiter Agent</div>
              <div style={{ fontSize: 12, color: GREEN, fontWeight: 500, marginTop: 2 }}>● Online · replies instantly</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 11, color: '#6E6E69', lineHeight: 1.4 }}>New lead<br/>Zillow inquiry</div>
          </div>

          {/* Feed */}
          <div ref={feedRef} style={{ flex: 1, padding: '20px 16px 14px', display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto', justifyContent: 'flex-end', scrollBehavior: 'smooth' }}>
            <div style={{ textAlign: 'center', fontSize: 11, color: '#6E6E69', margin: '2px 0 4px' }}>Today · 9:42 PM</div>
          </div>

          {/* Outcome */}
          <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${LINE}` }}>
            <div ref={outcomeRef} style={{ background: 'rgba(47,191,113,0.10)', border: '1px solid rgba(47,191,113,0.30)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11, opacity: 0, transform: 'translateY(8px)' }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: GREEN, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="#07210F" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 7V3M16 7V3M4 11h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z"/><path d="M9 16l2 2 4-4"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.35 }}>
                <b style={{ color: '#ECEBE6', fontWeight: 700, display: 'block', fontFamily: 'var(--font-display)' }}>Showing booked — Sat 11:00 AM</b>
                <span style={{ color: '#9B9B96' }}>Synced to your calendar · lead notified</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
