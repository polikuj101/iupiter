'use client';

import { useEffect, useState } from 'react';

type Lead = {
  initials: string;
  name: string;
  snippet: string;
  time: string;
  badge: string;
  badgeColor: string;
};

const ALL_LEADS: Lead[] = [
  { initials: 'JM', name: 'James Mitchell',  snippet: 'Is 14 Maple Ave still available?',       time: '11:47 pm', badge: 'New',        badgeColor: 'bg-blue-100 text-blue-700' },
  { initials: 'SR', name: 'Sofia Rodriguez', snippet: 'Budget ~€380K — 3 bed, south Dublin',    time: '11:52 pm', badge: 'Qualified',  badgeColor: 'bg-amber-100 text-amber-700' },
  { initials: 'TK', name: 'Tom Kavanagh',    snippet: 'Can I book a viewing for Saturday?',     time: '12:01 am', badge: 'Tour booked', badgeColor: 'bg-emerald-100 text-emerald-700' },
  { initials: 'LB', name: 'Liam Burke',      snippet: 'What\'s the price per sqm in D9?',       time: 'just now', badge: 'New',        badgeColor: 'bg-blue-100 text-blue-700' },
  { initials: 'AO', name: 'Aoife O\'Neill',  snippet: 'Do you handle lettings near Sandyford?', time: 'just now', badge: 'New',        badgeColor: 'bg-blue-100 text-blue-700' },
  { initials: 'DF', name: 'Declan Farrell',  snippet: 'Interested in the D4 listing — €695K',  time: 'just now', badge: 'Qualified',  badgeColor: 'bg-amber-100 text-amber-700' },
];

export default function LiveMockup() {
  const [rows, setRows] = useState<Lead[]>(ALL_LEADS.slice(0, 3));
  const [nextIndex, setNextIndex] = useState(3);
  const [entering, setEntering] = useState<string | null>(null);

  // Every 2.8 seconds: swap oldest lead for a new one
  useEffect(() => {
    const id = setInterval(() => {
      const newLead = ALL_LEADS[nextIndex % ALL_LEADS.length];
      setEntering(newLead.initials);
      setTimeout(() => {
        setRows((prev) => [newLead, ...prev.slice(0, 2)]);
        setEntering(null);
      }, 300);
      setNextIndex((n) => n + 1);
    }, 2800);
    return () => clearInterval(id);
  }, [nextIndex]);

  return (
    <div className="relative w-full max-w-lg mx-auto lg:max-w-none">
      {/* Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-100/40 to-blue-100/20 blur-2xl translate-y-6 translate-x-2 pointer-events-none" />

      <div className="relative bg-white rounded-2xl border border-[#EAEAEA] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05),0_24px_64px_-16px_rgba(0,0,0,0.14)]">

        {/* Browser chrome */}
        <div className="flex items-center px-4 py-3 bg-[#FAFAF9] border-b border-[#EAEAEA]">
          <div className="flex space-x-1.5">
            <div className="w-2.5 h-2.5 bg-[#FF5F57] rounded-full" />
            <div className="w-2.5 h-2.5 bg-[#FFBD2E] rounded-full" />
            <div className="w-2.5 h-2.5 bg-[#28C840] rounded-full" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-white border border-[#EAEAEA] rounded-md py-1 px-4 text-[11px] text-[#A3A3A3] flex items-center gap-1.5">
              <svg className="w-2.5 h-2.5 text-[#C4C4C4]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              iupiter.app/inbox
            </div>
          </div>
          <div className="w-14" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAEAEA]">
          <div>
            <span className="text-[13px] font-semibold text-[#0A0A0A]">Apex Realty AI</span>
            <p className="text-[11px] text-[#A3A3A3] mt-0.5">Tonight&apos;s leads</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#0D9488] bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-pulse" />
            Active
          </div>
        </div>

        {/* Conversation rows */}
        <div className="divide-y divide-[#F5F5F4] overflow-hidden">
          {rows.map((row, i) => (
            <div
              key={`${row.initials}-${i}`}
              className={`flex items-center gap-3.5 px-5 py-3.5 transition-all duration-300 ease-out ${
                entering === row.initials
                  ? 'opacity-0 -translate-y-2'
                  : 'opacity-100 translate-y-0'
              } ${i === 0 ? 'bg-teal-50/40' : 'hover:bg-[#FAFAF9]'}`}
            >
              <div className="w-8 h-8 rounded-full bg-[#F5F5F4] border border-[#EAEAEA] flex-shrink-0 flex items-center justify-center text-[11px] font-semibold text-[#525252]">
                {row.initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-medium text-[#0A0A0A]">{row.name}</span>
                  <span className={`text-[10px] font-medium px-1.5 py-px rounded-full leading-none ${row.badgeColor}`}>
                    {row.badge}
                  </span>
                </div>
                <p className="text-[12px] text-[#737373] truncate">{row.snippet}</p>
              </div>
              <span className="text-[11px] text-[#A3A3A3] flex-shrink-0">{row.time}</span>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[#EAEAEA] bg-[#FAFAF9]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
            <span className="text-[11px] text-[#525252]">3 leads captured tonight</span>
          </div>
          <span className="text-[11px] text-[#A3A3A3]">while you slept</span>
        </div>

      </div>
    </div>
  );
}
