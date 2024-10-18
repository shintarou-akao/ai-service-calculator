export type AIModel = {
  id: string;
  name: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
};

export type AIPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
};

export type AIService = {
  id: string;
  name: string;
  provider: string;
  description: string;
  logoPath: string;
  planPricingUrl: string;
  modelPricingUrl: string;
  models: AIModel[];
  plans: AIPlan[];
};

export type AIServiceSummary = {
  id: string;
  name: string;
  provider: string;
  description: string;
  logoPath: string;
  planPricingUrl: string;
  modelPricingUrl: string;
};

export type PlanSelection = {
  id: string;
  quantity: number;
  billingCycle: "monthly" | "yearly";
};

export type ModelSelection = {
  id: string;
  inputTokens: number;
  outputTokens: number;
};

export type ServiceSelection = {
  service: AIService;
  selectedModels: ModelSelection[];
  selectedPlans: PlanSelection[];
};

export type EncodedState = {
  id: string;
  models: {
    id: string;
    input: number;
    output: number;
  }[];
  plans: {
    id: string;
    quantity: number;
    cycle: "monthly" | "yearly";
  }[];
}[];
