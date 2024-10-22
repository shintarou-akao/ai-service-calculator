import React from "react";
import { Top } from "@/components/features/Top/Top";
import { getAIServicesSummary } from "@/lib/api/aiServices";
import { AIServiceSummary } from "@/types/types";

export default async function Home() {
  const aiServices: AIServiceSummary[] = await getAIServicesSummary();

  return <Top aiServices={aiServices} />;
}
