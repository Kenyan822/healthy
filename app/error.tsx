"use client";

import Link from "next/link";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-primary mb-4">500</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          エラーが発生しました
        </h2>
        <p className="text-foreground/70 mb-8 max-w-md mx-auto">
          申し訳ありません。予期しないエラーが発生しました。
          しばらくしてからもう一度お試しください。
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => reset()}
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
          >
            もう一度試す
          </button>
          <Link
            href="/"
            className="inline-block px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors font-medium"
          >
            トップページへ
          </Link>
        </div>
      </div>
    </main>
  );
}
