"use client";

import { useState } from "react";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { PRESET_DEMOS } from "@/lib/types";

const DEMO_OPTIONS = [
  { id: "nail-salon", label: "Nail Salon", icon: "💅" },
  { id: "clinic", label: "Dental Clinic", icon: "🦷" },
  { id: "realty", label: "Real Estate", icon: "🏠" },
  { id: "school", label: "Language School", icon: "📚" },
  { id: "catering", label: "Catering", icon: "🍽️" },
] as const;

export function LiveDemo() {
  const [activeDemo, setActiveDemo] = useState("nail-salon");

  return (
    <section id="demos" className="py-28 px-6 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
          Try it yourself
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Chat with a live AI agent. Pick an industry below.
        </p>

        {/* Demo selector */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {DEMO_OPTIONS.map((d) => (
            <button
              key={d.id}
              onClick={() => setActiveDemo(d.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeDemo === d.id
                  ? "bg-black text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
              }`}
            >
              {d.icon} {d.label}
            </button>
          ))}
        </div>

        {/* Chat widget */}
        <div className="max-w-lg mx-auto">
          <ChatWidget
            key={activeDemo}
            agentConfig={PRESET_DEMOS[activeDemo]}
            className="h-[500px]"
          />
        </div>
      </div>
    </section>
  );
}
