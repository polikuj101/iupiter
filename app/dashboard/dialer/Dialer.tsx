'use client';

import { useEffect, useRef, useState } from 'react';

type CallStatus = 'idle' | 'connecting' | 'ringing' | 'in-progress' | 'ended' | 'error';

function extractMsg(err: unknown): string {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (typeof err === 'object') {
    const e = err as Record<string, unknown>;
    return String(e.message ?? e.description ?? e.code ?? JSON.stringify(err));
  }
  return String(err);
}

export default function Dialer() {
  const [number, setNumber]   = useState('');
  const [status, setStatus]   = useState<CallStatus>('idle');
  const [error, setError]     = useState('');
  const deviceRef             = useRef<import('@twilio/voice-sdk').Device | null>(null);
  const callRef               = useRef<import('@twilio/voice-sdk').Call | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const { Device } = await import('@twilio/voice-sdk');
        const res = await fetch('/api/twilio/voice-token');
        if (!res.ok) throw new Error('Could not get a call token. Check Twilio config.');
        const { token } = await res.json();

        if (!mounted) return;
        const device = new Device(token, { logLevel: 1 });
        device.on('error', (e) => {
          console.error('[Twilio device error]', e);
          setError(extractMsg(e) || 'Device error');
        });
        deviceRef.current = device;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize dialer');
      }
    })();

    return () => {
      mounted = false;
      deviceRef.current?.destroy();
    };
  }, []);

  const call = async () => {
    setError('');
    const cleaned = number.replace(/[^\d+]/g, '');
    if (!/^\+?[0-9]{7,15}$/.test(cleaned)) {
      setError('Enter a valid phone number, e.g. +15551234567');
      return;
    }
    if (!deviceRef.current) {
      setError('Dialer not ready yet — wait a moment and try again.');
      return;
    }

    setStatus('connecting');
    try {
      const activeCall = await deviceRef.current.connect({ params: { To: cleaned } });
      callRef.current = activeCall;
      activeCall.on('ringing', () => setStatus('ringing'));
      activeCall.on('accept', () => setStatus('in-progress'));
      activeCall.on('disconnect', () => setStatus('ended'));
      activeCall.on('error', (e) => { console.error('[Twilio call error]', e); setError(extractMsg(e)); setStatus('error'); });
    } catch (err) {
      console.error('[Twilio connect throw]', err);
      setError(extractMsg(err) || 'Call failed to start');
      setStatus('error');
    }
  };

  const hangup = () => {
    callRef.current?.disconnect();
    setStatus('ended');
  };

  const statusLabel: Record<CallStatus, string> = {
    idle:        'Ready',
    connecting:  'Calling your phone…',
    ringing:     'Ringing target…',
    'in-progress': 'Connected',
    ended:       'Call ended',
    error:       'Error',
  };

  return (
    <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900 mb-1">Browser dialer</h1>
      <p className="text-sm text-gray-500 mb-6">
        Talk through your mic and speakers — connects directly from this browser tab.
      </p>

      <label className="block text-sm font-medium text-gray-700 mb-1">Phone number to call</label>
      <input
        type="tel"
        value={number}
        onChange={(e) => setNumber(e.target.value)}
        placeholder="+15551234567"
        disabled={status === 'connecting' || status === 'ringing' || status === 'in-progress'}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
      />

      <div className="flex gap-3">
        <button
          onClick={call}
          disabled={status === 'connecting' || status === 'ringing' || status === 'in-progress'}
          className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          Call
        </button>
        <button
          onClick={hangup}
          disabled={status === 'idle' || status === 'ended'}
          className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          Hang up
        </button>
      </div>

      <p className="mt-4 text-sm text-gray-600">
        Status: <span className="font-medium">{statusLabel[status]}</span>
      </p>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <p className="mt-6 text-xs text-gray-400">
        Allow microphone access when your browser asks — that&apos;s how your voice reaches the call.
      </p>
    </div>
  );
}
