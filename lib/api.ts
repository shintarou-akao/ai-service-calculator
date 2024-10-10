import { supabase } from "./supabase";

export interface AIModel {
  id: string;
  name: string;
  inputPrice: number;
  outputPrice: number;
  contextWindow: number;
}

export interface AIPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
}

export interface AIService {
  id: string;
  name: string;
  provider: string;
  description: string;
  logoPath: string;
  planPricingUrl: string;
  modelPricingUrl: string;
  models: AIModel[];
  plans: AIPlan[];
}

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

// サービス一覧用の簡略化されたインターフェース
export interface AIServiceSummary {
  id: string;
  name: string;
  provider: string;
  description: string;
  logoPath: string;
  planPricingUrl: string;
  modelPricingUrl: string;
}

// サービス一覧を取得する関数
export async function getAIServicesSummary(): Promise<AIServiceSummary[]> {
  const { data: services, error: servicesError } = await supabase
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
    .returns<ServiceQueryResult[]>();

  if (servicesError) {
    console.error("AIサービスの取得中にエラーが発生しました:", servicesError);
    return [];
  }

  return services.map((service) => ({
    id: service.id,
    name: service.name,
    provider: service.providers.name,
    description: service.description,
    logoPath: service.logo_path,
    planPricingUrl: service.plan_pricing_url,
    modelPricingUrl: service.model_pricing_url,
  }));
}

// 特定のサービスの詳細を取得する関数
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
    console.error("AIサービスの取得中にエラーが発生しました:", serviceError);
    return null;
  }

  const { data: models, error: modelsError } = await supabase
    .from("ai_models")
    .select("*")
    .eq("service_id", serviceId);

  const { data: plans, error: plansError } = await supabase
    .from("ai_plans")
    .select("*")
    .eq("service_id", serviceId);

  if (modelsError)
    console.error("モデルの取得中にエラーが発生しました:", modelsError);
  if (plansError)
    console.error("プランの取得中にエラーが発生しました:", plansError);

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
