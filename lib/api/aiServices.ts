import { AIServiceSummary } from "@/types/types";
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
    throw new Error("AIサービスの取得中にエラーが発生しました");
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
