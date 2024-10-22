"use client";

export default function Error() {
  return (
    <main className="flex-grow container mx-auto p-6 flex flex-col items-center justify-center">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 text-center">
        エラーが発生しました
      </h1>
      <p className="text-xl text-gray-600 mb-8 text-center">
        申し訳ありませんが、問題が発生しました。時間を置いて再度お試しください。
      </p>
    </main>
  );
}
