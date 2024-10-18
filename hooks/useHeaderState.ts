"use client";

import { ServiceSelection } from "@/types/types";
import { useState, useEffect, useMemo } from "react";

export function useHeaderState(
  selectedServices: ServiceSelection[],
  activeServiceSelections: ServiceSelection[]
) {
  const [totalApiCost, setTotalApiCost] = useState(0);
  const [totalPlanCost, setTotalPlanCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    let apiCostSum = 0;
    let planCostSum = 0;

    activeServiceSelections.forEach(
      ({ service, selectedModels, selectedPlans }) => {
        selectedModels.forEach((model) => {
          const modelInfo = service.models.find((m) => m.id === model.id);
          if (modelInfo) {
            const inputCost = (model.inputTokens * modelInfo.inputPrice) / 1000;
            const outputCost =
              (model.outputTokens * modelInfo.outputPrice) / 1000;
            apiCostSum += inputCost + outputCost;
          }
        });

        selectedPlans.forEach(({ id, quantity, billingCycle }) => {
          const plan = service.plans.find((p) => p.id === id);
          if (plan) {
            const price =
              billingCycle === "monthly"
                ? plan.monthlyPrice
                : plan.yearlyPrice / 12;
            planCostSum += price * quantity;
          }
        });
      }
    );

    setTotalApiCost(apiCostSum);
    setTotalPlanCost(planCostSum);
    setTotalCost(apiCostSum + planCostSum);
  }, [activeServiceSelections]);

  const hasSelectedServices = useMemo(() => {
    return activeServiceSelections.length > 0;
  }, [activeServiceSelections]);

  const handleShareClick = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedState = encodeState(selectedServices);
    const url = `${baseUrl}?state=${encodedState}`;
    setShareUrl(url);
  };

  return {
    totalApiCost,
    totalPlanCost,
    totalCost,
    hasSelectedServices,
    handleShareClick,
    isBreakdownOpen,
    setIsBreakdownOpen,
    shareUrl,
    setShareUrl,
    activeServiceSelections,
  };
}

function encodeState(selectedServices: ServiceSelection[]): string {
  const state = selectedServices.map((s) => ({
    id: s.service.id,
    models: s.selectedModels.map((m) => ({
      id: m.id,
      input: m.inputTokens,
      output: m.outputTokens,
    })),
    plans: s.selectedPlans.map((p) => ({
      id: p.id,
      quantity: p.quantity,
      cycle: p.billingCycle,
    })),
  }));
  return encodeURIComponent(JSON.stringify(state));
}
