import React from "react";
import { Top } from "@/components/features/Top/Top";
import { getAIServicesSummary } from "@/lib/api/aiServices";
import { AIServiceSummary } from "@/types";
import { REVALIDATE } from "@/lib/constants";

export const revalidate = REVALIDATE;

export default async function Home() {
  const aiServices: AIServiceSummary[] = await getAIServicesSummary();

  return <Top aiServices={aiServices} />;
}
