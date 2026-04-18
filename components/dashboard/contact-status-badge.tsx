'use client';

import { useState } from 'react';
import type { LeadStatus } from '@/lib/supabase/types';

const STATUS_STYLES: Record<LeadStatus, string> = {
  new:       'bg-slate-100  text-slate-600',
  contacted: 'bg-blue-100   text-blue-700',
  qualified: 'bg-purple-100 text-purple-700',
  converted: 'bg-green-100  text-green-700',
  lost:      'bg-red-100    text-red-600',
};

const ALL_STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost'];

export default function ContactStatusBadge({
  status: initialStatus,
  contactId,
}: {
  status: LeadStatus;
  contactId: string;
}) {
  const [status, setStatus] = useState<LeadStatus>(initialStatus);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = async (next: LeadStatus) => {
    setSaving(true);
    setOpen(false);
    const res = await fetch(`/api/contacts/${contactId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead_status: next }),
    });
    if (res.ok) setStatus(next);
    setSaving(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        disabled={saving}
        className={`capitalize text-xs font-medium px-2.5 py-1 rounded-full transition-opacity ${STATUS_STYLES[status]} ${saving ? 'opacity-50' : 'hover:opacity-80'}`}
      >
        {status}
      </button>

      {open && (
        <div className="absolute top-7 left-0 z-10 bg-white rounded-lg border border-slate-200 shadow-lg py-1 min-w-32">
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => handleChange(s)}
              className={`w-full text-left px-3 py-1.5 text-xs capitalize hover:bg-slate-50 transition-colors ${s === status ? 'font-semibold' : ''}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
