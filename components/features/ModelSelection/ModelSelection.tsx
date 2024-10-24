import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIModel, AIService, ServiceSelection } from "@/types";

interface ModelSelectionProps {
  currentService: AIService;
  selectedServices: ServiceSelection[];
  handleModelToggle: (modelId: string) => void;
  handleTokenChange: (
    modelId: string,
    type: "input" | "output",
    value: number
  ) => void;
}

export function ModelSelection({
  currentService,
  selectedServices,
  handleModelToggle,
  handleTokenChange,
}: ModelSelectionProps) {
  const renderModelPricing = (model: AIModel) => {
    const isGemini = model.name.startsWith("Gemini");
    const isPerplexityOnline = model.name.includes("-online");
    return (
      <>
        <ul className="list-disc pl-5">
          <li className="text-sm text-gray-600">
            入力: ${model.inputPrice} / 1Kトークン
          </li>
          <li className="text-sm text-gray-600">
            出力: ${model.outputPrice} / 1Kトークン
          </li>
          <li className="text-sm text-gray-600">
            最大入力トークン数: {model.contextWindow.toLocaleString()}トークン
          </li>
        </ul>
        {isGemini && (
          <p className="text-sm text-gray-600">
            ※ 128,000トークンを超える場合は、料金が変動します
          </p>
        )}
        {isPerplexityOnline && (
          <p className="text-sm text-gray-600 mt-2">
            ※
            オンラインモデルは、上記料金に加えて1000リクエストごとに$5の追加料金がかかります
          </p>
        )}
      </>
    );
  };

  return (
    <ScrollArea className="h-[600px] pr-4">
      {currentService.models.map((model) => {
        const serviceSelection = selectedServices.find(
          (s) => s.service.id === currentService.id
        );
        const selectedModel = serviceSelection?.selectedModels.find(
          (m) => m.id === model.id
        );
        const isSelected = !!selectedModel;

        return (
          <div key={model.id} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-4 mb-4">
              <Checkbox
                id={`model-${model.id}`}
                checked={isSelected}
                onCheckedChange={() => handleModelToggle(model.id)}
                className="bg-white"
              />
              <div className="grid gap-1.5 leading-none flex-grow">
                <Label
                  htmlFor={`model-${model.id}`}
                  className="text-lg font-medium"
                >
                  {model.name}
                </Label>
                {renderModelPricing(model)}
              </div>
            </div>
            {isSelected && (
              <div className="mt-4 pl-8">
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
                      type="text"
                      pattern="^[1-9][0-9]*$"
                      value={selectedModel.inputTokens}
                      onChange={(e) =>
                        handleTokenChange(
                          model.id,
                          "input",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full bg-white"
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
                      type="text"
                      pattern="^[1-9][0-9]*$"
                      value={selectedModel.outputTokens}
                      onChange={(e) =>
                        handleTokenChange(
                          model.id,
                          "output",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full bg-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </ScrollArea>
  );
}
