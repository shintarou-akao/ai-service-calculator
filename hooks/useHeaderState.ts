"use client";

import { ServiceSelection } from "@/types";
import { useState, useEffect, useMemo } from "react";
import LZString from "lz-string";
import { TOKEN_DIVISOR } from "@/lib/constants";

export function useHeaderState(
  selectedServices: ServiceSelection[],
  activeServiceSelections: ServiceSelection[]
) {
  const [totalApiCost, setTotalApiCost] = useState(0);
  const [totalPlanCost, setTotalPlanCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  const isServiceSelected = useMemo(() => {
    return activeServiceSelections.some(
      (serviceSelection) =>
        serviceSelection.selectedModels.some(
          (model) => model.inputTokens > 0 || model.outputTokens > 0
        ) || serviceSelection.selectedPlans.length > 0
    );
  }, [activeServiceSelections]);

  useEffect(() => {
    let apiCostSum = 0;
    let planCostSum = 0;

    activeServiceSelections.forEach(
      ({ service, selectedModels, selectedPlans }) => {
        selectedModels.forEach((model) => {
          const modelInfo = service.models.find((m) => m.id === model.id);
          if (modelInfo) {
            const inputCost =
              (model.inputTokens * modelInfo.inputPrice) / TOKEN_DIVISOR;
            const outputCost =
              (model.outputTokens * modelInfo.outputPrice) / TOKEN_DIVISOR;
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

  const handleShareClick = () => {
    if (!isServiceSelected) return;

    const baseUrl = window.location.origin;
    const encodedState = LZString.compressToEncodedURIComponent(
      JSON.stringify(selectedServices)
    );
    const url = `${baseUrl}?state=${encodedState}`;
    setShareUrl(url);
  };

  return {
    totalApiCost,
    totalPlanCost,
    totalCost,
    hasSelectedServices: isServiceSelected,
    handleShareClick,
    isBreakdownOpen,
    setIsBreakdownOpen,
    shareUrl,
    setShareUrl,
    activeServiceSelections,
  };
}
