"use client";

import type { BuilderStep } from "@/hooks/useAgentBuilder";

const STEPS = [
  { step: 1 as BuilderStep, label: "Business" },
  { step: 2 as BuilderStep, label: "Knowledge" },
  { step: 3 as BuilderStep, label: "Persona" },
  { step: 4 as BuilderStep, label: "Preview" },
];

export function ProgressBar({
  currentStep,
  onStepClick,
}: {
  currentStep: BuilderStep;
  onStepClick: (step: BuilderStep) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.step} className="flex items-center gap-2">
          <button
            onClick={() => onStepClick(s.step)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              currentStep === s.step
                ? "bg-black text-white"
                : currentStep > s.step
                ? "bg-gray-200 text-gray-700"
                : "bg-gray-100 text-gray-400"
            }`}
          >
            <span className="w-5 h-5 flex items-center justify-center text-xs rounded-full border border-current">
              {s.step}
            </span>
            {s.label}
          </button>
          {i < STEPS.length - 1 && (
            <div className="w-6 h-px bg-gray-300" />
          )}
        </div>
      ))}
    </div>
  );
}
