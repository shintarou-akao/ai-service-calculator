"use client";

export default function Error() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-100 px-4 text-center">
      <div className="-mt-8 sm:-mt-16">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
          問題が発生しました
        </h2>
        <p className="text-sm sm:text-base mb-3 sm:mb-4">
          一時的にアクセスできない状態です。時間を置いて再度お試しください。
        </p>
      </div>
    </div>
  );
}
