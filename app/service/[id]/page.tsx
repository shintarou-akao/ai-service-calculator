import { ServiceDetail } from "@/components/ServiceDetail/ServiceDetail";
import { getAIServiceDetails } from "@/lib/api";
import { notFound } from "next/navigation";

export default async function ServiceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const serviceDetails = await getAIServiceDetails(params.id);

  if (!serviceDetails) {
    notFound();
  }

  return <ServiceDetail serviceId={params.id} />;
}
