'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Trash2, MessageSquare,
  Bot, Loader2, AlertTriangle,
} from 'lucide-react';

const MODELS = [
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash — Fastest & cheapest' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash — Balanced' },
  { value: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro — Most capable' },
];

interface Agent {
  id: string;
  name: string;
  business_context: string | null;
  system_prompt: string | null;
  llm_model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
}

export default function AgentSettingsPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const router = useRouter();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch(`/api/agents/${agentId}`)
      .then((r) => r.json())
      .then((data) => { setAgent(data); setLoading(false); });
  }, [agentId]);

  const handleSave = async () => {
    if (!agent) return;
    setSaving(true);
    await fetch(`/api/agents/${agentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(agent),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleDelete = async () => {
    if (!confirm('Delete this agent? All channel connections will be removed.')) return;
    setDeleting(true);
    await fetch(`/api/agents/${agentId}`, { method: 'DELETE' });
    router.push('/dashboard/agents');
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
    </div>
  );

  if (!agent) return (
    <div className="text-center py-16 text-slate-500">Agent not found.</div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/agents" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{agent.name}</h1>
            <p className="text-sm text-slate-500">Agent Settings</p>
          </div>
        </div>
        <Link
          href={`/dashboard/agents/${agentId}/test`}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          Test Chat
        </Link>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 bg-white rounded-xl border border-slate-200 p-4">
        <span className="text-sm font-medium text-slate-700">Agent Status</span>
        <button
          onClick={() => setAgent({ ...agent, is_active: !agent.is_active })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            agent.is_active ? 'bg-green-500' : 'bg-slate-300'
          }`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            agent.is_active ? 'translate-x-6' : 'translate-x-1'
          }`} />
        </button>
        <span className={`text-sm font-medium ${agent.is_active ? 'text-green-600' : 'text-slate-400'}`}>
          {agent.is_active ? 'Active' : 'Paused'}
        </span>
      </div>

      {/* Main form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Agent Name</label>
          <input
            value={agent.name}
            onChange={(e) => setAgent({ ...agent, name: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Business Context */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Business Context
            <span className="text-slate-400 font-normal ml-1">— injected into every conversation</span>
          </label>
          <textarea
            rows={6}
            placeholder="Describe your business: name, services, prices, hours, location, FAQs..."
            value={agent.business_context ?? ''}
            onChange={(e) => setAgent({ ...agent, business_context: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Custom system prompt */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Custom System Prompt
            <span className="text-slate-400 font-normal ml-1">— overrides the default prompt</span>
          </label>
          <textarea
            rows={4}
            placeholder="Leave empty to use the default Iupiter prompt. Advanced users only."
            value={agent.system_prompt ?? ''}
            onChange={(e) => setAgent({ ...agent, system_prompt: e.target.value || null })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
          />
        </div>

        {/* Divider */}
        <hr className="border-slate-100" />

        {/* LLM Settings */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">AI Model Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
              <select
                value={agent.llm_model}
                onChange={(e) => setAgent({ ...agent, llm_model: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Temperature
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="0" max="1" step="0.1"
                    value={agent.temperature}
                    onChange={(e) => setAgent({ ...agent, temperature: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-slate-600 w-8">{agent.temperature}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Max Tokens
                </label>
                <input
                  type="number" min="50" max="1000" step="50"
                  value={agent.max_tokens}
                  onChange={(e) => setAgent({ ...agent, max_tokens: parseInt(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Delete Agent
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
        >
          {saving
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            : saved
            ? <><span>✓</span> Saved!</>
            : <><Save className="w-4 h-4" /> Save Changes</>
          }
        </button>
      </div>
    </div>
  );
}
