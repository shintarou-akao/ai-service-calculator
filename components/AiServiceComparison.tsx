"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import {
  ChevronLeft,
  Plus,
  Minus,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  getAIServicesSummary,
  getAIServiceDetails,
  AIService,
  AIServiceSummary,
} from "@/lib/api";
import { Header } from "@/components/layout/header";
import ServiceSkeleton from "@/components/ServiceList/ServiceSkeleton";
import SearchBar from "@/components/SearchBar/SearchBar";
import ShareDialog from "@/components/ShareDialog/ShareDialog";
import { CostBreakdown } from "@/components/CostBreakdown/CostBreakdown";
import { ModelSelection } from "@/components/ModelSelection/ModelSelection";

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
  const [totalApiCost, setTotalApiCost] = useState(0);
  const [totalPlanCost, setTotalPlanCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [aiServices, setAiServices] = useState<AIServiceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

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

  useEffect(() => {
    try {
      let apiCostSum = 0;
      let planCostSum = 0;

      activeServiceSelections.forEach(
        ({ service, selectedModels, selectedPlans }) => {
          selectedModels.forEach((model) => {
            const modelInfo = service.models.find((m) => m.id === model.id);
            if (modelInfo) {
              const inputCost =
                (model.inputTokens * modelInfo.inputPrice) / 1000;
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
    } catch (err) {
      setError("コトの計算中にエラーが発生しました。もう一度お試しください。");
      console.error("Error calculating costs:", err);
    }
  }, [activeServiceSelections]);

  const encodeState = () => {
    const state = activeServiceSelections.map((s) => ({
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
  };

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

  const handleShareClick = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const encodedState = encodeState();
    const url = `${baseUrl}?state=${encodedState}`;
    setShareUrl(url);
  };

  // 選択されているサービスがあるかどうかを確認する関数
  const hasSelectedServices = useMemo(() => {
    return activeServiceSelections.length > 0;
  }, [activeServiceSelections]);

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

        <SearchBar query={searchQuery} onChange={setSearchQuery} />

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <ServiceSkeleton key={index} />
            ))}
          </div>
        ) : currentView === "detail" ? (
          <div>
            <Button
              onClick={() => {
                setCurrentService(null);
                setCurrentView("list");
              }}
              className="mb-6"
              variant="ghost"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              サービス一覧に戻る
            </Button>

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
              <>
                <Card className="mb-6">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Image
                      src={currentService?.logoPath || ""}
                      alt={`${currentService?.name} logo`}
                      width={80}
                      height={80}
                      className="rounded-full"
                    />
                    <div>
                      <CardTitle className="text-2xl">
                        {currentService?.name}
                      </CardTitle>
                      <CardDescription className="text-lg text-gray-600">
                        {currentService?.provider}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-lg mb-4">
                      {currentService?.description}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      {currentService?.planPricingUrl && (
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
                      {currentService?.modelPricingUrl && (
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
                        {tab === "plans"
                          ? "利用可能なプラン"
                          : "利用可能なモデル"}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  <TabsContent value="plans" className="pt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">
                          利用可能なプラン
                        </CardTitle>
                        <CardDescription>
                          必要なプランと数量を選択してください
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-8">
                          <div>
                            <h3 className="text-lg font-semibold mb-4 text-gray-800">
                              月額プラン
                            </h3>
                            {currentService?.plans.map((plan) => {
                              const serviceSelection = selectedServices.find(
                                (s) => s.service.id === currentService?.id
                              );
                              const selectedPlan =
                                serviceSelection?.selectedPlans.find(
                                  (p) =>
                                    p.id === plan.id &&
                                    p.billingCycle === "monthly"
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
                                      onClick={() =>
                                        handlePlanChange(plan.id, -1, "monthly")
                                      }
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
                                      onClick={() =>
                                        handlePlanChange(plan.id, 1, "monthly")
                                      }
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
                          {currentService?.plans.some(
                            (plan) => plan.yearlyPrice > 0
                          ) && (
                            <div>
                              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                                年額プラン
                              </h3>
                              {currentService?.plans
                                .filter((plan) => plan.yearlyPrice > 0)
                                .map((plan) => {
                                  const serviceSelection =
                                    selectedServices.find(
                                      (s) => s.service.id === currentService?.id
                                    );
                                  const selectedPlan =
                                    serviceSelection?.selectedPlans.find(
                                      (p) =>
                                        p.id === plan.id &&
                                        p.billingCycle === "yearly"
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
                                          年額: ${plan.yearlyPrice}/年
                                          (月額換算: $
                                          {(plan.yearlyPrice / 12).toFixed(2)}
                                          /月)
                                        </p>
                                      </div>
                                      <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                                        <Button
                                          size="icon"
                                          variant="outline"
                                          onClick={() =>
                                            handlePlanChange(
                                              plan.id,
                                              -1,
                                              "yearly"
                                            )
                                          }
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
                                          onClick={() =>
                                            handlePlanChange(
                                              plan.id,
                                              1,
                                              "yearly"
                                            )
                                          }
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
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="models" className="pt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-xl">
                          利用可能なモデル
                        </CardTitle>
                        <CardDescription>
                          使用したいモデルを選択し、予想使用量を入力してください
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {currentService && (
                          <ModelSelection
                            currentService={currentService}
                            selectedServices={selectedServices}
                            handleModelToggle={handleModelToggle}
                            handleTokenChange={handleTokenChange}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleServiceSelect(service)}
              >
                <CardHeader className="flex flex-row items-center gap-4">
                  <Image
                    src={service.logoPath}
                    alt={`${service.name} logo`}
                    width={60}
                    height={60}
                    className="rounded-full"
                  />
                  <div>
                    <CardTitle className="text-xl">{service.name}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {service.provider}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <ShareDialog url={shareUrl} onClose={() => setShareUrl(null)} />

      <Toaster />
    </div>
  );
}
