import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getStationById,
  getAllStationIds,
  getAllStations,
  getAllChains,
} from "@/lib/db/queries";
import { purposes, allPurposeIds } from "@/lib/filters";

// Google Maps Embed コンポーネント
function GoogleMapEmbed({ lat, lng, stationName }: { lat: number; lng: number; stationName: string }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || !lat || !lng) {
    return (
      <div className="w-full h-[300px] bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center">
        <p className="text-foreground/50">地図を読み込めませんでした</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-xl overflow-hidden border border-border">
      <iframe
        width="100%"
        height="300"
        style={{ border: 0 }}
        loading="lazy"
        allowFullScreen
        referrerPolicy="no-referrer-when-downgrade"
        src={`https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${lat},${lng}&zoom=15&language=ja`}
        title={`${stationName}駅周辺の地図`}
      />
    </div>
  );
}

type Props = {
  params: Promise<{ station: string }>;
};

// 静的パス生成
export async function generateStaticParams() {
  const stationIds = await getAllStationIds();
  return stationIds.map((stationId) => ({ station: stationId }));
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { station } = await params;
  const stationData = await getStationById(station);

  if (!stationData) {
    return { title: "駅が見つかりません" };
  }

  const title = `${stationData.stationName}駅周辺のランチ・外食チェーン`;
  const description = `${stationData.stationName}駅（${stationData.prefecture}）周辺の外食チェーン店を紹介。栄養成分・カロリー・価格でメニューを比較できます。`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    alternates: { canonical: `/area/${station}` },
  };
}

// 距離をフォーマット
function formatDistance(meters: number | null): string {
  if (!meters) return "-";
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export default async function StationPage({ params }: Props) {
  const { station } = await params;
  const stationData = await getStationById(station);

  if (!stationData) {
    notFound();
  }

  // Places APIのキャッシュデータは規約上30日でリフレッシュが必要なため表示に使わない。
  // 店舗の実在確認はGoogleマップへの検索リンクに委ねる(維持費・規約リスクゼロ)
  const allChains = await getAllChains();
  const allStations = await getAllStations(200);

  // 同じ都道府県の他の駅
  const samePrefeStations = allStations
    .filter(
      (s) =>
        s.prefecture === stationData.prefecture && s.stationId !== station
    )
    .slice(0, 10);

  // 他の都道府県の主要駅
  const otherStations = allStations
    .filter((s) => s.prefecture !== stationData.prefecture)
    .slice(0, 10);

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
            {stationData.stationName}駅周辺の外食チェーン
          </h1>
          <p className="text-lg text-foreground/70 mt-2">
            {stationData.prefecture}｜{stationData.line || ""}
          </p>

        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 地図セクション */}
        {stationData.lat && stationData.lng && (
          <section className="mb-8">
            <h2 className="text-xl font-bold mb-4">
              {stationData.stationName}駅周辺マップ
            </h2>
            <GoogleMapEmbed
              lat={stationData.lat}
              lng={stationData.lng}
              stationName={stationData.stationName}
            />
            <p className="text-xs text-foreground/50 mt-2">
              ※店舗情報は Google Maps を参照しています
            </p>
          </section>
        )}

        {/* チェーン×マップ検索 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">
            {stationData.stationName}駅周辺でチェーン店を探す
          </h2>
          <p className="text-sm text-foreground/60 mb-4">
            「マップで探す」をタップすると、Googleマップで{stationData.stationName}駅周辺の店舗を検索します。
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allChains.map((chain) => (
              <div
                key={chain.chainId}
                className="bg-card-bg rounded-xl border border-border p-4"
              >
                <p className="font-bold text-lg text-foreground">
                  {chain.chainName}
                </p>
                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Link
                    href={`/${chain.chainId}`}
                    className="flex-1 text-center text-sm py-2 px-3 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    メニューを見る
                  </Link>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${chain.chainName} ${stationData.stationName}駅`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center text-sm py-2 px-3 bg-zinc-100 dark:bg-zinc-800 text-foreground/70 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  >
                    マップで探す →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 目的別リンク */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">目的別に探す</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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

        {/* 同じ都道府県の駅 */}
        {samePrefeStations.length > 0 && (
          <section className="mt-8 pt-8 border-t border-border">
            <h2 className="text-xl font-bold mb-4">
              {stationData.prefecture}の他の駅
            </h2>
            <div className="flex flex-wrap gap-2">
              {samePrefeStations.map((s) => (
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
        )}

        {/* 他の都道府県の主要駅 */}
        {otherStations.length > 0 && (
          <section className="mt-8 pt-8 border-t border-border">
            <h2 className="text-xl font-bold mb-4">他のエリアの主要駅</h2>
            <div className="flex flex-wrap gap-2">
              {otherStations.map((s) => (
                <Link
                  key={s.stationId}
                  href={`/area/${s.stationId}`}
                  className="px-4 py-2 bg-card-bg rounded-lg border border-border hover:border-primary transition-colors text-sm"
                >
                  {s.stationName}（{s.prefecture}）
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
