"use client";

import { use } from "react";
import Link from "next/link";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { PRESET_DEMOS } from "@/lib/types";

export default function DemoPage({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = use(params);
  const config = PRESET_DEMOS[agentId];

  if (!config) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Demo not found
          </h1>
          <p className="text-gray-500 mb-4">
            Available demos: {Object.keys(PRESET_DEMOS).join(", ")}
          </p>
          <Link
            href="/"
            className="text-sm font-medium text-black underline"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <Link href="/" className="text-sm font-bold text-gray-900">
          ← Back
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-lg font-black text-gray-900">Saleon</span>
          <span className="text-sm text-gray-400">|</span>
          <span className="text-sm text-gray-500">{config.businessName}</span>
        </div>
        <a
          href="https://t.me/bo_mirash"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors"
        >
          Get Your Own →
        </a>
      </nav>

      {/* Chat */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">
          <ChatWidget agentConfig={config} className="h-[600px]" />
        </div>
      </div>
    </main>
  );
}
