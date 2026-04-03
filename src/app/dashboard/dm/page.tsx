"use client";

import { useState, useEffect } from "react";

interface Conversation {
  id: string;
  dm_text: string;
  ai_response: string;
  created_at: string;
}

export default function DMHandlerPage() {
  const [dmText, setDmText] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<Conversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    setHistoryLoading(true);
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleGenerate() {
    if (!dmText.trim()) return;
    setError("");
    setResponse("");
    setLoading(true);

    try {
      const res = await fetch("/api/dm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dmText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setResponse(data.response);
      fetchHistory();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-gray-900">DM Handler</h1>
        <p className="text-sm text-gray-500 mt-1">
          Paste an Instagram DM and get an AI-generated reply using your listings
          and tone.
        </p>
      </div>

      {/* Input + Response */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Input */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">
            Incoming DM
          </h2>
          <textarea
            value={dmText}
            onChange={(e) => setDmText(e.target.value)}
            placeholder="Paste the Instagram DM here…"
            rows={8}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !dmText.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating…
              </span>
            ) : (
              "Generate Response"
            )}
          </button>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
        </div>

        {/* Response */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">AI Response</h2>
            {response && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition"
              >
                {copied ? (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            )}
          </div>

          <div className="min-h-[176px] text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2.5 whitespace-pre-wrap">
            {response || (
              <span className="text-gray-400">
                {loading ? "Thinking…" : "Response will appear here"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Recent DMs
        </h2>

        {historyLoading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400">No DMs yet. Generate your first response above.</p>
        ) : (
          <div className="space-y-3">
            {history.map((conv) => (
              <div
                key={conv.id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2 flex-1">
                    <div>
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                        DM
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {conv.dm_text}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-indigo-400 uppercase tracking-wide mb-1">
                        Response
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {conv.ai_response}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">
                    {formatDate(conv.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
