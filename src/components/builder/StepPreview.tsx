"use client";

import type { AgentConfig } from "@/lib/types";
import { ChatWidget } from "@/components/chat/ChatWidget";

export function StepPreview({
  config,
  onPrev,
}: {
  config: AgentConfig;
  onPrev: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Your agent is ready!
        </h2>
        <p className="text-sm text-gray-500">
          Chat with {config.agentName} below. This is exactly how your clients
          will experience it.
        </p>
      </div>

      <ChatWidget agentConfig={config} className="h-[500px]" />

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onPrev}
          className="flex-1 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          ← Edit Agent
        </button>
        <a
          href="https://t.me/bo_mirash"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors text-center"
        >
          Deploy for My Business →
        </a>
      </div>

      <p className="text-xs text-gray-400 text-center">
        Want this running 24/7 for your business? Contact us on Telegram and
        we&apos;ll set it up in 24 hours.
      </p>
    </div>
  );
}
