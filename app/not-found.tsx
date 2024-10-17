import Link from "next/link";
import { Header } from "@/components/layout/header/Header";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow container mx-auto p-6 flex flex-col items-center justify-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 text-center">
          404 - ページが見つかりません
        </h1>
        <p className="text-xl text-gray-600 mb-8 text-center">
          お探しのページは存在しないか、移動した可能性があります。
        </p>
        <Button asChild className="px-6 py-3 text-lg">
          <Link href="/">ホームに戻る</Link>
        </Button>
      </main>
    </div>
  );
}
