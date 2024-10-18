"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { useHeaderState } from "@/hooks/useHeaderState";
import { CostBreakdown } from "@/components/CostBreakdown/CostBreakdown";
import { useServiceSelection } from "@/contexts/ServiceSelectionContext";
import ShareDialog from "@/components/ShareDialog/ShareDialog";

export function Header() {
  const {
    state: { selectedServices },
    dispatch,
  } = useServiceSelection();
  const {
    totalApiCost,
    totalPlanCost,
    totalCost,
    hasSelectedServices,
    handleShareClick,
    isBreakdownOpen,
    setIsBreakdownOpen,
    activeServiceSelections,
    shareUrl,
    setShareUrl,
  } = useHeaderState(selectedServices, selectedServices);

  const handleRemoveModel = (serviceId: string, modelId: string) => {
    dispatch({
      type: "UPDATE_SERVICE",
      payload: {
        ...selectedServices.find((s) => s.service.id === serviceId)!,
        selectedModels: selectedServices
          .find((s) => s.service.id === serviceId)!
          .selectedModels.filter((m) => m.id !== modelId),
      },
    });
  };

  const handleRemovePlan = (
    serviceId: string,
    planId: string,
    billingCycle: "monthly" | "yearly"
  ) => {
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
  };

  return (
    <>
      <header className="bg-white shadow-md">
        <div className="container mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <Link href="/" className="inline-block">
              <Image
                src="/images/logos/logo.png"
                alt="AI Service Calculator"
                width={240}
                height={100}
                className="w-[180px] sm:w-[240px] h-auto"
              />
            </Link>
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
                <CostBreakdown
                  isBreakdownOpen={isBreakdownOpen}
                  setIsBreakdownOpen={setIsBreakdownOpen}
                  activeServiceSelections={activeServiceSelections}
                  totalCost={totalCost}
                  handleRemoveModel={handleRemoveModel}
                  handleRemovePlan={handleRemovePlan}
                />
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
      <ShareDialog url={shareUrl} onClose={() => setShareUrl(null)} />
    </>
  );
}
