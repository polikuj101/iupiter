"use client";

import type { AgentConfig } from "@/lib/types";
import { FileUploadZone } from "./FileUploadZone";

export function StepKnowledge({
  config,
  onAddKnowledge,
  onRemoveKnowledge,
  onNext,
  onPrev,
}: {
  config: AgentConfig;
  onAddKnowledge: (filename: string, content: string) => void;
  onRemoveKnowledge: (filename: string) => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          Upload your knowledge base
        </h2>
        <p className="text-sm text-gray-500">
          Add your price list, FAQ, or service descriptions. The AI will use
          this to answer accurately.
        </p>
      </div>

      <FileUploadZone onFileUploaded={onAddKnowledge} />

      {/* Uploaded files list */}
      {config.knowledgeTexts.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">
            Uploaded documents:
          </p>
          {config.knowledgeTexts.map((k) => (
            <div
              key={k.filename}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {k.filename}
                  </p>
                  <p className="text-xs text-gray-400">
                    {k.content.length.toLocaleString()} characters
                  </p>
                </div>
              </div>
              <button
                onClick={() => onRemoveKnowledge(k.filename)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onPrev}
          className="flex-1 py-3 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors"
        >
          Next: Set Persona →
        </button>
      </div>

      <p className="text-xs text-gray-400 text-center">
        You can skip this step — the AI will use your business description to
        answer.
      </p>
    </div>
  );
}
