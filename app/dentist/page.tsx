export const dynamic = 'force-dynamic';
import React from 'react';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { ArrowRight, Zap, CalendarCheck, Target, HeartHandshake, PhoneOff, Clock } from 'lucide-react';
import DentistDemo from './DentistDemo';
import LandingNav from '@/app/components/LandingNav';

export default async function DentistPage() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;
  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: 'var(--ink)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>
      <LandingNav isLoggedIn={isLoggedIn} />
      <HeroSection isLoggedIn={isLoggedIn} />
      <Marquee />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <DemoSection />
      <FooterCta isLoggedIn={isLoggedIn} />
    </main>
  );
}

const LINE   = 'rgba(255,255,255,0.10)';
const STRONG = 'rgba(255,255,255,0.18)';
const ACCENT = '#C8FF34';
const AINK   = '#16210A';
const MUTED  = '#9B9B96';
const MUTED2 = '#6E6E69';
const GREEN  = '#2FBF71';
const INK2   = '#141416';
const INK3   = '#1C1C1F';

function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section style={{ position: 'relative', isolation: 'isolate' }}>
      <div style={{ position: 'absolute', top: '-30%', right: '-10%', width: '70vw', height: '70vw', maxWidth: 980, maxHeight: 980, background: 'radial-gradient(circle at center,rgba(200,255,52,0.10),rgba(200,255,52,0) 60%)', zIndex: -1, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(${LINE} 1px,transparent 1px),linear-gradient(90deg,${LINE} 1px,transparent 1px)`, backgroundSize: '64px 64px', WebkitMaskImage: 'radial-gradient(circle at 75% 20%,#000,transparent 70%)', maskImage: 'radial-gradient(circle at 75% 20%,#000,transparent 70%)', opacity: 0.5, zIndex: -1, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(32px,4vw,56px) clamp(20px,4vw,64px) clamp(40px,5vw,72px)' }}>
        <div style={{ maxWidth: 720 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '7px 14px 7px 9px', border: `1px solid ${STRONG}`, borderRadius: 100, fontSize: 13.5, fontWeight: 500, color: MUTED, marginBottom: 28, background: 'rgba(255,255,255,0.02)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: GREEN, boxShadow: '0 0 0 4px rgba(47,191,113,0.18)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            AI receptionist for dental practices
          </div>

          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(42px,5.6vw,76px)', lineHeight: 0.98, letterSpacing: '-0.035em', color: '#F4F3EE', textWrap: 'balance', margin: 0 }}>
            Your patients call at 10pm.{' '}
            <em style={{ fontStyle: 'normal', color: ACCENT }}>Iupiter answers.</em>
          </h1>

          <p style={{ marginTop: 26, fontSize: 'clamp(17px,1.4vw,19.5px)', lineHeight: 1.55, color: MUTED, maxWidth: '38ch' }}>
            60% of dental appointment requests happen outside office hours. Iupiter answers every patient instantly, books the appointment, and{' '}
            <strong style={{ color: 'var(--text-primary)', fontWeight: 600 }}>fills your calendar while you sleep.</strong>
          </p>

          <div style={{ marginTop: 38, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Link href={isLoggedIn ? '/dashboard' : '/sign-up'} style={{ background: ACCENT, color: AINK, fontWeight: 700, fontSize: 16.5, padding: '16px 28px', borderRadius: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 8px 30px rgba(200,255,52,0.22)', whiteSpace: 'nowrap' }}>
              Fill your schedule tonight <ArrowRight size={17} />
            </Link>
            <Link href="#demo" style={{ color: 'var(--text-primary)', border: `1px solid ${STRONG}`, borderRadius: 12, padding: '16px 28px', textDecoration: 'none', fontSize: 16.5, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 9, whiteSpace: 'nowrap' }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              Try it
            </Link>
          </div>

          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 18, color: MUTED2, fontSize: 13.5, flexWrap: 'wrap' }}>
            {['No credit card', 'Setup in 10 minutes', 'Cancel anytime'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

function Marquee() {
  const items = ['Answers patients in under 2 seconds','Books appointments 24/7','Reduces no-shows','Handles emergency requests','Works while your office is closed'];
  const doubled = [...items, ...items];
  return (
    <div style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}`, overflow: 'hidden', whiteSpace: 'nowrap', padding: '16px 0', WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)', maskImage: 'linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)' }}>
      <div style={{ display: 'inline-flex', gap: 56, animation: 'scroll-marquee 26s linear infinite' }}>
        {doubled.map((t, i) => (
          <span key={i} style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: MUTED2, display: 'inline-flex', alignItems: 'center', gap: 14 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, opacity: 0.5, display: 'inline-block' }} />
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function HowItWorksSection() {
  const steps = [
    { n: '01', title: 'Set up your agent', desc: 'Enter your practice name, services, hours, and insurance you accept. Takes 5 minutes.' },
    { n: '02', title: 'Embed on your site', desc: 'Paste one line of code. Your AI receptionist goes live — no developer needed.' },
    { n: '03', title: 'Wake up to a full calendar', desc: 'Patients get instant answers any hour. You get notified when an appointment is booked.' },
  ];
  return (
    <section id="how-it-works" style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,4vw,64px)', borderTop: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED2, marginBottom: 12 }}>How it works</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px,3.5vw,48px)', letterSpacing: '-0.03em', color: '#F4F3EE', marginBottom: 56, lineHeight: 1.05 }}>
          Three steps. Five minutes.
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 2 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ background: INK2, border: `1px solid ${LINE}`, borderRadius: 16, padding: '28px 28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: MUTED2, letterSpacing: '0.06em' }}>{s.n}</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: 14.5, color: MUTED, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Zap,           title: 'Instant reply',          desc: 'Every patient message answered in under 2 seconds — at 2am, on weekends, during procedures.', accent: true },
    { icon: CalendarCheck, title: 'Appointment booking',    desc: 'Books, reschedules, and confirms appointments directly in the chat. No phone tag.' },
    { icon: Target,        title: 'Patient qualification',  desc: 'Collects insurance info, reason for visit, and urgency — before you even see the message.' },
    { icon: PhoneOff,      title: 'After-hours coverage',   desc: 'No more lost patients from missed calls. Iupiter handles every inquiry 24/7.' },
    { icon: Clock,         title: 'No-show reduction',      desc: 'Sends automated reminders and handles rescheduling — fewer empty chairs.' },
    { icon: HeartHandshake,title: 'Human handoff',          desc: 'You get notified the moment a patient needs personal attention or has an emergency.' },
  ];
  return (
    <section id="features" style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,4vw,64px)', borderTop: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED2, marginBottom: 12 }}>Features</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px,3.5vw,48px)', letterSpacing: '-0.03em', color: '#F4F3EE', marginBottom: 14, lineHeight: 1.05 }}>
          Built for practices that can&apos;t afford empty chairs.
        </h2>
        <p style={{ fontSize: 17, color: MUTED, marginBottom: 56, maxWidth: '44ch', lineHeight: 1.5 }}>
          One missed patient call at 9pm could be a $400 appointment — or a lifelong patient. Iupiter makes sure that never happens.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 2 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: f.accent ? ACCENT : INK2, border: `1px solid ${f.accent ? 'transparent' : LINE}`, borderRadius: 16, padding: '28px 28px 32px' }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: f.accent ? 'rgba(22,33,10,0.15)' : INK3, border: `1px solid ${f.accent ? 'rgba(22,33,10,0.15)' : LINE}`, display: 'grid', placeItems: 'center', marginBottom: 20 }}>
                <f.icon size={17} color={f.accent ? AINK : MUTED} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: f.accent ? AINK : 'var(--text-primary)', marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14.5, color: f.accent ? '#2C4010' : MUTED, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  const plans = [
    { name: 'Starter', price: '$149', desc: 'Perfect for solo practitioners who want 24/7 patient coverage.', features: ['1 AI agent','Website chat widget','Email notifications','24/7 availability','Appointment booking'], accent: false },
    { name: 'Growth',  price: '$299', desc: 'For multi-dentist practices and growing clinics.',              features: ['3 AI agents','All Starter features','Google Calendar sync','Zapier integration','Priority support'], accent: true },
  ];
  return (
    <section id="pricing" style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,4vw,64px)', borderTop: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED2, marginBottom: 12 }}>Pricing</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px,3.5vw,48px)', letterSpacing: '-0.03em', color: '#F4F3EE', marginBottom: 14, lineHeight: 1.05 }}>
          Less than one cleaning appointment.
        </h2>
        <p style={{ fontSize: 17, color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>No setup fees. Cancel any time.</p>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(200,255,52,0.07)', border: '1px solid rgba(200,255,52,0.20)', borderRadius: 12, padding: '10px 16px', marginBottom: 48, fontSize: 14, color: ACCENT }}>
          <span>💡</span>
          <span>One new patient = $1,200 lifetime value. Iupiter = $149/mo. <strong>ROI: 8×+ per patient.</strong></span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, maxWidth: 680 }}>
          {plans.map((plan) => (
            <div key={plan.name} style={{ background: plan.accent ? ACCENT : INK2, border: `1px solid ${plan.accent ? 'transparent' : LINE}`, borderRadius: 20, padding: '28px 28px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {plan.accent && <span style={{ display: 'inline-block', width: 'fit-content', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', background: 'rgba(22,33,10,0.18)', color: AINK, padding: '3px 10px', borderRadius: 100 }}>Most popular</span>}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: plan.accent ? '#2C4010' : MUTED2, marginBottom: 8 }}>{plan.name}</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, letterSpacing: '-0.03em', color: plan.accent ? AINK : 'var(--text-primary)' }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: plan.accent ? '#2C4010' : MUTED2 }}>/mo</span>
                </div>
                <p style={{ fontSize: 14.5, color: plan.accent ? '#2C4010' : MUTED, lineHeight: 1.5 }}>{plan.desc}</p>
              </div>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 10, listStyle: 'none', padding: 0 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: plan.accent ? '#2C4010' : MUTED }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={plan.accent ? AINK : GREEN} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/sign-up" style={{ background: plan.accent ? AINK : ACCENT, color: plan.accent ? ACCENT : AINK, fontWeight: 700, fontSize: 15, padding: '14px 20px', borderRadius: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 'auto' }}>
                Fill my schedule tonight <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 24, fontSize: 13, color: MUTED2 }}>
          Not ready?{' '}
          <Link href="https://calendar.app.google/TDFdXZVzzXXYU3DY7" target="_blank" rel="noopener noreferrer" style={{ color: MUTED, textDecorationColor: MUTED2 }}>
            Book a free 15-min call →
          </Link>
        </p>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section id="demo" style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,4vw,64px)', borderTop: `1px solid ${LINE}` }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED2, marginBottom: 12 }}>Live demo</p>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px,3vw,42px)', letterSpacing: '-0.03em', color: '#F4F3EE', marginBottom: 12, lineHeight: 1.05 }}>Try it yourself.</h2>
          <p style={{ fontSize: 16, color: MUTED }}>Real AI dental receptionist — ask it anything a patient would.</p>
        </div>
        <DentistDemo />
      </div>
    </section>
  );
}

