'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, Save, Trash2, MessageSquare,
  Bot, Loader2, ExternalLink, Copy, Check,
} from 'lucide-react';

// ─── Models with optimal temperatures ────────────────────────────

const MODELS = [
  { value: 'gemini-2.5-flash',      label: 'Gemini 2.5 Flash',      badge: 'Free quota', temp: 0.7 },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', badge: 'Free quota', temp: 0.5 },
];

// ─── System prompt presets ────────────────────────────────────────

const PROMPT_PRESETS = [
  {
    label: 'Construction', emoji: '🏗️',
    prompt: `You are a professional AI assistant for a construction and contracting company.

Your role:
- Answer questions about construction services, timelines, and estimates
- Help clients understand the project workflow from consultation to completion
- Collect project details: type of work, location, size, budget range, and preferred timeline
- Schedule consultations and site visits with our team

Rules:
- Always sound professional and knowledgeable
- Never provide exact pricing without a site assessment — offer a free consultation instead
- Respond in the same language the client uses
- Keep replies short: 1–3 sentences, then ask a follow-up question
- Do not use markdown, bullet points, or bold text in replies`,
  },
  {
    label: 'E-commerce', emoji: '🛍️',
    prompt: `You are a friendly AI shopping assistant for an online store.

Your role:
- Help customers find products that match their needs
- Answer questions about product details, availability, sizes, and colors
- Assist with order status, shipping times, and return policy
- Handle complaints and direct complex issues to the support team

Rules:
- Be upbeat, helpful, and concise
- Never promise delivery dates you are not certain about
- Respond in the same language the customer uses
- Keep replies short and end with a helpful question or next step
- Do not use markdown formatting in replies`,
  },
  {
    label: 'HVAC', emoji: '❄️',
    prompt: `You are a knowledgeable AI assistant for an HVAC (heating, ventilation, and air conditioning) company.

Your role:
- Help customers diagnose common AC and heating issues
- Answer questions about maintenance, installations, and repairs
- Collect key information: equipment type, issue description, property size, and location
- Book service appointments with our certified technicians

Rules:
- Sound confident and professional — customers trust you with their home comfort
- For safety issues (gas leaks, electrical problems), always advise calling immediately
- Never give a repair quote without an on-site inspection
- Respond in the same language the client uses
- Keep replies concise and end with one actionable question`,
  },
  {
    label: 'Manicure', emoji: '💅',
    prompt: `You are a warm and friendly AI receptionist for a nail salon and beauty studio.

Your role:
- Help clients learn about available nail services and treatments
- Share pricing and estimated appointment durations
- Book, reschedule, or cancel appointments
- Answer questions about nail care, products used, and aftercare

Rules:
- Be warm, personal, and enthusiastic — clients love the experience
- Respond in the same language the client uses
- Keep replies short and conversational, like texting a friend
- Always end with one question to guide toward booking
- Mention promotions or special offers when relevant`,
  },
];

// ─── Types ────────────────────────────────────────────────────────

interface WidgetConfig {
  brandColor?:   string;
  greetingText?: string;
  avatarUrl?:    string;
  widgetTitle?:  string;
}

interface Agent {
  id: string;
  name: string;
  business_context: string | null;
  system_prompt: string | null;
  llm_model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  zapier_webhook_url: string | null;
  widget_config: WidgetConfig;
}

// ─── Widget Snippet Component ─────────────────────────────────────

