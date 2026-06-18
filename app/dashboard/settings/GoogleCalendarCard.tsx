'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleCalendarCard({ connected }: { connected: boolean }) {
  const router                         = useRouter();
  const [disconnecting, setDisconn]    = useState(false);

  const handleConnect = () => {
    window.location.href = '/api/auth/google';
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect Google Calendar? Your agents will no longer be able to book appointments.')) return;
    setDisconn(true);
    await fetch('/api/auth/google/disconnect', { method: 'POST' });
    router.refresh();
    setDisconn(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center text-lg">
            📅
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Google Calendar</p>
            <p className="text-xs text-slate-500">AI agents book appointments directly into your calendar</p>
          </div>
        </div>
        {connected ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
            ● Connected
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
            Not connected
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">
        {connected ? (
          <>
            {/* Connected state */}
            <div className="rounded-lg bg-green-50 border border-green-100 px-4 py-3 text-xs text-green-800 space-y-1">
              <p className="font-semibold">✅ Your agents can now book appointments</p>
              <p>When a customer asks to book, the AI collects their name, date, time, and service — then creates the event in your Google Calendar automatically.</p>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700">How to test it</p>
              <p>Open your agent&apos;s Test Chat and type: <span className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded">&quot;I want to book an appointment for tomorrow at 2pm&quot;</span></p>
            </div>

            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors disabled:opacity-50"
            >
              {disconnecting ? 'Disconnecting…' : 'Disconnect Google Calendar'}
            </button>
          </>
        ) : (
          <>
            {/* Not connected state */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-800 space-y-1">
              <p className="font-semibold">How it works after connecting:</p>
              <p>1. Customer chats: &quot;I want to book for Tuesday at 3pm&quot;</p>
              <p>2. Agent collects their name and service details</p>
              <p>3. Event is created in your Google Calendar instantly</p>
              <p>4. Customer gets a confirmation message</p>
            </div>

            <button
              onClick={handleConnect}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-medium text-sm px-4 py-2.5 rounded-lg transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Connect Google Calendar
            </button>

            <p className="text-xs text-slate-400">
              You&apos;ll be redirected to Google to grant access. We only request permission to create calendar events.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
