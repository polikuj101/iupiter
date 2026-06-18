'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import MobileMenu from '@/app/components/MobileMenu';

const LINE   = 'rgba(255,255,255,0.10)';
const STRONG = 'rgba(255,255,255,0.18)';
const ACCENT = '#C8FF34';
const AINK   = '#16210A';
const MUTED  = '#9B9B96';

export default function LandingNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <>
      <style>{`
        .nav-link { color: ${MUTED}; text-decoration: none; font-size: 15px; font-weight: 500; transition: color 0.2s; }
        .nav-link:hover { color: #ECEBE6; }
        .btn-ghost-nav { color: #ECEBE6; border: 1px solid ${STRONG}; border-radius: 10px; padding: 11px 20px; text-decoration: none; font-size: 15px; font-weight: 600; transition: background 0.2s; }
        .btn-ghost-nav:hover { background: rgba(255,255,255,0.04); }
      `}</style>

      <nav style={{ borderBottom: `1px solid ${LINE}`, background: 'rgba(10,10,11,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 clamp(20px,4vw,64px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

          {/* Brand */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 11, textDecoration: 'none', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: '#ECEBE6' }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: ACCENT, color: AINK, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 17, boxShadow: '0 0 0 1px rgba(255,255,255,0.06),0 6px 18px rgba(200,255,52,0.25)' }}>I</span>
            Iupiter
          </Link>

          <MobileMenu isLoggedIn={isLoggedIn} />

          {/* Desktop links */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 36 }}>
            {(['How it works', 'Features', 'Pricing', 'Demo'] as const).map((label, i) => (
              <Link key={label} href={['#how-it-works','#features','#pricing','#demo'][i]} className="nav-link">
                {label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex" style={{ alignItems: 'center', gap: 14 }}>
            {isLoggedIn ? (
              <Link href="/dashboard" style={{ background: ACCENT, color: AINK, fontWeight: 700, fontSize: 15, padding: '11px 20px', borderRadius: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9 }}>
                Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="btn-ghost-nav">Sign in</Link>
                <Link href="/sign-up" style={{ background: ACCENT, color: AINK, fontWeight: 700, fontSize: 15, padding: '11px 20px', borderRadius: 10, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 8px 30px rgba(200,255,52,0.22)' }}>
                  Build your agent <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
