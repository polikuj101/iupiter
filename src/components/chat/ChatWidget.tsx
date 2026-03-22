"use client";

import { useEffect, useRef } from "react";
import type { AgentConfig } from "@/lib/types";
import { useChat } from "@/hooks/useChat";
import { ChatBubble } from "./ChatBubble";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";

export function ChatWidget({
  agentConfig,
  className = "",
}: {
  agentConfig: AgentConfig;
  className?: string;
}) {
  const { messages, isLoading, sendMessage } = useChat(agentConfig);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const showGreeting = messages.length === 0 && agentConfig.greeting;

  return (
    <div
      className={`flex flex-col bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-xs font-bold">
          {agentConfig.agentName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {agentConfig.agentName}
          </p>
          <p className="text-xs text-gray-500">{agentConfig.businessName}</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full" />
          <span className="text-xs text-gray-500">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 min-h-[300px] max-h-[500px]"
      >
        {showGreeting && (
          <div className="flex justify-start mb-3">
            <div className="max-w-[80%] px-4 py-3 bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md text-sm leading-relaxed">
              <p className="text-xs font-semibold text-gray-500 mb-1">
                {agentConfig.agentName}
              </p>
              <p className="whitespace-pre-wrap">{agentConfig.greeting}</p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <ChatBubble
            key={i}
            message={msg}
            agentName={agentConfig.agentName}
          />
        ))}

        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <TypingIndicator />
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
