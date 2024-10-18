"use client";

import { useState, useEffect, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { getAIServicesSummary } from "@/lib/api";
import { Header } from "@/components/layout/header/Header";
import ServiceSkeleton from "@/components/ServiceList/ServiceSkeleton";
import SearchBar from "@/components/SearchBar/SearchBar";
import ShareDialog from "@/components/ShareDialog/ShareDialog";
import { CostBreakdown } from "@/components/CostBreakdown/CostBreakdown";
import { ServiceList } from "@/components/ServiceList/ServiceList";
import { useHeaderState } from "@/hooks/useHeaderState";
import {
  AIService,
  AIServiceSummary,
  ServiceSelection,
  EncodedState,
} from "@/types/types";
import { useRouter } from "next/navigation";
import { useServiceSelection } from "@/contexts/ServiceSelectionContext";

export function Top() {
  const router = useRouter();
  const {
    state: { selectedServices },
    dispatch,
  } = useServiceSelection();

  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aiServices, setAiServices] = useState<AIServiceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      router.push(`/service/${service.id}`);
    } catch (err) {
      setError(
        "サービスの選択中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error selecting service:", err);
    }
  };

  const handleRemoveModel = (serviceId: string, modelId: string) => {
    try {
      dispatch({
        type: "UPDATE_SERVICE",
        payload: {
          ...selectedServices.find((s) => s.service.id === serviceId)!,
          selectedModels: selectedServices
            .find((s) => s.service.id === serviceId)!
            .selectedModels.filter((m) => m.id !== modelId),
        },
      });
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
      dispatch({
        type: "UPDATE_SERVICE",
        payload: {
          ...selectedServices.find((s) => s.service.id === serviceId)!,
          selectedPlans: selectedServices
            .find((s) => s.service.id === serviceId)!
            .selectedPlans.filter(
              (p) => !(p.id === planId && p.billingCycle === billingCycle)
            ),
        },
      });
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
      dispatch({ type: "SET_SELECTED_SERVICES", payload: decodedState });
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

        {isLoading ? (
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
        )}
      </main>

      <ShareDialog url={shareUrl} onClose={() => setShareUrl(null)} />

      <Toaster />
    </div>
  );
}
