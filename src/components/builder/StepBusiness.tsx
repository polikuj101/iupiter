"use client";

import type { AgentConfig } from "@/lib/types";

export function StepBusiness({
  config,
  onUpdate,
  onNext,
}: {
  config: AgentConfig;
  onUpdate: (partial: Partial<AgentConfig>) => void;
  onNext: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Tell us about your business
        </h2>
        <p className="text-sm text-gray-500">
          This helps the AI understand your services.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name
          </label>
          <input
            type="text"
            value={config.businessName}
            onChange={(e) => onUpdate({ businessName: e.target.value })}
            placeholder="e.g. Glamour Nails Studio"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What does your business do?
          </label>
          <textarea
            value={config.businessDescription}
            onChange={(e) =>
              onUpdate({ businessDescription: e.target.value })
            }
            placeholder="e.g. We are a premium nail salon offering manicure, pedicure, and nail art services in downtown LA."
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact info (for escalation)
          </label>
          <input
            type="text"
            value={config.contactInfo}
            onChange={(e) => onUpdate({ contactInfo: e.target.value })}
            placeholder="e.g. @your_telegram or phone number"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!config.businessName.trim()}
        className="w-full py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next: Upload Knowledge →
      </button>
    </div>
  );
}
