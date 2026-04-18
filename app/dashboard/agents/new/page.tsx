'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const MODELS = [
  { value: 'gemini-2.0-flash',    label: 'Gemini 2.0 Flash (Fastest)' },
  { value: 'gemini-1.5-flash',    label: 'Gemini 1.5 Flash' },
  { value: 'gemini-1.5-pro',      label: 'Gemini 1.5 Pro (Smarter)' },
];

export default function NewAgentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    businessContext: '',
    llmModel: 'gemini-2.0-flash',
    temperature: '0.7',
    maxTokens: '300',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        business_context: form.businessContext,
        llm_model: form.llmModel,
        temperature: parseFloat(form.temperature),
        max_tokens: parseInt(form.maxTokens),
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/agents/${data.id}`);
    } else {
      setLoading(false);
      alert('Failed to create agent — check your connection');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/agents" className="text-slate-400 hover:text-slate-600">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Agent</h1>
          <p className="text-slate-500 text-sm">Configure your AI receptionist</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Agent Name
          </label>
          <input
            required
            placeholder="e.g. Sophie — Nail Studio"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Business Context */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Business Context
            <span className="text-slate-400 font-normal ml-1">(injected into system prompt)</span>
          </label>
          <textarea
            rows={5}
            placeholder="Describe your business: name, services, prices, hours, location, FAQs. The more detail, the better the AI performs."
            value={form.businessContext}
            onChange={(e) => setForm({ ...form, businessContext: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            AI Model
          </label>
          <select
            value={form.llmModel}
            onChange={(e) => setForm({ ...form, llmModel: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MODELS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Temperature + Max tokens */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Temperature
              <span className="text-slate-400 font-normal ml-1">0 = precise, 1 = creative</span>
            </label>
            <input
              type="number" min="0" max="1" step="0.1"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Max Response Tokens
            </label>
            <input
              type="number" min="50" max="1000" step="50"
              value={form.maxTokens}
              onChange={(e) => setForm({ ...form, maxTokens: e.target.value })}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Bot className="w-4 h-4" />
          {loading ? 'Creating...' : 'Create Agent'}
        </button>
      </form>
    </div>
  );
}
