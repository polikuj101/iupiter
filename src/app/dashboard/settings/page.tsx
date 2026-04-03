"use client";

import { useState, useEffect } from "react";

interface Settings {
  agent_name: string;
  tone: "formal" | "friendly" | "adaptive";
  business_description: string;
}

const TONE_OPTIONS: { value: Settings["tone"]; label: string; description: string }[] = [
  {
    value: "formal",
    label: "Formal",
    description: "Professional and polished",
  },
  {
    value: "friendly",
    label: "Friendly",
    description: "Warm and approachable",
  },
  {
    value: "adaptive",
    label: "Adaptive",
    description: "Matches the client's tone",
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    agent_name: "",
    tone: "friendly",
    business_description: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.agent_name !== undefined) {
          setSettings({
            agent_name: data.agent_name ?? "",
            tone: data.tone ?? "friendly",
            business_description: data.business_description ?? "",
          });
        }
      })
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    const data = await res.json();
    setSaving(false);

    if (!res.ok) {
      setError(data.error ?? "Failed to save settings");
      return;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Agent Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Customize how your AI agent presents itself and responds to clients.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {/* Agent Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Agent Name
          </label>
          <input
            type="text"
            required
            value={settings.agent_name}
            onChange={(e) =>
              setSettings((s) => ({ ...s, agent_name: e.target.value }))
            }
            placeholder="e.g. Sarah's AI Assistant"
            className="w-full max-w-sm px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            This is how the assistant introduces itself in responses.
          </p>
        </div>

        {/* Tone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tone of Voice
          </label>
          <div className="grid grid-cols-3 gap-3 max-w-lg">
            {TONE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`relative flex flex-col p-3.5 rounded-xl border-2 cursor-pointer transition ${
                  settings.tone === option.value
                    ? "border-indigo-500 bg-indigo-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="tone"
                  value={option.value}
                  checked={settings.tone === option.value}
                  onChange={() =>
                    setSettings((s) => ({ ...s, tone: option.value }))
                  }
                  className="sr-only"
                />
                <span
                  className={`text-sm font-semibold ${
                    settings.tone === option.value
                      ? "text-indigo-700"
                      : "text-gray-700"
                  }`}
                >
                  {option.label}
                </span>
                <span className="text-xs text-gray-400 mt-0.5">
                  {option.description}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Business Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Business Description
          </label>
          <textarea
            value={settings.business_description}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                business_description: e.target.value,
              }))
            }
            placeholder="e.g. Independent real estate agent specializing in residential properties in Oslo. Focus on first-time buyers and relocating families."
            rows={4}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Used to give context to the AI when generating responses.
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
          {saved && (
            <span className="text-sm text-green-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
