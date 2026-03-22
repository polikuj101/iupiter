"use client";

import { useState, useCallback } from "react";
import type { AgentConfig } from "@/lib/types";

export type BuilderStep = 1 | 2 | 3 | 4;

const INITIAL_CONFIG: AgentConfig = {
  businessName: "",
  businessDescription: "",
  agentName: "",
  tone: "friendly",
  greeting: "",
  knowledgeTexts: [],
  contactInfo: "",
};

export function useAgentBuilder() {
  const [step, setStep] = useState<BuilderStep>(1);
  const [config, setConfig] = useState<AgentConfig>(INITIAL_CONFIG);

  const updateConfig = useCallback(
    (partial: Partial<AgentConfig>) => {
      setConfig((prev) => ({ ...prev, ...partial }));
    },
    []
  );

  const nextStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, 4) as BuilderStep);
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1) as BuilderStep);
  }, []);

  const goToStep = useCallback((s: BuilderStep) => {
    setStep(s);
  }, []);

  const addKnowledge = useCallback(
    (filename: string, content: string) => {
      setConfig((prev) => ({
        ...prev,
        knowledgeTexts: [
          ...prev.knowledgeTexts.filter((k) => k.filename !== filename),
          { filename, content },
        ],
      }));
    },
    []
  );

  const removeKnowledge = useCallback((filename: string) => {
    setConfig((prev) => ({
      ...prev,
      knowledgeTexts: prev.knowledgeTexts.filter(
        (k) => k.filename !== filename
      ),
    }));
  }, []);

  return {
    step,
    config,
    updateConfig,
    nextStep,
    prevStep,
    goToStep,
    addKnowledge,
    removeKnowledge,
  };
}
