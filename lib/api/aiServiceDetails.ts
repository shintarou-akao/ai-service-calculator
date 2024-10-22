import { AIService } from "@/types/types";
import { supabase } from "@/lib/db/supabase";

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
}

export async function getAIServiceDetails(
  serviceId: string
): Promise<AIService | null> {
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
      providers (name)
    `
    )
    .eq("id", serviceId)
    .single<ServiceQueryResult>();

  if (serviceError) {
    throw new Error("AIサービスの取得中にエラーが発生しました");
  }

  const { data: models, error: modelsError } = await supabase
    .from("ai_models")
    .select("*")
    .eq("service_id", serviceId);

  const { data: plans, error: plansError } = await supabase
    .from("ai_plans")
    .select("*")
    .eq("service_id", serviceId);

  if (modelsError) {
    throw new Error("モデルの取得中にエラーが発生しました");
  }
  if (plansError) {
    throw new Error("プランの取得中にエラーが発生しました");
  }

  return {
    id: service.id,
    name: service.name,
    provider: service.providers.name,
    description: service.description,
    logoPath: service.logo_path,
    planPricingUrl: service.plan_pricing_url,
    modelPricingUrl: service.model_pricing_url,
    models:
      models?.map((model) => ({
        id: model.id,
        name: model.name,
        inputPrice: model.input_price,
        outputPrice: model.output_price,
        contextWindow: model.context_window,
      })) || [],
    plans:
      plans?.map((plan) => ({
        id: plan.id,
        name: plan.name,
        monthlyPrice: plan.monthly_price,
        yearlyPrice: plan.yearly_price,
      })) || [],
  };
}
