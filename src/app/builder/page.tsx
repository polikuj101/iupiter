"use client";

import Link from "next/link";
import { useAgentBuilder } from "@/hooks/useAgentBuilder";
import { ProgressBar } from "@/components/builder/ProgressBar";
import { StepBusiness } from "@/components/builder/StepBusiness";
import { StepKnowledge } from "@/components/builder/StepKnowledge";
import { StepPersona } from "@/components/builder/StepPersona";
import { StepPreview } from "@/components/builder/StepPreview";

export default function BuilderPage() {
  const {
    step,
    config,
    updateConfig,
    nextStep,
    prevStep,
    goToStep,
    addKnowledge,
    removeKnowledge,
  } = useAgentBuilder();

  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <Link href="/" className="text-sm font-bold text-gray-900">
          ← Back to Home
        </Link>
        <span className="text-lg font-black text-gray-900">Saleon</span>
        <span className="text-sm text-gray-500">Agent Builder</span>
      </nav>

      <div className="py-12 px-6">
        <ProgressBar currentStep={step} onStepClick={goToStep} />

        {step === 1 && (
          <StepBusiness
            config={config}
            onUpdate={updateConfig}
            onNext={nextStep}
          />
        )}

        {step === 2 && (
          <StepKnowledge
            config={config}
            onAddKnowledge={addKnowledge}
            onRemoveKnowledge={removeKnowledge}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {step === 3 && (
          <StepPersona
            config={config}
            onUpdate={updateConfig}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {step === 4 && <StepPreview config={config} onPrev={prevStep} />}
      </div>
    </main>
  );
}
