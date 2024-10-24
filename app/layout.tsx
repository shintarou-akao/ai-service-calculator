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
  title: {
    default: "AI Service Calculator - AIサービス料金計算ツール",
    template: "AI Service Calculator - %s",
  },
  description:
    "AIサービスの料金プランやAPIの料金を簡単に計算できるサイト。複数のAIサービスやAPIモデルのプランを選んで、総額を自動的に計算し、共有できます。",
  keywords: ["AI", "AIサービス", "料金計算", "API"],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    // TODO: URLの設定
    title: "AI Service Calculator - AIサービス料金計算ツール",
    description: "AIサービスの料金プランやAPIの料金を簡単に計算できるサイト。",
    siteName: "AI Service Calculator",
    images: [
      {
        url: "/images/og.png",
        width: 1200,
        height: 630,
        alt: "AI Service Calculator OGイメージ",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100 flex flex-col min-h-screen`}
      >
        <ServiceSelectionProvider>
          <Header />
          <main className="flex-grow container mx-auto p-6">{children}</main>
          <Toaster />
          <Footer />
        </ServiceSelectionProvider>
      </body>
    </html>
  );
}