function WidgetSnippet({ agentId }: { agentId: string }) {
  const [snippetCopied, setSnippetCopied] = useState(false);

  const base = typeof window !== 'undefined' ? window.location.origin : 'https://iupiter.vercel.app';
  const snippet = `<script>
  window.IupiterConfig = {
    agentId: '${agentId}',
    color: '#2563EB',
    position: 'right'
  };
</script>
<script src="${base}/widget.js" defer></script>`;

  const copy = () => {
    navigator.clipboard.writeText(snippet).then(() => {
      setSnippetCopied(true);
      setTimeout(() => setSnippetCopied(false), 2000);
    });
  };

  return (
    <div className="relative">
      <pre className="bg-slate-900 text-green-300 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap break-all">
        {snippet}
      </pre>
      <button
        onClick={copy}
        className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
      >
        {snippetCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        {snippetCopied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────

export default function AgentSettingsPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const router = useRouter();

  const [agent, setAgent]     = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    fetch(`/api/agents/${agentId}`)
      .then(r => r.json())
      .then(data => { setAgent(data); setLoading(false); });
  }, [agentId]);

  // When model changes → apply optimal temperature
  const handleModelChange = (value: string) => {
    const model = MODELS.find(m => m.value === value);
    setAgent(a => a ? { ...a, llm_model: value, temperature: model?.temp ?? a.temperature } : a);
  };

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

  const currentModel = MODELS.find(m => m.value === agent.llm_model);

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

      {/* Status toggle */}
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

      {/* ── Main form ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Agent Name</label>
          <input
            value={agent.name}
            onChange={e => setAgent({ ...agent, name: e.target.value })}
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
            onChange={e => setAgent({ ...agent, business_context: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* System Prompt with presets */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            System Prompt
            <span className="text-slate-400 font-normal ml-1">— defines how your agent thinks and responds</span>
          </label>
          <div className="mb-2.5">
            <p className="text-xs text-slate-500 mb-1.5">Quick presets:</p>
            <div className="flex flex-wrap gap-2">
              {PROMPT_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setAgent({ ...agent, system_prompt: preset.prompt })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-transparent hover:border-blue-200 transition-all"
                >
                  <span>{preset.emoji}</span>{preset.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            rows={8}
            placeholder="Leave empty to use the default prompt, or pick a preset above."
            value={agent.system_prompt ?? ''}
            onChange={e => setAgent({ ...agent, system_prompt: e.target.value || null })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono"
          />
        </div>

        <hr className="border-slate-100" />

        {/* AI Model Settings */}
        <div>
          <h3 className="text-sm font-semibold text-slate-900 mb-3">AI Model Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Model</label>
              <select
                value={agent.llm_model}
                onChange={e => handleModelChange(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MODELS.map(m => (
                  <option key={m.value} value={m.value}>
                    {m.label} — {m.badge} (optimal temp: {m.temp})
                  </option>
                ))}
              </select>
              {currentModel && (
                <p className="text-xs text-slate-400 mt-1">
                  Temperature auto-set to <span className="font-semibold text-slate-600">{currentModel.temp}</span> — optimal for this model
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Temperature</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range" min="0" max="1" step="0.1"
                    value={agent.temperature}
                    onChange={e => setAgent({ ...agent, temperature: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm font-mono text-slate-600 w-8">{agent.temperature}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Precise</span><span>Creative</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Tokens</label>
                <input
                  type="number" min="50" max="1000" step="50"
                  value={agent.max_tokens}
                  onChange={e => setAgent({ ...agent, max_tokens: parseInt(e.target.value) })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Channels — Coming Soon ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">More Channels</p>
          <p className="text-xs text-slate-500 mt-0.5">Connect your agent to additional platforms</p>
        </div>
        <div className="p-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { icon: '💬', name: 'WhatsApp Business', desc: 'Auto-reply to WhatsApp messages' },
            { icon: '📸', name: 'Instagram DMs', desc: 'Respond to Instagram direct messages' },
            { icon: '📘', name: 'Facebook Messenger', desc: 'Handle Messenger conversations' },
          ].map(ch => (
            <div key={ch.name} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 opacity-60">
              <span className="text-xl mt-0.5">{ch.icon}</span>
              <div>
                <p className="text-sm font-medium text-slate-700">{ch.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">{ch.desc}</p>
                <span className="inline-block mt-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Zapier / CRM Webhook ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center text-lg">⚡</div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Zapier / CRM Webhook</p>
            <p className="text-xs text-slate-500">Send new leads to HubSpot, Salesforce, Google Sheets, Slack — anything</p>
          </div>
          {agent.zapier_webhook_url && (
            <span className="ml-auto text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">● Active</span>
          )}
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Webhook URL</label>
            <input
              value={agent.zapier_webhook_url ?? ''}
              onChange={e => setAgent({ ...agent, zapier_webhook_url: e.target.value || null })}
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 font-mono"
            />
          </div>
          <div className="rounded-lg bg-orange-50 border border-orange-100 px-4 py-3 text-xs text-orange-800 space-y-1">
            <p className="font-semibold">How to connect Zapier:</p>
            <p>1. Go to zapier.com → Create Zap → Trigger: <strong>Webhooks by Zapier → Catch Hook</strong></p>
            <p>2. Copy the webhook URL and paste it above</p>
            <p>3. Save — every new lead will be sent to Zapier automatically</p>
            <p>4. In Zapier, add an Action: create contact in HubSpot, add row to Google Sheets, send Slack message, etc.</p>
          </div>
        </div>
      </div>

      {/* ── Widget Customization ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-lg">🎨</div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Widget Appearance</p>
            <p className="text-xs text-slate-500">Match your brand — color, title, greeting, and avatar</p>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={agent.widget_config?.brandColor ?? '#2563EB'}
                  onChange={e => setAgent({ ...agent, widget_config: { ...agent.widget_config, brandColor: e.target.value } })}
                  className="h-9 w-14 cursor-pointer rounded border border-slate-200 p-0.5"
                />
                <input
                  type="text"
                  value={agent.widget_config?.brandColor ?? '#2563EB'}
                  onChange={e => setAgent({ ...agent, widget_config: { ...agent.widget_config, brandColor: e.target.value } })}
                  placeholder="#2563EB"
                  className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Widget Title</label>
              <input
                value={agent.widget_config?.widgetTitle ?? ''}
                onChange={e => setAgent({ ...agent, widget_config: { ...agent.widget_config, widgetTitle: e.target.value } })}
                placeholder={agent.name}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Greeting Message</label>
            <input
              value={agent.widget_config?.greetingText ?? ''}
              onChange={e => setAgent({ ...agent, widget_config: { ...agent.widget_config, greetingText: e.target.value } })}
              placeholder={`Hi! I'm ${agent.name}. How can I help you today?`}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Avatar URL <span className="text-slate-400 font-normal">(optional — PNG/JPG, square)</span></label>
            <input
              value={agent.widget_config?.avatarUrl ?? ''}
              onChange={e => setAgent({ ...agent, widget_config: { ...agent.widget_config, avatarUrl: e.target.value || undefined } })}
              placeholder="https://example.com/avatar.png"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <a
            href={`/widget/${agent.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Preview with current settings (save first)
          </a>
        </div>
      </div>

      {/* ── Website Widget ── */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Website Chat Widget</p>
            <p className="text-xs text-slate-500">Add a floating chat bubble to any website — no coding skills needed</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Snippet */}
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5 uppercase tracking-wide">
              Paste this code before &lt;/body&gt; on your website
            </label>
            <WidgetSnippet agentId={agentId} />
          </div>

          {/* Platform guides */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { name: 'WordPress', icon: '🟦', hint: 'Appearance → Theme File Editor → footer.php — paste before </body>' },
              { name: 'Tilda',     icon: '⬜', hint: 'Site Settings → More → HTML code in <head> — paste there' },
              { name: 'Wix',      icon: '🟪', hint: 'Settings → Custom Code → Add Code → Body — End' },
              { name: 'Shopify',  icon: '🟩', hint: 'Online Store → Themes → Edit Code → theme.liquid before </body>' },
            ].map(p => (
              <div key={p.name} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800 mb-1">{p.icon} {p.name}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{p.hint}</p>
              </div>
            ))}
          </div>

          {/* Preview link */}
          <a
            href={`/widget/${agentId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Preview widget in new tab
          </a>
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
