'use client';

import { useState } from 'react';

export default function FollowUpBossCard({
  defaultApiKey,
}: {
  defaultApiKey: string;
}) {
  const [apiKey, setApiKey]   = useState(defaultApiKey);
  const [saving, setSaving]   = useState(false);
  const [status, setStatus]   = useState<'idle' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setStatus('idle');
    setErrorMsg('');

    const res = await fetch('/api/settings/follow-up-boss', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ apiKey }),
    });

    const data = await res.json() as { ok?: boolean; error?: string };
    setSaving(false);

    if (!res.ok) {
      setStatus('error');
      setErrorMsg(data.error ?? 'Something went wrong');
    } else {
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 2500);
    }
  };

  const handleDisconnect = async () => {
    setApiKey('');
    setSaving(true);
    await fetch('/api/settings/follow-up-boss', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ apiKey: '' }),
    });
    setSaving(false);
    setStatus('idle');
  };

  const isConnected = !!defaultApiKey;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-lg">🏡</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Follow Up Boss</p>
          <p className="text-xs text-slate-500">Automatically send captured leads to your CRM</p>
        </div>
        {isConnected && (
          <span className="text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            ● Connected
          </span>
        )}
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            API Key
          </label>
          <div className="flex gap-2">
            <input
              type="password"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Paste your Follow Up Boss API key"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <button
              onClick={handleSave}
              disabled={saving || !apiKey}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Verifying…' : status === 'saved' ? '✓ Saved' : 'Connect'}
            </button>
          </div>
          {status === 'error' && (
            <p className="text-xs text-red-500 mt-1.5">{errorMsg}</p>
          )}
        </div>

        <p className="text-xs text-slate-400">
          Find your API key in Follow Up Boss → Admin → API → Your API Keys.
          Every new lead captured by your AI agent will be automatically added as a contact.
        </p>

        {isConnected && (
          <button
            onClick={handleDisconnect}
            disabled={saving}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
