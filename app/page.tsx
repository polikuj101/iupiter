export const dynamic = 'force-dynamic';
import React from 'react';
import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import {
  ArrowRight, Zap, MessageCircle,
  Building2, UploadCloud, Rocket, Clock,
  TrendingUp, CalendarCheck, Target, HeartHandshake,
} from 'lucide-react';

export default async function HomePage() {
  const { userId } = await auth();
  const isLoggedIn = !!userId;

  return (
    <main className="min-h-screen bg-[#FAFAF9] text-[#0A0A0A] antialiased">
      <Navigation isLoggedIn={isLoggedIn} />
      <HeroSection isLoggedIn={isLoggedIn} />
      <HowItWorksSection />
      <FeaturesSection />
      <DemoSection />
      <CtaFooterSection isLoggedIn={isLoggedIn} />
    </main>
  );
}

// ─── Navigation ──────────────────────────────────────────────────

function Navigation({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-[#FAFAF9]/80 backdrop-blur-md border-b border-[#EAEAEA]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-[17px] font-semibold tracking-tight">
            Iupiter
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#how-it-works" className="text-sm text-[#525252] hover:text-[#0A0A0A] transition-colors">
              How it works
            </Link>
            <Link href="#demo" className="text-sm text-[#525252] hover:text-[#0A0A0A] transition-colors">
              Demo
            </Link>
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-white bg-[#0A0A0A] px-4 py-2 rounded-md hover:bg-[#262626] transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/sign-in" className="text-sm text-[#525252] hover:text-[#0A0A0A] transition-colors">
                    Log in
                  </Link>
                  <Link
                    href="/sign-up"
                    className="text-sm font-medium text-white bg-[#0A0A0A] px-4 py-2 rounded-md hover:bg-[#262626] transition-colors"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────

function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="pt-36 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-6 space-y-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 py-1 text-xs text-[#525252]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Now available for Instagram, WhatsApp & Messenger
          </div>

          <h1 className="text-5xl lg:text-[56px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#0A0A0A]">
            Your AI agent that never sleeps.
          </h1>

          <p className="text-lg text-[#525252] leading-relaxed max-w-lg">
            Build an AI receptionist for your business in minutes. It answers clients 24/7,
            books appointments, and never misses a lead.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={isLoggedIn ? '/dashboard' : '/sign-up'}
              className="inline-flex justify-center items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-[#0A0A0A] hover:bg-[#262626] rounded-md transition-colors"
            >
              Build your agent
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#demo"
              className="inline-flex justify-center items-center gap-2 px-5 py-3 text-sm font-medium text-[#0A0A0A] bg-white hover:bg-[#F5F5F4] border border-[#EAEAEA] rounded-md transition-colors"
            >
              Try live demo
            </Link>
          </div>

          <p className="text-xs text-[#A3A3A3] pt-1">
            No credit card · Free to try · Setup in 5 minutes
          </p>
        </div>

        <div className="lg:col-span-6">
          <BrowserMockup />
        </div>
      </div>
    </section>
  );
}

function BrowserMockup() {
  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none bg-white rounded-xl border border-[#EAEAEA] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_10px_30px_-10px_rgba(0,0,0,0.1)]">
      {/* Window chrome */}
      <div className="flex items-center px-4 py-3 bg-[#FAFAF9] border-b border-[#EAEAEA]">
        <div className="flex space-x-1.5">
          <div className="w-2.5 h-2.5 bg-[#E5E5E5] rounded-full" />
          <div className="w-2.5 h-2.5 bg-[#E5E5E5] rounded-full" />
          <div className="w-2.5 h-2.5 bg-[#E5E5E5] rounded-full" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-white border border-[#EAEAEA] rounded py-1 px-3 text-[11px] text-[#A3A3A3]">
            iupiter.app/inbox
          </div>
        </div>
        <div className="w-10" />
      </div>

      <div className="p-6 h-[460px] flex flex-col bg-white">
        <div className="flex items-center justify-between pb-4 border-b border-[#F5F5F4] mb-5">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[#737373]" />
            <h3 className="text-sm font-medium text-[#0A0A0A]">Recent inquiries</h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#16A34A]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
            AI active
          </div>
        </div>

        <div className="flex-1 space-y-5">
          {/* Customer message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-[#F5F5F4] flex-shrink-0 flex items-center justify-center text-[11px] font-medium text-[#525252] border border-[#EAEAEA]">
              SJ
            </div>
            <div>
              <p className="text-[11px] text-[#737373] mb-1">Sarah Jenkins</p>
              <div className="bg-[#FAFAF9] text-[#0A0A0A] rounded-lg px-3 py-2.5 text-[13px] leading-relaxed max-w-[85%]">
                Hi! Is the 3-bed property in East Austin still available for viewing this weekend?
              </div>
            </div>
          </div>

          {/* Typing */}
          <div className="flex gap-3 items-center animate-[fadeIn_0.5s_ease-out_1s_both]">
            <div className="w-8 h-8 rounded-full bg-[#0A0A0A] flex-shrink-0 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-[#FAFAF9] rounded-lg px-3 py-2.5">
              <TypingDots />
            </div>
          </div>

          {/* AI response */}
          <div className="flex gap-3 justify-end animate-[fadeIn_0.5s_ease-out_2.5s_both]">
            <div className="flex flex-col items-end max-w-[85%]">
              <p className="text-[11px] text-[#737373] mb-1 mr-1">Draft response</p>
              <div className="bg-[#0A0A0A] text-white rounded-lg px-3 py-2.5 text-[13px] leading-relaxed">
                Hi Sarah! Yes, 1245 East Ave is still available. We have an open house this Saturday 1–3 PM. Would you like a private slot before then?
              </div>
              <div className="flex items-center gap-2 mt-2.5">
                <button className="text-[11px] text-[#525252] border border-[#EAEAEA] px-3 py-1.5 rounded hover:bg-[#F5F5F4] transition-colors">
                  Edit
                </button>
                <button className="text-[11px] text-white bg-[#16A34A] px-3 py-1.5 rounded hover:bg-[#15803D] transition-colors">
                  Approve & send
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex gap-1 items-center h-3">
      <span className="w-1 h-1 bg-[#A3A3A3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1 h-1 bg-[#A3A3A3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1 h-1 bg-[#A3A3A3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

// ─── How it works ───────────────────────────────────────────────

function HowItWorksSection() {
  const steps = [
    { icon: Building2, title: 'Describe your business', desc: 'Enter your business name, services, and pricing.' },
    { icon: UploadCloud, title: 'Upload knowledge', desc: 'Drop your price list, FAQ, or docs — PDF, Excel, Word.' },
    { icon: Rocket, title: 'Launch your agent', desc: 'Your AI receptionist is live and answers 24/7.' },
  ];

  return (
    <section id="how-it-works" className="py-24 px-6 border-t border-[#EAEAEA] bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-16">
          <p className="text-xs font-medium text-[#737373] uppercase tracking-wider mb-3">How it works</p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-[#0A0A0A]">
            Three steps. Five minutes. Done.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((item, i) => (
            <div key={i} className="rounded-lg border border-[#EAEAEA] bg-[#FAFAF9] p-6 hover:bg-white transition-colors">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono text-[#A3A3A3]">0{i + 1}</span>
                <div className="h-px flex-1 bg-[#EAEAEA]" />
                <item.icon className="w-4 h-4 text-[#525252]" />
              </div>
              <h3 className="text-base font-medium text-[#0A0A0A] mb-2">{item.title}</h3>
              <p className="text-sm text-[#525252] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ────────────────────────────────────────────────────

function FeaturesSection() {
  const features = [
    { icon: Zap, title: '2-second response', desc: 'Clients get instant answers. No waiting, no missed leads.' },
    { icon: Clock, title: '24/7 availability', desc: 'Works nights, weekends, and holidays. Never calls in sick.' },
    { icon: TrendingUp, title: 'Smart upselling', desc: 'Suggests complementary services to increase your average ticket.' },
    { icon: CalendarCheck, title: 'Appointment reminders', desc: 'Automatic 24h and 2h reminders. Reduces no-shows by 60%.' },
    { icon: Target, title: 'Lead scoring', desc: 'Automatically tags leads as hot, warm, or cold.' },
    { icon: HeartHandshake, title: 'Human handoff', desc: 'Seamlessly transfers to a real person when needed.' },
  ];

  return (
    <section className="py-24 px-6 border-t border-[#EAEAEA]">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-xl mb-16">
          <p className="text-xs font-medium text-[#737373] uppercase tracking-wider mb-3">Features</p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-[#0A0A0A]">
            Everything your receptionist does — minus the salary.
          </h2>
          <p className="text-base text-[#525252] mt-4 leading-relaxed">
            A $3,000/month receptionist vs $150/month AI that works 3× harder.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#EAEAEA] rounded-lg overflow-hidden border border-[#EAEAEA]">
          {features.map((item, i) => (
            <div key={i} className="bg-white p-6 hover:bg-[#FAFAF9] transition-colors">
              <item.icon className="w-4 h-4 text-[#525252] mb-4" />
              <h3 className="text-sm font-medium text-[#0A0A0A] mb-1.5">{item.title}</h3>
              <p className="text-sm text-[#525252] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Demo ────────────────────────────────────────────────────────

function DemoSection() {
  return (
    <section id="demo" className="py-24 px-6 border-t border-[#EAEAEA] bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-medium text-[#737373] uppercase tracking-wider mb-3">Live demo</p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-[#0A0A0A]">
            Try it yourself.
          </h2>
        </div>

        <div className="border border-[#EAEAEA] rounded-lg overflow-hidden">
          <div className="border-b border-[#EAEAEA] p-5 flex items-center gap-3 bg-[#FAFAF9]">
            <div className="w-9 h-9 rounded-full bg-white border border-[#EAEAEA] flex items-center justify-center text-sm font-medium text-[#0A0A0A]">
              S
            </div>
            <div>
              <p className="text-sm font-medium text-[#0A0A0A] flex items-center gap-2">
                Sophie
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              </p>
              <p className="text-xs text-[#737373]">Glamour Nails Studio</p>
            </div>
          </div>

          <div className="p-6 h-[260px] bg-white">
            <div className="flex gap-3 items-start">
              <div className="w-7 h-7 rounded-full bg-[#F5F5F4] border border-[#EAEAEA] flex items-center justify-center text-[11px] font-medium text-[#525252]">
                S
              </div>
              <div className="bg-[#FAFAF9] text-[#0A0A0A] rounded-lg px-4 py-2.5 text-sm leading-relaxed max-w-[85%]">
                Hi! 👋 I'm Sophie from Glamour Nails. Looking to book an appointment or have questions about our services?
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-[#EAEAEA] bg-[#FAFAF9] flex gap-2 items-center">
            <input
              type="text"
              placeholder="Type a message..."
              disabled
              className="flex-1 bg-white border border-[#EAEAEA] rounded-md px-3 py-2 text-sm outline-none"
            />
            <button disabled className="bg-[#0A0A0A] text-white p-2 rounded-md opacity-50 cursor-not-allowed">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer CTA ──────────────────────────────────────────────────

function CtaFooterSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <footer className="border-t border-[#EAEAEA]">
      <div className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-semibold tracking-[-0.02em] text-[#0A0A0A] mb-5">
            Ready to stop losing clients?
          </h2>
          <p className="text-lg text-[#525252] mb-8 leading-relaxed">
            Build your own AI agent in 5 minutes — or let us set it up for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={isLoggedIn ? '/dashboard' : '/sign-up'}
              className="inline-flex justify-center items-center gap-2 px-5 py-3 text-sm font-medium text-white bg-[#0A0A0A] hover:bg-[#262626] rounded-md transition-colors"
            >
              Build your agent
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="https://t.me/bo_mirash"
              className="inline-flex justify-center items-center gap-2 px-5 py-3 text-sm font-medium text-[#0A0A0A] bg-white hover:bg-[#F5F5F4] border border-[#EAEAEA] rounded-md transition-colors"
            >
              Contact on Telegram
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-[#EAEAEA] py-6 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center text-xs text-[#737373]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#0A0A0A]">Iupiter</span>
            <span>© 2026</span>
          </div>
          <p>Built for businesses that move fast.</p>
        </div>
      </div>
    </footer>
  );
}
