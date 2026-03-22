"use client";

import type { AgentConfig } from "@/lib/types";

const TONES = [
  { value: "formal" as const, label: "Formal", desc: "Professional and polite" },
  { value: "friendly" as const, label: "Friendly", desc: "Warm and approachable" },
  { value: "casual" as const, label: "Casual", desc: "Relaxed and fun" },
];

export function StepPersona({
  config,
  onUpdate,
  onNext,
  onPrev,
}: {
  config: AgentConfig;
  onUpdate: (partial: Partial<AgentConfig>) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Set your agent&apos;s personality
        </h2>
        <p className="text-sm text-gray-500">
          Give your AI a name and choose how it talks to clients.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Agent Name
          </label>
          <input
            type="text"
            value={config.agentName}
            onChange={(e) => onUpdate({ agentName: e.target.value })}
            placeholder="e.g. Sophie, Alex, Max"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Communication Style
          </label>
          <div className="grid grid-cols-3 gap-3">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => onUpdate({ tone: t.value })}
                className={`p-4 rounded-xl border text-center transition-colors ${
                  config.tone === t.value
                    ? "border-black bg-gray-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {t.label}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Greeting Message
          </label>
          <textarea
            value={config.greeting}
            onChange={(e) => onUpdate({ greeting: e.target.value })}
            placeholder={`e.g. Hi there! I'm ${config.agentName || "your assistant"}. How can I help you today?`}
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onPrev}
          className="flex-1 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!config.agentName.trim()}
          className="flex-1 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Next: Preview →
        </button>
      </div>
    </div>
  );
}
