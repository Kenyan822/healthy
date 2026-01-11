import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-4">
          ページが見つかりません
        </h2>
        <p className="text-foreground/70 mb-8 max-w-md mx-auto">
          お探しのページは存在しないか、移動した可能性があります。
          URLをご確認いただくか、トップページからお探しください。
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          トップページへ
        </Link>
      </div>
    </main>
  );
}
