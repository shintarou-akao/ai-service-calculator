"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelSelection } from "@/components/features/ModelSelection/ModelSelection";
import { PlanSelection } from "@/components/features/PlanSelection/PlanSelection";
import { AIService, PlanSelection as PlanSelectionType } from "@/types/types";
import { useRouter } from "next/navigation";
import { useServiceSelection } from "@/contexts/ServiceSelectionContext";

type ServiceDetailProps = {
  serviceDetails: AIService;
};

export function ServiceDetail({ serviceDetails }: ServiceDetailProps) {
  const router = useRouter();
  const {
    state: { selectedServices },
    dispatch,
  } = useServiceSelection();

  const [currentService, setCurrentService] = useState<AIService | null>(null);

  useEffect(() => {
    setCurrentService(serviceDetails);
    if (!selectedServices.some((s) => s.service.id === serviceDetails.id)) {
      dispatch({
        type: "UPDATE_SERVICE",
        payload: {
          service: serviceDetails,
          selectedModels: [],
          selectedPlans: [],
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (currentService) {
      if (!selectedServices.some((s) => s.service.id === currentService.id)) {
        dispatch({
          type: "ADD_SERVICE",
          payload: {
            service: currentService,
            selectedModels: [],
            selectedPlans: [],
          },
        });
      }
    }
  }, [currentService, dispatch, selectedServices]);

  const onBackClick = () => {
    router.push("/");
  };

  const handlePlanChange = (
    planId: string,
    change: number,
    billingCycle: "monthly" | "yearly"
  ) => {
    const currentServiceSelection = selectedServices.find(
      (s) => s.service.id === currentService?.id
    );
    if (!currentServiceSelection) {
      throw new Error("現在のサービス選択が見つかりません。");
    }
    const updatedPlans = updatePlanSelection(
      currentServiceSelection.selectedPlans,
      planId,
      change,
      billingCycle
    );
    dispatch({
      type: "UPDATE_SERVICE",
      payload: {
        ...currentServiceSelection,
        selectedPlans: updatedPlans,
      },
    });
  };

  const updatePlanSelection = (
    plans: PlanSelectionType[],
    planId: string,
    change: number,
    billingCycle: "monthly" | "yearly"
  ) => {
    const existingPlan = plans.find(
      (p) => p.id === planId && p.billingCycle === billingCycle
    );
    if (existingPlan) {
      const newQuantity = Math.max(0, existingPlan.quantity + change);
      if (newQuantity === 0) {
        return plans.filter(
          (p) => !(p.id === planId && p.billingCycle === billingCycle)
        );
      }
      return plans.map((p) =>
        p.id === planId && p.billingCycle === billingCycle
          ? { ...p, quantity: newQuantity }
          : p
      );
    } else if (change > 0) {
      return [...plans, { id: planId, quantity: 1, billingCycle }];
    }
    return plans;
  };

  const handleModelToggle = (modelId: string) => {
    const currentServiceSelection = selectedServices.find(
      (s) => s.service.id === currentService?.id
    )!;
    const updatedService = {
      ...currentServiceSelection,
      selectedModels: currentServiceSelection.selectedModels.some(
        (m) => m.id === modelId
      )
        ? currentServiceSelection.selectedModels.filter((m) => m.id !== modelId)
        : [
            ...currentServiceSelection.selectedModels,
            { id: modelId, inputTokens: 0, outputTokens: 0 },
          ],
    };
    dispatch({ type: "UPDATE_SERVICE", payload: updatedService });
  };

  const handleTokenChange = (
    modelId: string,
    type: "input" | "output",
    value: number
  ) => {
    const currentServiceSelection = selectedServices.find(
      (s) => s.service.id === currentService?.id
    );
    if (!currentServiceSelection) {
      throw new Error("現在のサービス選択が見つかりません。");
    }
    const updatedModels = currentServiceSelection.selectedModels.map((m) =>
      m.id === modelId
        ? {
            ...m,
            [type === "input" ? "inputTokens" : "outputTokens"]: value,
          }
        : m
    );
    dispatch({
      type: "UPDATE_SERVICE",
      payload: {
        ...currentServiceSelection,
        selectedModels: updatedModels,
      },
    });
  };

  if (!currentService) return null;

  return (
    <main className="flex-grow container mx-auto p-6">
      <div>
        <Button onClick={onBackClick} className="mb-6" variant="ghost">
          <ChevronLeft className="mr-2 h-4 w-4" />
          サービス一覧に戻る
        </Button>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center gap-4">
            <Image
              src={currentService.logoPath || ""}
              alt={`${currentService.name} logo`}
              width={80}
              height={80}
              className="rounded-full"
            />
            <div>
              <CardTitle className="text-2xl">{currentService.name}</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                {currentService.provider}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 text-lg mb-4">
              {currentService.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {currentService.planPricingUrl && (
                <a
                  href={currentService.planPricingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  料金プラン詳細
                </a>
              )}
              {currentService.modelPricingUrl && (
                <a
                  href={currentService.modelPricingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  モデル料金詳細
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="plans" className="mb-6">
          <TabsList className="flex w-full border-b border-gray-200">
            {["plans", "models"].map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className={cn(
                  "flex-1 px-4 py-2 text-sm font-medium text-gray-500 transition-all",
                  "hover:text-gray-700 focus:outline-none",
                  "data-[state=active]:text-primary data-[state=active]:bg-white data-[state=active]:shadow-sm"
                )}
              >
                {tab === "plans" ? "利用可能なプラン" : "利用可能なモデル"}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="plans" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">利用可能なプラン</CardTitle>
                <CardDescription>
                  必要なプランと数量を選択してください
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PlanSelection
                  currentService={currentService}
                  selectedServices={selectedServices}
                  handlePlanChange={handlePlanChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="models" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">利用可能なモデル</CardTitle>
                <CardDescription>
                  使用したいモデルを選択し、予想使用量を入力してください
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentService.models.length > 0 ? (
                  <ModelSelection
                    currentService={currentService}
                    selectedServices={selectedServices}
                    handleModelToggle={handleModelToggle}
                    handleTokenChange={handleTokenChange}
                  />
                ) : (
                  <p className="text-gray-500">
                    利用可能なモデルがありません。
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
