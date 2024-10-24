import React from "react";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "利用規約",
};

export default function TermsOfServicePage() {
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">利用規約</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            この利用規約（以下、「本規約」）は、AI Service
            Calculator（以下、「当サイト」）の利用条件を定めるものです。ユーザーの皆さま（以下、「ユーザー」）には、本規約に従って当サイトをご利用いただきます。
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">1. 適用</h3>
          <p className="mb-4">
            本規約は、ユーザーと当サイトの利用に関わる一切の関係に適用されるものとします。
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">2. 利用登録</h3>
          <p className="mb-4">当サイトは登録なしで利用可能です。</p>

          <h3 className="text-xl font-semibold mt-6 mb-2">3. 禁止事項</h3>
          <p className="mb-4">
            ユーザーは、当サイトの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>
              当サイトのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為
            </li>
            <li>当サイトのサービスの運営を妨害するおそれのある行為</li>
            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
            <li>他のユーザーに成りすます行為</li>
            <li>
              当サイトのサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為
            </li>
            <li>その他、当サイトが不適切と判断する行為</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2">
            4. 当サイトの提供の停止等
          </h3>
          <p className="mb-4">
            当サイトは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく当サイトの全部または一部の提供を停止または中断することができるものとします。
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>
              当サイトにかかるコンピュータシステムの保守点検または更新を行う場合
            </li>
            <li>
              地震、落雷、火災、停電または天災などの不可抗力により、当サイトの提供が困難となった場合
            </li>
            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
            <li>その他、当サイトが停止または中断を必要と判断した場合</li>
          </ul>

          <h3 className="text-xl font-semibold mt-6 mb-2">
            5. 保証の否認および免責事項
          </h3>
          <p className="mb-4">
            当サイトは、当サイトに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">6. 利用規約の変更</h3>
          <p className="mb-4">
            当サイトは、必要と判断した場合には、ユーザーに通知することなくいつでも本規約を変更することができるものとします。
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">
            7. 準拠法・裁判管轄
          </h3>
          <p>
            本規約の解釈にあたっては、日本法を準拠法とします。当サイトに関して紛争が生じた場合には、当サイトの本店所在地を管轄する裁判所を専属的合意管轄とします。
          </p>
        </CardContent>
      </Card>
    </>
  );
}
