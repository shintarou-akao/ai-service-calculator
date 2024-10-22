import { ServiceDetail } from "@/components/ServiceDetail/ServiceDetail";
import { getAIServiceDetails } from "@/lib/api/aiServiceDetails";
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

  return <ServiceDetail serviceDetails={serviceDetails} />;
}
