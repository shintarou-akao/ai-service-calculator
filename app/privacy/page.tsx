import React from "react";
import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl">プライバシーポリシー</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            AI Service
            Calculator（以下、「当サイト」）は、ユーザーのプライバシーを尊重し、個人情報の保護に努めます。本プライバシーポリシーでは、当サイトの個人情報の取り扱いについて説明します。
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">1. 収集する情報</h3>
          <p className="mb-4">
            当サイトでは、ユーザーが自主的に入力した情報のみを収集します。これには、選択したAIサービス、プラン、使用量などが含まれます。個人を特定できる情報は収集しません。
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">2. 情報の利用目的</h3>
          <p className="mb-4">
            収集した情報は、AIサービスの料金計算と比較のためにのみ使用されます。ユーザーの同意なしに、この目的以外で情報を使用することはありません。
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">3. 情報の共有</h3>
          <p className="mb-4">
            当サイトは、ユーザーの情報を第三者と共有することはありません。ただし、法的要請がある場合はこの限りではありません。
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">4. データの保護</h3>
          <p className="mb-4">
            当サイトは、収集した情報を保護するために適切な技術的・組織的措置を講じています。ただし、インターネット上の送信方法や電子的な保存方法は100%安全ではないため、絶対的な安全性を保証するものではありません。
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">5. Cookieの使用</h3>
          <p className="mb-4">
            当サイトでは、ユーザーエクスペリエンスの向上のためにCookieを使用する場合があります。ユーザーはブラウザの設定でCookieを無効にすることができます。
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">
            6. プライバシーポリシーの変更
          </h3>
          <p className="mb-4">
            当サイトは、必要に応じてプライバシーポリシーを変更することがあります。重要な変更がある場合は、サイト上で通知します。
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-2">7. お問い合わせ</h3>
          <p>
            プライバシーポリシーに関するご質問やご意見がある場合は、下記までお問い合わせください。
            <br />
            <a
              href="https://x.com/shintaro1758"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              @shintaro1758
            </a>
          </p>
        </CardContent>
      </Card>
    </>
  );
}
