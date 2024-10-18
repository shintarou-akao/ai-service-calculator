"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { AlertTriangle, ChevronLeft, ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ModelSelection } from "@/components/ModelSelection/ModelSelection";
import { PlanSelection } from "@/components/PlanSelection/PlanSelection";
import { AIService, PlanSelection as PlanSelectionType } from "@/types/types";
import { useRouter } from "next/navigation";
import { getAIServiceDetails } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Header } from "@/components/layout/header/Header";
import { useHeaderState } from "@/hooks/useHeaderState";
import ShareDialog from "@/components/ShareDialog/ShareDialog";
import { Toaster } from "@/components/ui/toaster";
import { CostBreakdown } from "@/components/CostBreakdown/CostBreakdown";
import { useServiceSelection } from "@/contexts/ServiceSelectionContext";

type ServiceDetailProps = {
  serviceId: string;
};

export function ServiceDetail({ serviceId }: ServiceDetailProps) {
  const router = useRouter();
  const {
    state: { selectedServices },
    dispatch,
  } = useServiceSelection();

  const [currentService, setCurrentService] = useState<AIService | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    async function fetchServiceDetails() {
      setIsLoadingDetails(true);
      try {
        const serviceDetails = await getAIServiceDetails(serviceId);
        if (serviceDetails) {
          setCurrentService(serviceDetails);
          if (
            !selectedServices.some((s) => s.service.id === serviceDetails.id)
          ) {
            dispatch({
              type: "UPDATE_SERVICE",
              payload: {
                service: serviceDetails,
                selectedModels: [],
                selectedPlans: [],
              },
            });
          }
        } else {
          throw new Error("サービスの詳細を取得できませんでした。");
        }
      } catch (err) {
        setError(
          "サービスの詳細の取得中にエラーが発生しました。もう一度お試しください。"
        );
        console.error("Error fetching service details:", err);
      } finally {
        setIsLoadingDetails(false);
      }
    }

    fetchServiceDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceId]);

  useEffect(() => {
    if (currentService) {
      console.log("Selected services:", selectedServices);
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
    try {
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
    } catch (err) {
      setError(
        "プランの変更中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error changing plan:", err);
    }
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
    try {
      const currentServiceSelection = selectedServices.find(
        (s) => s.service.id === currentService?.id
      )!;
      const updatedService = {
        ...currentServiceSelection,
        selectedModels: currentServiceSelection.selectedModels.some(
          (m) => m.id === modelId
        )
          ? currentServiceSelection.selectedModels.filter(
              (m) => m.id !== modelId
            )
          : [
              ...currentServiceSelection.selectedModels,
              { id: modelId, inputTokens: 0, outputTokens: 0 },
            ],
      };
      dispatch({ type: "UPDATE_SERVICE", payload: updatedService });
    } catch (err) {
      setError(
        "モデルの選択中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error toggling model:", err);
    }
  };

  const handleTokenChange = (
    modelId: string,
    type: "input" | "output",
    value: number
  ) => {
    try {
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
    } catch (err) {
      setError(
        "トークン数の変更中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error changing token count:", err);
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

  if (!currentService) return null;

  return (
    <>
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
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {isLoadingDetails ? (
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[300px]" />
              <Skeleton className="h-4 w-[250px]" />
            </div>
            <Skeleton className="h-[400px] w-full rounded-lg" />
          </div>
        ) : (
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
                  <CardTitle className="text-2xl">
                    {currentService.name}
                  </CardTitle>
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
                    <ModelSelection
                      currentService={currentService}
                      selectedServices={selectedServices}
                      handleModelToggle={handleModelToggle}
                      handleTokenChange={handleTokenChange}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <ShareDialog url={shareUrl} onClose={() => setShareUrl(null)} />

      <Toaster />
    </>
  );
}
