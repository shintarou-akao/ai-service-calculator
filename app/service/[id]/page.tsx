import { Metadata } from "next";
import { ServiceDetail } from "@/components/features/ServiceDetail/ServiceDetail";
import { getAIServiceDetails } from "@/lib/api/aiServiceDetails";
import { notFound } from "next/navigation";
import { REVALIDATE } from "@/lib/constants";

export const revalidate = REVALIDATE;

type Props = {
  params: { id: string };
};

const getServiceDetails = async (id: string) => {
  const serviceDetails = await getAIServiceDetails(id);
  if (!serviceDetails) {
    notFound();
  }
  return serviceDetails;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const serviceDetails = await getServiceDetails(params.id);

  return {
    title: `「${serviceDetails.name}」の料金プラン・APIモデルの料金を計算`,
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const serviceDetails = await getServiceDetails(params.id);

  return <ServiceDetail serviceDetails={serviceDetails} />;
}
