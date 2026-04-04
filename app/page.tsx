'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ArrowRight, PlayCircle, Zap, MessageCircle,
  Building2, UploadCloud, Rocket, Clock, 
  TrendingUp, CalendarCheck, Target, HeartHandshake
} from 'lucide-react';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#FAFBFC] font-sans text-[#1F2937]">
      <Navigation />
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <DemoSection />
      <CtaFooterSection />
    </main>
  );
}

function Navigation() {
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold text-[#2563EB] tracking-tight">
              Saleon
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-[#1F2937] hover:text-[#2563EB] transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="#demo"
              className="text-sm font-medium text-[#1F2937] hover:text-[#2563EB] transition-colors"
            >
              Live Demo
            </Link>
            <div className="flex items-center space-x-4 pl-4">
              <Link
                href="/api/auth/login"
                className="text-sm font-medium text-[#1F2937] px-5 py-2.5 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                Login
              </Link>
              <Link
                href="/api/auth/signup"
                className="text-sm font-medium text-white bg-[#2563EB] px-5 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all"
              >
                Start Free Trial
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button className="text-gray-600 hover:text-gray-900 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-[#FAFBFC]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <HeroContent />
        <BrowserMockup />
      </div>
    </section>
  );
}

function HeroContent() {
  return (
    <div className="space-y-8 z-10 text-center lg:text-left">
      {/* Badge */}
      <div className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-[#2563EB] bg-[#EBF5FF]">
        <span>Now available for Instagram DMs</span>
      </div>

      {/* Headline with gradient */}
      <h1 className="text-5xl lg:text-[64px] font-bold leading-[1.1] tracking-tight text-[#1F2937]">
        Your AI agent that <br className="hidden lg:block" />
        <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          never sleeps
        </span>
      </h1>

      {/* Subheadline */}
      <p className="text-[20px] text-gray-600 leading-[1.6] max-w-2xl mx-auto lg:mx-0">
        Build an AI receptionist for your business in minutes. It answers clients 24/7, books appointments, and never misses a lead — while you sleep.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
        <Link
          href="/api/auth/signup"
          className="inline-flex justify-center items-center gap-2 px-6 py-3.5 text-base font-medium text-white bg-[#2563EB] hover:bg-blue-700 rounded-lg shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          Build Your Agent
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          href="#demo"
          className="inline-flex justify-center items-center gap-2 px-6 py-3.5 text-base font-medium text-[#1F2937] bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-sm"
        >
          <PlayCircle className="w-5 h-5 text-gray-400" />
          Try Live Demo
        </Link>
      </div>

      {/* Disclaimer */}
      <p className="text-sm font-medium text-gray-500 flex flex-wrap items-center justify-center lg:justify-start gap-3">
        <span>No credit card</span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        <span>Free to try</span>
        <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
        <span>Setup in 5 minutes</span>
      </p>
    </div>
  );
}

function BrowserMockup() {
  return (
    <div className="relative mt-12 lg:mt-0 z-10 perspective-1000">
      {/* Decorative metadata float */}
      <div className="absolute -right-8 top-12 z-20 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-gray-100 animate-[bounce_4s_ease-in-out_infinite]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#EBF5FF] flex items-center justify-center shadow-inner">
             <Zap className="w-5 h-5 text-[#2563EB]" fill="currentColor" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Response Time</p>
            <p className="text-sm text-gray-900 font-bold">&lt; 30 secs</p>
          </div>
        </div>
      </div>

      <div className="relative w-full max-w-lg lg:max-w-none mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform-gpu hover:-translate-y-1 transition-transform duration-500">
        {/* macOS window chrome */}
        <div className="flex items-center px-4 py-3 bg-[#FAFBFC] border-b border-gray-100">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-[#FF5F56] rounded-full border border-[#E0443E]/30"></div>
            <div className="w-3 h-3 bg-[#FFBD2E] rounded-full border border-[#DEA123]/30"></div>
            <div className="w-3 h-3 bg-[#27C93F] rounded-full border border-[#1AAB29]/30"></div>
          </div>
          {/* URL bar */}
          <div className="flex-1 flex justify-center ml-4">
            <div className="bg-white border border-gray-200 rounded-md py-1.5 px-4 text-xs font-medium text-gray-500 shadow-sm flex items-center space-x-2 w-64 justify-center">
              <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>saleon.ai/dashboard</span>
            </div>
          </div>
          <div className="w-10" /> {/* Spacer for symmetry */}
        </div>

        {/* Chat interface */}
        <div className="p-6 h-[520px] flex flex-col bg-white">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#EBF5FF] text-[#2563EB] rounded-lg">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-[#1F2937] text-lg">Recent Inquiries</h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#ECFDF5] text-[#10B981] rounded-full text-xs font-medium border border-[#A7F3D0]">
               <div className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></div>
               AI Active
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {/* Customer message */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center text-red-600 font-medium text-sm border border-red-200">
                SJ
              </div>
              <div>
                <p className="text-[13px] font-medium text-gray-500 mb-1">Sarah Jenkins</p>
                <div className="bg-[#F3F4F6] text-[#1F2937] rounded-2xl rounded-tl-sm px-4 py-3 text-[15px] leading-relaxed max-w-[90%]">
                  Hi there! Is the 3-bed property in East Austin still available for viewing this weekend?
                </div>
              </div>
            </div>

            {/* AI is Typing */}
            <div className="flex gap-4 items-center animate-[fadeIn_0.5s_ease-out_1s_both]">
              <div className="w-10 h-10 rounded-full bg-[#EBF5FF] flex-shrink-0 flex items-center justify-center border border-blue-100">
                <Zap className="w-5 h-5 text-[#2563EB]" />
              </div>
              <div>
                <p className="text-[13px] font-medium text-gray-500 mb-1">Saleon AI</p>
                <div className="flex items-center gap-3">
                   <div className="bg-[#F3F4F6] rounded-2xl rounded-tl-sm px-4 py-3 h-[46px] flex items-center">
                     <TypingDots />
                   </div>
                   <span className="text-xs text-gray-400 font-medium animate-pulse">Saleon AI is typing...</span>
                </div>
              </div>
            </div>

            {/* AI Response Bubble */}
            <div className="flex gap-4 justify-end animate-[fadeIn_0.5s_ease-out_2.5s_both]">
              <div className="flex flex-col items-end">
                 <p className="text-[13px] font-medium text-gray-500 mb-1 mr-1">Draft Response</p>
                 <div className="bg-[#2563EB] text-white rounded-2xl rounded-tr-sm px-5 py-4 text-[15px] leading-relaxed max-w-sm shadow-md">
                   Hi Sarah! Yes, 1245 East Ave is still available. We have an open house this Saturday from 1pm-3pm. Would you like me to book you a private slot before then?
                 </div>
                 
                 {/* Action buttons */}
                 <div className="flex items-center gap-2 mt-3">
                    <button className="text-xs font-medium bg-white text-gray-600 border border-gray-200 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors shadow-sm">
                      Edit Response
                    </button>
                    <button className="text-xs font-medium bg-[#10B981] text-white border border-[#10B981] px-4 py-2 rounded-full hover:bg-[#059669] hover:border-[#059669] transition-colors shadow-sm">
                      Approve & Send
                    </button>
                 </div>
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
    <div className="flex gap-1.5 items-center justify-center h-2">
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2937] mb-4">How it works</h2>
          <p className="text-lg text-gray-600">Three steps. Five minutes. Done.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Building2, title: "Describe your business", desc: "Enter your business name, services, and pricing." },
            { icon: UploadCloud, title: "Upload knowledge", desc: "Drop your price list, FAQ, or any document — PDF, Excel, Word." },
            { icon: Rocket, title: "Launch your agent", desc: "Your AI receptionist is live. It answers clients 24/7." }
          ].map((item, i) => (
            <div key={i} className="bg-[#FAFBFC] rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="w-12 h-12 bg-[#EBF5FF] text-[#2563EB] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#1F2937] mb-3">{item.title}</h3>
              <p className="text-gray-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { icon: Zap, title: "2-second response", desc: "Clients get instant answers. No waiting, no missed leads." },
    { icon: Clock, title: "24/7 availability", desc: "Works nights, weekends, and holidays. Never calls in sick." },
    { icon: TrendingUp, title: "Smart upselling", desc: "Suggests complementary services to increase your average ticket." },
    { icon: CalendarCheck, title: "Appointment reminders", desc: "Automatic reminders 24h and 2h before. Reduces no-shows by 60%." },
    { icon: Target, title: "Lead scoring", desc: "Automatically tags leads as hot, warm, or cold. Focus on what matters." },
    { icon: HeartHandshake, title: "Human handoff", desc: "Seamlessly transfers to a real person when needed. No dead ends." },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[#FAFBFC]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2937] mb-4">
            Everything your receptionist does — minus the salary
          </h2>
          <p className="text-lg text-gray-600">
            A $3,000/month receptionist vs a $150/month AI that works 3x harder.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-[#EBF5FF] text-[#2563EB] rounded-xl mt-1 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1F2937] text-lg mb-2">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed text-[15px]">{item.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoSection() {
  return (
    <section id="demo" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-100">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#1F2937] mb-4">Try it yourself</h2>
          <p className="text-lg text-gray-600">Chat with a live AI agent. Pick an industry below.</p>
        </div>

        <div className="bg-[#FAFBFC] border border-gray-200 rounded-2xl overflow-hidden shadow-xl max-w-2xl mx-auto hover:shadow-2xl transition-shadow">
          {/* Header */}
          <div className="bg-white border-b border-gray-100 p-5 flex items-center gap-4 relative">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold border border-pink-200 text-xl">
              S
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                Sophie <div className="w-2 h-2 rounded-full bg-[#10B981]"></div>
              </h3>
              <p className="text-sm text-gray-500">Glamour Nails Studio</p>
            </div>
          </div>
          
          {/* Chat Window */}
          <div className="p-6 h-[320px] flex flex-col bg-white">
            <div className="flex gap-4 items-end">
               <div className="w-9 h-9 rounded-full bg-pink-100 flex-shrink-0 flex items-center justify-center text-pink-600 font-medium text-[13px] border border-pink-200">
                 S
               </div>
               <div className="flex flex-col">
                 <p className="text-xs text-gray-500 font-medium mb-1 pl-1">Sophie</p>
                 <div className="bg-[#F3F4F6] text-[#1F2937] rounded-2xl rounded-bl-sm px-5 py-3.5 text-[15px] leading-relaxed max-w-[90%] shadow-sm">
                   Hi there! 👋 I'm Sophie from Glamour Nails. Looking to book an appointment or have questions about our services?
                 </div>
               </div>
            </div>
          </div>
          
          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 flex gap-3 items-center">
            <input type="text" placeholder="Type a message..." className="flex-1 bg-[#FAFBFC] border border-gray-200 rounded-full px-5 py-3 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-blue-100 transition-all text-[15px]" disabled />
            <button className="bg-[#2563EB] text-white p-3 rounded-full hover:bg-blue-700 transition-all shadow-sm hover:shadow-md" disabled>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaFooterSection() {
  return (
    <footer className="bg-[#FAFBFC] border-t border-gray-200 pt-24 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-20 md:mb-24">
        <h2 className="text-4xl lg:text-5xl font-bold text-[#1F2937] mb-6">Ready to stop losing clients?</h2>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Build your own AI agent in 5 minutes — or let us set it up for you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/api/auth/signup"
            className="inline-flex justify-center items-center gap-2 px-8 py-4 text-[17px] font-medium text-white bg-[#2563EB] hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5"
          >
            Build Your Agent
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="https://t.me/bo_mirash"
            className="inline-flex justify-center items-center gap-2 px-8 py-4 text-[17px] font-medium text-[#1F2937] bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm transition-all hover:-translate-y-0.5"
          >
            Contact on Telegram
          </Link>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-sm">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <span className="font-bold text-[#2563EB] text-lg">Saleon</span>
          <span>© 2026 AI Agent Constructor</span>
        </div>
        <p>Built with ❤️</p>
      </div>
    </footer>
  );
}