function FooterCta({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <footer style={{ borderTop: `1px solid ${LINE}` }}>
      <div style={{ padding: 'clamp(60px,8vw,96px) clamp(20px,4vw,64px)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-20%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '60vw', maxWidth: 800, maxHeight: 800, background: 'radial-gradient(circle at center,rgba(200,255,52,0.07),transparent 60%)', pointerEvents: 'none' }} />
        <p style={{ fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: MUTED2, marginBottom: 20 }}>Stop losing patients</p>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(36px,5vw,64px)', letterSpacing: '-0.035em', color: '#F4F3EE', marginBottom: 20, lineHeight: 1 }}>
          A patient is asking<br />about their toothache right now.
        </h2>
        <p style={{ fontSize: 18, color: MUTED, marginBottom: 40, lineHeight: 1.5, maxWidth: '36ch', margin: '0 auto 40px' }}>
          Set up your AI receptionist in 5 minutes — or book a call and we&apos;ll do it with you.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link href={isLoggedIn ? '/dashboard' : '/sign-up'} style={{ background: ACCENT, color: AINK, fontWeight: 700, fontSize: 16.5, padding: '16px 32px', borderRadius: 12, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 9, boxShadow: '0 8px 30px rgba(200,255,52,0.22)' }}>
            Fill my schedule — free <ArrowRight size={17} />
          </Link>
          <Link href="https://calendar.app.google/TDFdXZVzzXXYU3DY7" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-primary)', border: `1px solid ${STRONG}`, borderRadius: 12, padding: '16px 28px', textDecoration: 'none', fontSize: 16.5, fontWeight: 600 }}>
            Book a free call
          </Link>
        </div>
      </div>
      <div style={{ borderTop: `1px solid ${LINE}`, padding: '20px clamp(20px,4vw,64px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, fontSize: 13, color: MUTED2 }}>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>Iupiter</span>
        <span>© 2026 · Built for dental practices that never want to miss a patient.</span>
      </div>
    </footer>
  );
}
