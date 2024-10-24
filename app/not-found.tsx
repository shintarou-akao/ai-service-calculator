import Link from "next/link";
import { Metadata } from "next";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "ページが見つかりません",
};

export default function NotFound() {
  return (
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
  );
}
