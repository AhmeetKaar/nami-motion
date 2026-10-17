export type ReasoningEffort = "low" | "medium" | "high";

export type ReasoningLevel = {
  label: string;
  value: ReasoningEffort;
  budget: number;
  description: string;
};

export const REASONING_EFFORTS: ReasoningLevel[] = [
  { label: "Low", value: "low", budget: 0.2, description: "About 20% of max tokens go to reasoning. Fastest replies." },
  { label: "Medium", value: "medium", budget: 0.5, description: "About half of max tokens go to reasoning. The default." },
  { label: "High", value: "high", budget: 0.8, description: "About 80% of max tokens go to reasoning. Slowest, most thorough." },
];

export const DEFAULT_REASONING_EFFORT: ReasoningEffort = "medium";

export function reasoningRequest(effort: ReasoningEffort, options?: { exclude?: boolean }) {
  return { reasoning: { effort, ...(options?.exclude ? { exclude: true } : {}) } };
}

export function reasoningBudget(effort: ReasoningEffort, maxTokens: number) {
  const level = REASONING_EFFORTS.find((item) => item.value === effort) ?? REASONING_EFFORTS[1];
  return Math.max(Math.min(Math.floor(maxTokens * level.budget), 128000), 1024);
}

export function reasoningIndex(effort: ReasoningEffort) {
  const index = REASONING_EFFORTS.findIndex((item) => item.value === effort);
  return index < 0 ? 1 : index;
}
