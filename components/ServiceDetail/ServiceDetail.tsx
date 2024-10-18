import React from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ModelSelection } from "@/components/ModelSelection/ModelSelection";
import { PlanSelection } from "@/components/PlanSelection/PlanSelection";
import { AIService, ServiceSelection } from "@/types/types";

// Props の型定義
interface ServiceDetailProps {
  currentService: AIService | null;
  isLoadingDetails: boolean;
  selectedServices: ServiceSelection[];
  handlePlanChange: (
    planId: string,
    change: number,
    billingCycle: "monthly" | "yearly"
  ) => void;
  handleModelToggle: (modelId: string) => void;
  handleTokenChange: (
    modelId: string,
    type: "input" | "output",
    value: number
  ) => void;
  onBackClick: () => void;
}

export function ServiceDetail({
  currentService,
  isLoadingDetails,
  selectedServices,
  handlePlanChange,
  handleModelToggle,
  handleTokenChange,
  onBackClick,
}: ServiceDetailProps) {
  if (isLoadingDetails) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[300px]" />
          <Skeleton className="h-4 w-[250px]" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-lg" />
      </div>
    );
  }

  if (!currentService) return null;

  return (
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
  );
}
