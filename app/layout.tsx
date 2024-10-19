import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ServiceSelectionProvider } from "@/contexts/ServiceSelectionContext";
import { Header } from "@/components/layout/header/Header";
import { Toaster } from "@/components/ui/toaster";
import { Footer } from "@/components/layout/footer/Footer";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "AI Service Calculator",
  description:
    "AIサービスの料金プランやAPIの料金を簡単に計算できるWebアプリケーション。複数のAIサービスやAPIモデルのプランを選んで、総額を自動的に計算・比較できます。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ServiceSelectionProvider>
          <div className="flex flex-col min-h-screen bg-gray-100">
            <Header />
            {children}
            <Toaster />
            <Footer />
          </div>
        </ServiceSelectionProvider>
      </body>
    </html>
  );
}
