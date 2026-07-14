'use client';

import { useState } from 'react';

type CallStatus = 'idle' | 'requesting' | 'requested' | 'error';

export default function Dialer() {
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState<CallStatus>('idle');
  const [error, setError]   = useState('');

  const call = async () => {
    setError('');
    const cleaned = number.replace(/[^\d+]/g, '');
    if (!/^\+?[0-9]{7,15}$/.test(cleaned)) {
      setError('Enter a valid phone number, e.g. +15551234567');
      return;
    }

    setStatus('requesting');
    try {
      const res = await fetch('/api/zadarma/dial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: cleaned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Call request failed');
      setStatus('requested');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Call request failed');
      setStatus('error');
    }
  };

  const statusLabel: Record<CallStatus, string> = {
    idle:        'Ready',
    requesting:  'Requesting call…',
    requested:   'Your phone is ringing now — answer it to connect to the lead.',
    error:       'Error',
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Dialer</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter a number and click Call — your own phone rings first, then connects you to the lead once you pick up.
      </p>

      <label className="block text-sm font-medium text-gray-700 mb-1">Phone number to call</label>
      <input
        type="tel"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="+15551234567"
        disabled={status === 'requesting'}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
      />

      <button
        onClick={call}
        disabled={status === 'requesting'}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg transition-colors"
      >
        Call
      </button>

      <p className="mt-4 text-sm text-gray-600">
        Status: <span className="font-medium">{statusLabel[status]}</span>
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <p className="mt-6 text-xs text-gray-400">
        Powered by Zadarma&apos;s callback API — no browser mic, no WebRTC. Your phone rings like a normal call, then the lead is dialed in once you answer.
      </p>
    </div>
  );
}
