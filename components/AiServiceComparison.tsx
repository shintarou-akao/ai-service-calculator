"use client";

import { useState, useEffect, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import {
  getAIServicesSummary,
  getAIServiceDetails,
  AIService,
  AIServiceSummary,
} from "@/lib/api";
import { Header } from "@/components/layout/header/Header";
import ServiceSkeleton from "@/components/ServiceList/ServiceSkeleton";
import SearchBar from "@/components/SearchBar/SearchBar";
import ShareDialog from "@/components/ShareDialog/ShareDialog";
import { CostBreakdown } from "@/components/CostBreakdown/CostBreakdown";
import { ModelSelection } from "@/components/ModelSelection/ModelSelection";
import { PlanSelection } from "@/components/PlanSelection/PlanSelection";
import { ServiceList } from "@/components/ServiceList/ServiceList";
import { ServiceDetail } from "@/components/ServiceDetail/ServiceDetail";
import { useHeaderState } from "@/hooks/useHeaderState";

type PlanSelection = {
  id: string;
  quantity: number;
  billingCycle: "monthly" | "yearly";
};

type ModelSelection = {
  id: string;
  inputTokens: number;
  outputTokens: number;
};

export type ServiceSelection = {
  service: AIService;
  selectedModels: ModelSelection[];
  selectedPlans: PlanSelection[];
};

// 新しい型定義を追加
type EncodedState = {
  id: string;
  models: {
    id: string;
    input: number;
    output: number;
  }[];
  plans: {
    id: string;
    quantity: number;
    cycle: "monthly" | "yearly";
  }[];
}[];

export function AiServiceComparison() {
  const [selectedServices, setSelectedServices] = useState<ServiceSelection[]>(
    []
  );
  const [currentService, setCurrentService] = useState<AIService | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [aiServices, setAiServices] = useState<AIServiceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const activeServiceSelections = useMemo(
    () =>
      selectedServices.filter(
        (s) =>
          s.selectedModels.some(
            (m) => m.inputTokens > 0 || m.outputTokens > 0
          ) || s.selectedPlans.length > 0
      ),
    [selectedServices]
  );

  const {
    totalApiCost,
    totalPlanCost,
    totalCost,
    hasSelectedServices,
    handleShareClick,
    isBreakdownOpen,
    setIsBreakdownOpen,
    shareUrl,
    setShareUrl,
  } = useHeaderState(selectedServices, activeServiceSelections);

  useEffect(() => {
    async function fetchServices() {
      setIsLoading(true);
      try {
        const services = await getAIServicesSummary();
        setAiServices(services);
      } catch (err) {
        setError(
          "AIサービスの取得中にエラーが発生しました。もう一度お試しください。"
        );
        console.error("Error fetching AI services:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchServices();
  }, []);

  const handleServiceSelect = async (service: AIServiceSummary) => {
    try {
      setIsLoadingDetails(true);
      setCurrentView("detail");
      const serviceDetails = await getAIServiceDetails(service.id);
      if (serviceDetails) {
        setCurrentService(serviceDetails);
        if (!selectedServices.some((s) => s.service.id === serviceDetails.id)) {
          setSelectedServices((prev) => [
            ...prev,
            {
              service: serviceDetails,
              selectedModels: [],
              selectedPlans: [],
            },
          ]);
        }
      } else {
        throw new Error("サービスの詳細を取得できませんでした。");
      }
    } catch (err) {
      setError(
        "サービスの選択中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error selecting service:", err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleModelToggle = (modelId: string) => {
    try {
      setSelectedServices((prev) =>
        prev.map((s) =>
          s.service.id === currentService?.id
            ? {
                ...s,
                selectedModels: s.selectedModels.some((m) => m.id === modelId)
                  ? s.selectedModels.filter((m) => m.id !== modelId)
                  : [
                      ...s.selectedModels,
                      { id: modelId, inputTokens: 0, outputTokens: 0 },
                    ],
              }
            : s
        )
      );
    } catch (err) {
      setError(
        "モデルの選択中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error toggling model:", err);
    }
  };

  const handlePlanChange = (
    planId: string,
    change: number,
    billingCycle: "monthly" | "yearly"
  ) => {
    try {
      setSelectedServices((prev) =>
        prev.map((s) =>
          s.service.id === currentService?.id
            ? {
                ...s,
                selectedPlans: updatePlanSelection(
                  s.selectedPlans,
                  planId,
                  change,
                  billingCycle
                ),
              }
            : s
        )
      );
    } catch (err) {
      setError(
        "プランの変更中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error changing plan:", err);
    }
  };

  const updatePlanSelection = (
    plans: PlanSelection[],
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

  const handleTokenChange = (
    modelId: string,
    type: "input" | "output",
    value: number
  ) => {
    try {
      setSelectedServices((prev) =>
        prev.map((s) =>
          s.service.id === currentService?.id
            ? {
                ...s,
                selectedModels: s.selectedModels.map((m) =>
                  m.id === modelId
                    ? {
                        ...m,
                        [type === "input" ? "inputTokens" : "outputTokens"]:
                          value,
                      }
                    : m
                ),
              }
            : s
        )
      );
    } catch (err) {
      setError(
        "トークン数の変更中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error changing token count:", err);
    }
  };

  const handleRemoveModel = (serviceId: string, modelId: string) => {
    try {
      setSelectedServices((prev) =>
        prev.map((s) =>
          s.service.id === serviceId
            ? {
                ...s,
                selectedModels: s.selectedModels.filter(
                  (m) => m.id !== modelId
                ),
              }
            : s
        )
      );
    } catch (err) {
      setError(
        "モデルの削除中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error removing model:", err);
    }
  };

  const handleRemovePlan = (
    serviceId: string,
    planId: string,
    billingCycle: "monthly" | "yearly"
  ) => {
    try {
      setSelectedServices((prev) =>
        prev.map((s) =>
          s.service.id === serviceId
            ? {
                ...s,
                selectedPlans: s.selectedPlans.filter(
                  (p) => !(p.id === planId && p.billingCycle === billingCycle)
                ),
              }
            : s
        )
      );
    } catch (err) {
      setError(
        "プランの削除中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error removing plan:", err);
    }
  };

  const filteredServices = useMemo(
    () =>
      aiServices.filter(
        (service) =>
          service.name.toLowerCase().startsWith(searchQuery.toLowerCase()) ||
          service.provider.toLowerCase().startsWith(searchQuery.toLowerCase())
      ),
    [searchQuery, aiServices]
  );

  const decodeState = (encodedState: string): ServiceSelection[] => {
    try {
      const state: EncodedState = JSON.parse(decodeURIComponent(encodedState));
      return state.map((s) => ({
        service: aiServices.find((service) => service.id === s.id) as AIService,
        selectedModels: s.models.map((m) => ({
          id: m.id,
          inputTokens: m.input,
          outputTokens: m.output,
        })),
        selectedPlans: s.plans.map((p) => ({
          id: p.id,
          quantity: p.quantity,
          billingCycle: p.cycle,
        })),
      }));
    } catch (error) {
      console.error("Failed to decode state:", error);
      return [];
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stateParam = urlParams.get("state");
    if (stateParam) {
      const decodedState = decodeState(stateParam);
      setSelectedServices(decodedState);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header
        showCosts={true}
        totalApiCost={totalApiCost}
        totalPlanCost={totalPlanCost}
        totalCost={totalCost}
        onShareClick={handleShareClick}
        hasSelectedServices={hasSelectedServices}
        CostBreakdown={
          <CostBreakdown
            isBreakdownOpen={isBreakdownOpen}
            setIsBreakdownOpen={setIsBreakdownOpen}
            activeServiceSelections={activeServiceSelections}
            totalCost={totalCost}
            handleRemoveModel={handleRemoveModel}
            handleRemovePlan={handleRemovePlan}
          />
        }
      />

      <main className="flex-grow container mx-auto p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentView === "list" ? (
          isLoading ? (
            <>
              <SearchBar query={searchQuery} onChange={setSearchQuery} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <ServiceSkeleton key={index} />
                ))}
              </div>
            </>
          ) : (
            <>
              <SearchBar query={searchQuery} onChange={setSearchQuery} />
              <ServiceList
                filteredServices={filteredServices}
                handleServiceSelect={handleServiceSelect}
              />
            </>
          )
        ) : currentView === "detail" ? (
          <ServiceDetail
            currentService={currentService}
            isLoadingDetails={isLoadingDetails}
            selectedServices={selectedServices}
            handlePlanChange={handlePlanChange}
            handleModelToggle={handleModelToggle}
            handleTokenChange={handleTokenChange}
            onBackClick={() => {
              setCurrentService(null);
              setCurrentView("list");
            }}
          />
        ) : null}
      </main>

      <ShareDialog url={shareUrl} onClose={() => setShareUrl(null)} />

      <Toaster />
    </div>
  );
}
