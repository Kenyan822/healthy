import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { tokyoStations, stationIds } from "@/lib/db/stations-data";
import { getAllChains } from "@/lib/db/queries";
import { purposes, allPurposeIds } from "@/lib/filters";

type Props = {
  params: Promise<{ station: string }>;
};

// 静的パス生成
export async function generateStaticParams() {
  return stationIds.map((stationId) => ({ station: stationId }));
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { station } = await params;
  const stationData = tokyoStations.find((s) => s.stationId === station);

  if (!stationData) {
    return { title: "駅が見つかりません" };
  }

  const title = `${stationData.stationName}駅周辺のヘルシーランチ・外食チェーン`;
  const description = `${stationData.stationName}駅周辺で食べられるヘルシーな外食チェーン店を紹介。ダイエット・筋トレ・健康維持に最適なメニューを探せます。`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
  };
}

export default async function StationPage({ params }: Props) {
  const { station } = await params;
  const stationData = tokyoStations.find((s) => s.stationId === station);

  if (!stationData) {
    notFound();
  }

  const chains = getAllChains();

  return (
    <main className="min-h-screen bg-background">
      {/* ヒーローセクション */}
      <section className="bg-gradient-to-br from-primary/10 to-accent/10 py-12">
        <div className="container mx-auto px-4">
          <nav className="mb-4 text-sm">
            <ol className="flex items-center gap-2 text-foreground/60">
              <li>
                <Link href="/" className="hover:text-primary">
                  ホーム
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/area" className="hover:text-primary">
                  エリア
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{stationData.stationName}</li>
            </ol>
          </nav>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            {stationData.stationName}駅周辺のヘルシー外食
          </h1>
          <p className="text-lg text-foreground/70 mt-2">
            {stationData.line}｜ヘルシーなランチ・ディナーを探す
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 準備中メッセージ */}
        <section className="mb-12 p-8 bg-card-bg rounded-xl border border-border text-center">
          <p className="text-xl font-bold text-foreground mb-2">
            このページは準備中です
          </p>
          <p className="text-foreground/70">
            {stationData.stationName}駅周辺の店舗情報は近日公開予定です。
          </p>
        </section>

        {/* 目的別リンク */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">目的別に探す</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {allPurposeIds.map((purposeId) => {
              const purpose = purposes[purposeId];
              return (
                <Link
                  key={purposeId}
                  href={`/ranking/${purposeId}`}
                  className="bg-card-bg rounded-xl border border-border p-4 hover:border-primary transition-colors text-center"
                >
                  <p className="font-bold text-foreground">{purpose.name}</p>
                  <p className="text-xs text-foreground/60 mt-1">
                    全国ランキング
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* チェーン店リンク */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">チェーン店から探す</h2>
          <div className="flex flex-wrap gap-2">
            {chains.map((chain) => (
              <Link
                key={chain.chainId}
                href={`/${chain.chainId}`}
                className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
              >
                {chain.chainName}
              </Link>
            ))}
          </div>
        </section>

        {/* 他の駅リンク */}
        <section className="mt-8 pt-8 border-t border-border">
          <h2 className="text-xl font-bold mb-4">他の駅を探す</h2>
          <div className="flex flex-wrap gap-2">
            {tokyoStations
              .filter((s) => s.stationId !== station)
              .slice(0, 10)
              .map((s) => (
                <Link
                  key={s.stationId}
                  href={`/area/${s.stationId}`}
                  className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
                >
                  {s.stationName}
                </Link>
              ))}
          </div>
        </section>
      </div>
    </main>
  );
}
