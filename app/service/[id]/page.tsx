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
  return (
    <Suspense fallback={<ServiceDetailSkeleton />}>
      <ServiceDetailContent id={params.id} />
    </Suspense>
  );
}

async function ServiceDetailContent({ id }: { id: string }) {
  const serviceDetails = await getAIServiceDetails(id);

  if (!serviceDetails) {
    notFound();
  }

  return <ServiceDetail serviceDetails={serviceDetails} />;
}
