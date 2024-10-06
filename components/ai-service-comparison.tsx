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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Image from "next/image";
import {
  ChevronLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  BarChart2,
  AlertTriangle,
  Share2,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

type AIModel = {
  id: string;
  name: string;
  inputPrice: number;
  outputPrice: number;
  maxTokens: number;
};

type AIPlan = {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
};

type AIService = {
  id: string;
  name: string;
  provider: string;
  description: string;
  logoUrl: string;
  models: AIModel[];
  plans: AIPlan[];
};

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

type ServiceSelection = {
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

const aiServices: AIService[] = [
  {
    id: "openai",
    name: "ChatGPT",
    provider: "OpenAI",
    description: "高度な言語モデルを提供する先進的なAIプラットフォーム",
    logoUrl: "/images/logos/chatgpt.png",
    models: [
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        inputPrice: 0.0015,
        outputPrice: 0.002,
        maxTokens: 4096,
      },
      {
        id: "gpt-4",
        name: "GPT-4",
        inputPrice: 0.03,
        outputPrice: 0.06,
        maxTokens: 8192,
      },
    ],
    plans: [
      {
        id: "basic",
        name: "Basic",
        monthlyPrice: 20,
        yearlyPrice: 200,
        features: ["GPT-3.5 Turboへのアクセス", "月5Mトークン"],
      },
      {
        id: "pro",
        name: "Pro",
        monthlyPrice: 50,
        yearlyPrice: 500,
        features: ["GPT-4へのアクセス", "月10Mトークン"],
      },
      {
        id: "team",
        name: "Team",
        monthlyPrice: 100,
        yearlyPrice: 1000,
        features: ["GPT-4へのアクセス", "月20Mトークン", "チーム管理機能"],
      },
    ],
  },
  {
    id: "anthropic",
    name: "Claude",
    provider: "Anthropic",
    description: "倫理的で安全なAI開発に焦点を当てた次世代言語モデル",
    logoUrl: "/images/logos/claude.png",
    models: [
      {
        id: "claude-2",
        name: "Claude 2",
        inputPrice: 0.01102,
        outputPrice: 0.03268,
        maxTokens: 100000,
      },
    ],
    plans: [
      {
        id: "standard",
        name: "Standard",
        monthlyPrice: 30,
        yearlyPrice: 300,
        features: ["Claude 2へのアクセス", "月10Mトークン"],
      },
      {
        id: "enterprise",
        name: "Enterprise",
        monthlyPrice: 200,
        yearlyPrice: 2000,
        features: ["カスタムモデル", "優先サポート", "無制限トークン"],
      },
    ],
  },
  {
    id: "google",
    name: "Gemini",
    provider: "Google",
    description: "Googleが開発した最新のマルチモーダルAIモデル",
    logoUrl: "/images/logos/gemini.png",
    models: [
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        inputPrice: 0.00025,
        outputPrice: 0.0005,
        maxTokens: 32768,
      },
    ],
    plans: [
      {
        id: "starter",
        name: "Starter",
        monthlyPrice: 15,
        yearlyPrice: 150,
        features: ["Gemini Proへのアクセス", "月5Mトークン"],
      },
      {
        id: "advanced",
        name: "Advanced",
        monthlyPrice: 40,
        yearlyPrice: 400,
        features: [
          "Gemini Proへのアクセス",
          "月15Mトークン",
          "優先APIアクセス",
        ],
      },
    ],
  },
];

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
  const { toast } = useToast();

  const handleServiceSelect = (service: AIService) => {
    try {
      setCurrentService(service);
      setCurrentView("detail");
      if (!selectedServices.some((s) => s.service.id === service.id)) {
        setSelectedServices((prev) => [
          ...prev,
          {
            service,
            selectedModels: [],
            selectedPlans: [],
          },
        ]);
      }
    } catch (err) {
      setError(
        "サービスの選択中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error selecting service:", err);
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
    [searchQuery]
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
      setError(
        "コストの計算中にエラーが発生しました。もう一度お試しください。"
      );
      console.error("Error calculating costs:", err);
    }
  }, [activeServiceSelections]);

  const CostBreakdown = () => (
    <Dialog open={isBreakdownOpen} onOpenChange={setIsBreakdownOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
        >
          <BarChart2 className="w-4 h-4 mr-2" />
          料金内訳を確認
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] w-full md:max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl font-bold mb-4">
            料金内訳
          </DialogTitle>
          <DialogDescription>
            選択したサービス、モデル、プランの詳細な料金内訳
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto">
          <div className="space-y-6">
            {activeServiceSelections.map((serviceSelection) => (
              <div
                key={serviceSelection.service.id}
                className="bg-white p-4 rounded-lg shadow-md"
              >
                <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
                  {serviceSelection.service.name}
                </h3>

                {serviceSelection.selectedModels.filter(
                  (model) => model.inputTokens > 0 || model.outputTokens > 0
                ).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-base md:text-lg font-medium mb-3 text-gray-700">
                      選択されたモデル
                    </h4>
                    <div className="overflow-x-auto">
                      <Table className="w-[800px] md:w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/4">モデル名</TableHead>
                            <TableHead className="w-1/8 text-right">
                              入力トークン数
                            </TableHead>
                            <TableHead className="w-1/8 text-right">
                              出力トークン数
                            </TableHead>
                            <TableHead className="w-1/8 text-right">
                              入力コスト
                            </TableHead>
                            <TableHead className="w-1/8 text-right">
                              出力コスト
                            </TableHead>
                            <TableHead className="w-1/8 text-right">
                              合計コスト
                            </TableHead>
                            <TableHead className="w-1/8 text-center">
                              操作
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceSelection.selectedModels
                            .filter(
                              (model) =>
                                model.inputTokens > 0 || model.outputTokens > 0
                            )
                            .map((model) => {
                              const modelInfo =
                                serviceSelection.service.models.find(
                                  (m) => m.id === model.id
                                );
                              if (!modelInfo) return null;
                              const inputCost =
                                (model.inputTokens * modelInfo.inputPrice) /
                                1000;
                              const outputCost =
                                (model.outputTokens * modelInfo.outputPrice) /
                                1000;
                              const totalCost = inputCost + outputCost;
                              return (
                                <TableRow key={model.id}>
                                  <TableCell className="font-medium">
                                    {modelInfo.name}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {model.inputTokens.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {model.outputTokens.toLocaleString()}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    ${inputCost.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    ${outputCost.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    ${totalCost.toFixed(2)}
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleRemoveModel(
                                          serviceSelection.service.id,
                                          model.id
                                        )
                                      }
                                      className="text-red-600 hover:text-red-800 hover:bg-red-100"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">
                                        {modelInfo.name}を削除
                                      </span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {serviceSelection.selectedPlans.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-base md:text-lg font-medium mb-3 text-gray-700">
                      選択されたプラン
                    </h4>
                    <div className="overflow-x-auto">
                      <Table className="w-[800px] md:w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-1/4">プラン名</TableHead>
                            <TableHead className="w-1/6">
                              請求サイクル
                            </TableHead>
                            <TableHead className="w-1/8 text-right">
                              数量
                            </TableHead>
                            <TableHead className="w-1/6 text-right">
                              単価
                            </TableHead>
                            <TableHead className="w-1/6 text-right">
                              合計コスト（月額）
                            </TableHead>
                            <TableHead className="w-1/8 text-center">
                              操作
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceSelection.selectedPlans.map(
                            (planSelection) => {
                              const plan = serviceSelection.service.plans.find(
                                (p) => p.id === planSelection.id
                              );
                              if (!plan) return null;
                              const price =
                                planSelection.billingCycle === "monthly"
                                  ? plan.monthlyPrice
                                  : plan.yearlyPrice / 12;
                              const totalCost = price * planSelection.quantity;
                              return (
                                <TableRow
                                  key={`${plan.id}-${planSelection.billingCycle}`}
                                >
                                  <TableCell className="font-medium">
                                    {plan.name}
                                  </TableCell>
                                  <TableCell>
                                    {planSelection.billingCycle === "monthly"
                                      ? "月額"
                                      : "年額"}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {planSelection.quantity}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    ${price.toFixed(2)}/月
                                  </TableCell>
                                  <TableCell className="text-right">
                                    ${totalCost.toFixed(2)}/月
                                  </TableCell>
                                  <TableCell className="text-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        handleRemovePlan(
                                          serviceSelection.service.id,
                                          plan.id,
                                          planSelection.billingCycle
                                        )
                                      }
                                      className="text-red-600 hover:text-red-800 hover:bg-red-100"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">
                                        {plan.name}を削除
                                      </span>
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            }
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                <div className="text-right font-semibold text-base md:text-lg text-gray-800">
                  サービス小計: $
                  {(
                    serviceSelection.selectedModels.reduce((sum, model) => {
                      const modelInfo = serviceSelection.service.models.find(
                        (m) => m.id === model.id
                      );
                      if (!modelInfo) return sum;
                      const inputCost =
                        (model.inputTokens * modelInfo.inputPrice) / 1000;
                      const outputCost =
                        (model.outputTokens * modelInfo.outputPrice) / 1000;
                      return sum + inputCost + outputCost;
                    }, 0) +
                    serviceSelection.selectedPlans.reduce(
                      (sum, planSelection) => {
                        const plan = serviceSelection.service.plans.find(
                          (p) => p.id === planSelection.id
                        );
                        if (!plan) return sum;
                        const price =
                          planSelection.billingCycle === "monthly"
                            ? plan.monthlyPrice
                            : plan.yearlyPrice / 12;
                        return sum + price * planSelection.quantity;
                      },
                      0
                    )
                  ).toFixed(2)}
                  /月
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="text-right text-xl md:text-2xl font-bold text-gray-800">
            総合計: ${totalCost.toFixed(2)}/月
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (currentView === "detail") {
      setCurrentService(null);
      setCurrentView("list");
    }
  };

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
        service: aiServices.find((service) => service.id === s.id)!,
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

  // URLをコピーするボタンのonClickハンドラを更新
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(shareUrl || "");
    toast({
      title: "URLをコピーしました",
      description: "共有URLがクリップボードにコピーされまた。",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md p-4 sm:p-6">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <h1>
              <Link
                href="/"
                onClick={handleHomeClick}
                className="text-2xl sm:text-3xl font-bold text-gray-800 hover:text-gray-600 transition-colors"
              >
                AI Service Calculator
              </Link>
            </h1>
            <div className="w-full sm:w-auto">
              <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:space-x-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">API利用料</p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-800">
                    ${totalApiCost.toFixed(2)}/月
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">
                    サービス利用料
                  </p>
                  <p className="text-sm sm:text-lg font-semibold text-gray-800">
                    ${totalPlanCost.toFixed(2)}/月
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">総合計</p>
                  <p className="text-base sm:text-2xl font-bold text-gray-800">
                    ${totalCost.toFixed(2)}/月
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-2 mt-2">
                <CostBreakdown />
                <Button
                  onClick={handleShareClick}
                  variant="outline"
                  className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-xs sm:text-sm"
                  disabled={!hasSelectedServices}
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  共有
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>エラー</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {currentView === "detail" ? (
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

            <Card className="mb-6">
              <CardHeader className="flex flex-row items-center gap-4">
                <Image
                  src={currentService?.logoUrl || ""}
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
                <p className="text-gray-700 text-lg">
                  {currentService?.description}
                </p>
              </CardContent>
            </Card>

            <Tabs defaultValue="models" className="mb-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="models">利用可能なモデル</TabsTrigger>
                <TabsTrigger value="plans">利用可能なプラン</TabsTrigger>
              </TabsList>
              <TabsContent value="models">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">利用可能なモデル</CardTitle>
                    <CardDescription>
                      使用したいモデルを選択してください
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[400px] pr-4">
                      {currentService?.models.map((model) => {
                        const serviceSelection = selectedServices.find(
                          (s) => s.service.id === currentService?.id
                        );
                        const isSelected =
                          serviceSelection?.selectedModels.some(
                            (m) => m.id === model.id
                          ) || false;
                        return (
                          <div
                            key={model.id}
                            className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg"
                          >
                            <Checkbox
                              id={`model-${model.id}`}
                              checked={isSelected}
                              onCheckedChange={() =>
                                handleModelToggle(model.id)
                              }
                            />
                            <div className="grid gap-1.5 leading-none flex-grow">
                              <Label
                                htmlFor={`model-${model.id}`}
                                className="text-lg font-medium"
                              >
                                {model.name}
                              </Label>
                              <p className="text-sm text-gray-600">
                                入力: ${model.inputPrice.toFixed(5)}/1Kトークン
                                | 出力: ${model.outputPrice.toFixed(5)}
                                /1Kトークン | 最大:{" "}
                                {model.maxTokens.toLocaleString()}トークン
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="plans">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">利用可能なプラン</CardTitle>
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
                                p.id === plan.id && p.billingCycle === "monthly"
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
                                <ul className="text-sm text-gray-600 list-disc list-inside mt-2">
                                  {plan.features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                  ))}
                                </ul>
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
                      <div>
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">
                          年額プラン
                        </h3>
                        {currentService?.plans.map((plan) => {
                          const serviceSelection = selectedServices.find(
                            (s) => s.service.id === currentService?.id
                          );
                          const selectedPlan =
                            serviceSelection?.selectedPlans.find(
                              (p) =>
                                p.id === plan.id && p.billingCycle === "yearly"
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
                                <ul className="text-sm text-gray-600 list-disc list-inside mt-2">
                                  {plan.features.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                  ))}
                                </ul>
                              </div>
                              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() =>
                                    handlePlanChange(plan.id, -1, "yearly")
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
                                    handlePlanChange(plan.id, 1, "yearly")
                                  }
                                  className="bg-white"
                                >
                                  <Plus className="h-4 w-4" />
                                  <span className="sr-only">
                                    {plan.name}年額プランを1つ増やす
                                  </span>
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {selectedServices.some(
              (s) =>
                s.service.id === currentService?.id &&
                s.selectedModels.length > 0
            ) && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-xl">トークン数入力</CardTitle>
                  <CardDescription>
                    各モデルの予想使用量を入力してください
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentService?.models.map((model) => {
                    const serviceSelection = selectedServices.find(
                      (s) => s.service.id === currentService?.id
                    );
                    const selectedModel = serviceSelection?.selectedModels.find(
                      (m) => m.id === model.id
                    );
                    if (!selectedModel) return null;
                    return (
                      <div
                        key={model.id}
                        className="mb-6 p-4 bg-gray-50 rounded-lg"
                      >
                        <h4 className="font-semibold mb-4 text-lg">
                          {model.name}
                        </h4>
                        <div className="flex space-x-4">
                          <div className="flex-1">
                            <Label
                              htmlFor={`input-tokens-${model.id}`}
                              className="mb-2 block"
                            >
                              入力トークン数
                            </Label>
                            <Input
                              id={`input-tokens-${model.id}`}
                              type="number"
                              value={selectedModel.inputTokens}
                              onChange={(e) =>
                                handleTokenChange(
                                  model.id,
                                  "input",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full"
                            />
                          </div>
                          <div className="flex-1">
                            <Label
                              htmlFor={`output-tokens-${model.id}`}
                              className="mb-2 block"
                            >
                              出力トークン数
                            </Label>
                            <Input
                              id={`output-tokens-${model.id}`}
                              type="number"
                              value={selectedModel.outputTokens}
                              onChange={(e) =>
                                handleTokenChange(
                                  model.id,
                                  "output",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-full"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Label htmlFor="search-services" className="sr-only">
                サービスを検索
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  id="search-services"
                  type="text"
                  placeholder="サービス名または提供元で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 py-2 w-full bg-white border-2 border-gray-300 focus:border-gray-400 focus:ring-2 focus:ring-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => handleServiceSelect(service)}
                >
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Image
                      src={service.logoUrl}
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
          </>
        )}
      </main>

      <Dialog open={!!shareUrl} onOpenChange={() => setShareUrl(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>共有URL</DialogTitle>
            <DialogDescription>
              以下のURLを共有して、現在の選択状態を他の人と共有できます。
            </DialogDescription>
          </DialogHeader>
          <Input value={shareUrl || ""} readOnly />
          <DialogFooter>
            <Button onClick={handleCopyUrl}>URLをコピー</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
