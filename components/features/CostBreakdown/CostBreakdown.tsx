import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BarChart2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceSelection } from "@/types";
import { TOKEN_DIVISOR } from "@/lib/constants";

interface CostBreakdownProps {
  isBreakdownOpen: boolean;
  setIsBreakdownOpen: (isOpen: boolean) => void;
  activeServiceSelections: ServiceSelection[];
  totalCost: number;
  handleRemoveModel: (serviceId: string, modelId: string) => void;
  handleRemovePlan: (
    serviceId: string,
    planId: string,
    billingCycle: "monthly" | "yearly"
  ) => void;
}

export function CostBreakdown({
  isBreakdownOpen,
  setIsBreakdownOpen,
  activeServiceSelections,
  totalCost,
  handleRemoveModel,
  handleRemovePlan,
}: CostBreakdownProps) {
  const isServiceSelected = (serviceSelection: ServiceSelection) => {
    return (
      serviceSelection.selectedModels.some(
        (model) => model.inputTokens > 0 || model.outputTokens > 0
      ) || serviceSelection.selectedPlans.length > 0
    );
  };

  const calculateModelCost = (
    serviceSelection: ServiceSelection,
    model: ServiceSelection["selectedModels"][0]
  ) => {
    const modelInfo = serviceSelection.service.models.find(
      (m) => m.id === model.id
    );
    if (!modelInfo) return { inputCost: 0, outputCost: 0, totalCost: 0 };
    const inputCost =
      (model.inputTokens * modelInfo.inputPrice) / TOKEN_DIVISOR;
    const outputCost =
      (model.outputTokens * modelInfo.outputPrice) / TOKEN_DIVISOR;
    const totalCost = inputCost + outputCost;
    return { inputCost, outputCost, totalCost };
  };

  const calculatePlanCost = (
    serviceSelection: ServiceSelection,
    planSelection: ServiceSelection["selectedPlans"][0]
  ) => {
    const plan = serviceSelection.service.plans.find(
      (p) => p.id === planSelection.id
    );
    if (!plan) return { price: 0, totalCost: 0 };
    const price =
      planSelection.billingCycle === "monthly"
        ? plan.monthlyPrice
        : plan.yearlyPrice / 12;
    const totalCost = price * planSelection.quantity;
    return { price, totalCost };
  };

  const calculateServiceSubtotal = (serviceSelection: ServiceSelection) => {
    const modelsTotal = serviceSelection.selectedModels.reduce((sum, model) => {
      const { totalCost } = calculateModelCost(serviceSelection, model);
      return sum + totalCost;
    }, 0);

    const plansTotal = serviceSelection.selectedPlans.reduce(
      (sum, planSelection) => {
        const { totalCost } = calculatePlanCost(
          serviceSelection,
          planSelection
        );
        return sum + totalCost;
      },
      0
    );

    return modelsTotal + plansTotal;
  };

  return (
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
            {activeServiceSelections
              .filter(isServiceSelected)
              .map((serviceSelection) => (
                <div
                  key={serviceSelection.service.id}
                  className="bg-white p-4 rounded-lg shadow-md"
                >
                  <h3 className="text-lg md:text-xl font-semibold mb-4 text-gray-800">
                    {serviceSelection.service.name}
                  </h3>

                  {serviceSelection.selectedModels.some(
                    (model) => model.inputTokens > 0 || model.outputTokens > 0
                  ) && (
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
                                  model.inputTokens > 0 ||
                                  model.outputTokens > 0
                              )
                              .map((model) => {
                                const { inputCost, outputCost, totalCost } =
                                  calculateModelCost(serviceSelection, model);
                                const modelInfo =
                                  serviceSelection.service.models.find(
                                    (m) => m.id === model.id
                                  );
                                if (!modelInfo) return null;
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
                                const { price, totalCost } = calculatePlanCost(
                                  serviceSelection,
                                  planSelection
                                );
                                const plan =
                                  serviceSelection.service.plans.find(
                                    (p) => p.id === planSelection.id
                                  );
                                if (!plan) return null;
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
                    {calculateServiceSubtotal(serviceSelection).toFixed(2)}
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
}
