import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AboutPage() {
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">
            AI Service Calculatorについて
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              AI Service
              Calculatorは、様々なAIサービスの料金プランやAPIの利用料金のざっくりとした見積もりを行うことができるWebアプリケーションです。
            </p>
            <p className="text-sm text-gray-600">
              ※実際の料金は各サービスの公式サイトで確認することをお勧めします。
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">主な機能</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>複数のAIサービスの料金プランを比較</li>
            <li>APIモデルの使用量に基づいた料金計算</li>
            <li>月額・年額プランの選択と数量指定</li>
            <li>総額の自動計算と内訳の表示</li>
            <li>選択した内容の共有機能</li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
