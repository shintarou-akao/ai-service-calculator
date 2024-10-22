import { Suspense } from "react";
import { ServiceDetail } from "@/components/ServiceDetail/ServiceDetail";
import { ServiceDetailSkeleton } from "@/components/ServiceDetail/ServiceDetailSkeleton";
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

  return (
    <Suspense fallback={<ServiceDetailSkeleton />}>
      <ServiceDetail serviceDetails={serviceDetails} />
    </Suspense>
  );
}
