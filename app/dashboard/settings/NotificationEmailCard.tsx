'use client';

import { useState } from 'react';

export default function NotificationEmailCard({
  orgId,
  defaultEmail,
}: {
  orgId: string;
  defaultEmail: string;
}) {
  const [email, setEmail]   = useState(defaultEmail);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/settings/notification-email', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ orgId, email }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-lg">📬</div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Lead Notifications</p>
          <p className="text-xs text-slate-500">Get an email when your agent receives a new message</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Notification email
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSave}
              disabled={saving || !email}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : 'Save'}
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-400">
          You&apos;ll receive an email on the first message of every new conversation.
        </p>
      </div>
    </div>
  );
}
