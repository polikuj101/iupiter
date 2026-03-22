"use client";

import type { Message } from "@/lib/types";

export function ChatBubble({
  message,
  agentName,
}: {
  message: Message;
  agentName: string;
}) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? "bg-black text-white rounded-br-md"
            : "bg-gray-100 text-gray-900 rounded-bl-md"
        }`}
      >
        {!isUser && (
          <p className="text-xs font-semibold text-gray-500 mb-1">
            {agentName}
          </p>
        )}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
