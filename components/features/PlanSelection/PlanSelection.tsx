import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Minus, Plus } from "lucide-react";
import { AIService, ServiceSelection } from "@/types";

interface PlanSelectionProps {
  currentService: AIService;
  selectedServices: ServiceSelection[];
  handlePlanChange: (
    planId: string,
    change: number,
    billingCycle: "monthly" | "yearly"
  ) => void;
}

export function PlanSelection({
  currentService,
  selectedServices,
  handlePlanChange,
}: PlanSelectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-800">月額プラン</h3>
        {currentService.plans.map((plan) => {
          const serviceSelection = selectedServices.find(
            (s) => s.service.id === currentService.id
          );
          const selectedPlan = serviceSelection?.selectedPlans.find(
            (p) => p.id === plan.id && p.billingCycle === "monthly"
          );
          return (
            <div
              key={`${plan.id}-monthly`}
              className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 p-4 bg-gray-50 rounded-lg"
            >
              <div className="grid gap-1.5 leading-none flex-grow w-full sm:w-auto">
                <Label
                  htmlFor={`plan-${plan.id}-monthly`}
                  className="text-lg font-medium"
                >
                  {plan.name}
                </Label>
                <p className="text-sm text-gray-600">
                  月額: ${plan.monthlyPrice}/月
                </p>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handlePlanChange(plan.id, -1, "monthly")}
                  disabled={!selectedPlan}
                  className="bg-white"
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">
                    {plan.name}月額プランを1つ減らす
                  </span>
                </Button>
                <span className="w-8 text-center text-lg font-semibold">
                  {selectedPlan?.quantity || 0}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => handlePlanChange(plan.id, 1, "monthly")}
                  className="bg-white"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">
                    {plan.name}月額プランを1つ増やす
                  </span>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
      {currentService.plans.some((plan) => plan.yearlyPrice > 0) && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            年額プラン
          </h3>
          {currentService.plans
            .filter((plan) => plan.yearlyPrice > 0)
            .map((plan) => {
              const serviceSelection = selectedServices.find(
                (s) => s.service.id === currentService.id
              );
              const selectedPlan = serviceSelection?.selectedPlans.find(
                (p) => p.id === plan.id && p.billingCycle === "yearly"
              );
              return (
                <div
                  key={`${plan.id}-yearly`}
                  className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 mb-6 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="grid gap-1.5 leading-none flex-grow w-full sm:w-auto">
                    <Label
                      htmlFor={`plan-${plan.id}-yearly`}
                      className="text-lg font-medium"
                    >
                      {plan.name}
                    </Label>
                    <p className="text-sm text-gray-600">
                      年額: ${plan.yearlyPrice}/年 (月額換算: $
                      {(plan.yearlyPrice / 12).toFixed(2)}/月)
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handlePlanChange(plan.id, -1, "yearly")}
                      disabled={!selectedPlan}
                      className="bg-white"
                    >
                      <Minus className="h-4 w-4" />
                      <span className="sr-only">
                        {plan.name}年額プランを1つ減らす
                      </span>
                    </Button>
                    <span className="w-8 text-center text-lg font-semibold">
                      {selectedPlan?.quantity || 0}
                    </span>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => handlePlanChange(plan.id, 1, "yearly")}
                      className="bg-white"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">
                        {plan.name}年額プラン1つ増やす
                      </span>
                    </Button>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
