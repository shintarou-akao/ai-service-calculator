import { cache } from "react";
import { AIService } from "@/types";
import { createClient } from "@/utils/supabase/server";

interface ServiceQueryResult {
  id: string;
  name: string;
  description: string;
  logo_path: string;
  plan_pricing_url: string;
  model_pricing_url: string;
  providers: {
    name: string;
  };
  ai_models: {
    id: string;
    name: string;
    input_price: number;
    output_price: number;
    context_window: number;
  }[];
  ai_plans: {
    id: string;
    name: string;
    monthly_price: number;
    yearly_price: number;
  }[];
}

export const getAIServiceDetails = cache(async function (
  serviceId: string
): Promise<AIService | null> {
  if (isNaN(Number(serviceId))) {
    return null;
  }

  const supabase = createClient();
  const { data: service, error: serviceError } = await supabase
    .from("ai_services")
    .select(
      `
      id,
      name,
      description,
      logo_path,
      plan_pricing_url,
      model_pricing_url,
      providers (name),
      ai_models (
        id,
        name,
        input_price,
        output_price,
        context_window
      ),
      ai_plans (
        id,
        name,
        monthly_price,
        yearly_price
      )
    `
    )
    .eq("id", serviceId)
    .single<ServiceQueryResult>();

  if (serviceError) {
    if (serviceError.code === "PGRST116") {
      return null;
    }
    throw new Error(`AIサービスの取得中にエラーが発生しました`);
  }

  return {
    id: service.id,
    name: service.name,
    provider: service.providers.name,
    description: service.description,
    logoPath: service.logo_path,
    planPricingUrl: service.plan_pricing_url,
    modelPricingUrl: service.model_pricing_url,
    models: service.ai_models.map((model) => ({
      id: model.id,
      name: model.name,
      inputPrice: model.input_price,
      outputPrice: model.output_price,
      contextWindow: model.context_window,
    })),
    plans: service.ai_plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      monthlyPrice: plan.monthly_price,
      yearlyPrice: plan.yearly_price,
    })),
  };
});
