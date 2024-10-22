"use client";

import { useState, useEffect, useMemo } from "react";
import React from "react";
import SearchBar from "@/components/features/SearchBar/SearchBar";
import { ServiceList } from "@/components/features/ServiceList/ServiceList";
import { AIServiceSummary, ServiceSelection } from "@/types/types";
import { useRouter } from "next/navigation";
import { useServiceSelection } from "@/contexts/ServiceSelectionContext";
import LZString from "lz-string";

interface TopProps {
  aiServices: AIServiceSummary[];
}

export function Top({ aiServices }: TopProps) {
  const router = useRouter();
  const { dispatch } = useServiceSelection();

  const [searchQuery, setSearchQuery] = useState("");

  const handleServiceSelect = async (service: AIServiceSummary) => {
    router.push(`/service/${service.id}`);
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
      const decompressedState =
        LZString.decompressFromEncodedURIComponent(encodedState);
      if (!decompressedState) {
        throw new Error("Failed to decompress state");
      }
      const state: ServiceSelection[] = JSON.parse(decompressedState);
      return state.map((s) => ({
        service: s.service,
        selectedModels: s.selectedModels,
        selectedPlans: s.selectedPlans,
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
      <SearchBar query={searchQuery} onChange={setSearchQuery} />
      <ServiceList
        filteredServices={filteredServices}
        handleServiceSelect={handleServiceSelect}
      />
    </main>
  );
}
