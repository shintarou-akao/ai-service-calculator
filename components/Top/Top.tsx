"use client";

import { useState, useEffect, useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import React from "react";
import { getAIServicesSummary } from "@/lib/api";
import ServiceSkeleton from "@/components/ServiceList/ServiceSkeleton";
import SearchBar from "@/components/SearchBar/SearchBar";
import { ServiceList } from "@/components/ServiceList/ServiceList";
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
  const { dispatch } = useServiceSelection();

  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [aiServices, setAiServices] = useState<AIServiceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  );
}
