import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

type HeaderProps = {
  showCosts?: boolean;
  totalApiCost?: number;
  totalPlanCost?: number;
  totalCost?: number;
  onShareClick?: () => void;
  hasSelectedServices?: boolean;
  CostBreakdown?: React.ReactNode;
};

export function Header({
  showCosts = false,
  totalApiCost = 0,
  totalPlanCost = 0,
  totalCost = 0,
  onShareClick,
  hasSelectedServices = false,
  CostBreakdown,
}: HeaderProps) {
  return (
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
          {showCosts && (
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
                {CostBreakdown}
                <Button
                  onClick={onShareClick}
                  variant="outline"
                  className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow text-xs sm:text-sm"
                  disabled={!hasSelectedServices}
                >
                  <Share2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  共有
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
