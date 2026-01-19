import { Metadata } from "next";
import Link from "next/link";
import { tokyoStations, Station } from "@/lib/db/stations-data";

export const metadata: Metadata = {
  title: "駅から探す｜ヘルシー検索",
  description:
    "東京の主要駅周辺でヘルシーなチェーン店を探せます。渋谷、新宿、池袋など人気エリアの健康的な外食スポットをチェック。",
};

// 路線ごとにグループ化
function groupByLine(stations: readonly Station[]): Record<string, Station[]> {
  const grouped: Record<string, Station[]> = {};

  for (const station of stations) {
    if (!grouped[station.line]) {
      grouped[station.line] = [];
    }
    grouped[station.line].push(station);
  }

  return grouped;
}

export default function AreaPage() {
  const stationsByLine = groupByLine(tokyoStations);
  const lines = Object.keys(stationsByLine);

  // 人気駅（上位表示）
  const popularStationIds = [
    "shibuya",
    "shinjuku",
    "ikebukuro",
    "tokyo",
    "shinagawa",
    "ueno",
  ];
  const popularStations = tokyoStations.filter((s) =>
    popularStationIds.includes(s.stationId)
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            🚃 駅から探す
          </h1>
          <p className="text-lg text-foreground/70">
            東京の主要駅周辺でヘルシーなチェーン店を探せます
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 人気の駅 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-3xl">⭐</span>
            人気の駅
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularStations.map((station) => (
              <Link
                key={station.stationId}
                href={`/area/${station.stationId}`}
                className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-zinc-800 dark:to-blue-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div className="text-center">
                  <p className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                    {station.stationName}
                  </p>
                  <p className="text-xs text-foreground/50 mt-1">
                    {station.stationNameEn}
                  </p>
                </div>
                <div className="absolute -bottom-2 -right-2 text-6xl opacity-10 group-hover:opacity-20 transition-opacity">
                  🚉
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 路線別 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-3xl">🚃</span>
            路線から探す
          </h2>

          <div className="space-y-8">
            {lines.map((line) => (
              <div
                key={line}
                className="bg-card-bg rounded-2xl border border-border p-6"
              >
                <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      line.includes("山手")
                        ? "bg-green-500"
                        : line.includes("メトロ")
                          ? "bg-yellow-500"
                          : "bg-blue-500"
                    }`}
                  />
                  {line}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {stationsByLine[line].map((station) => (
                    <Link
                      key={station.stationId}
                      href={`/area/${station.stationId}`}
                      className="px-4 py-2 bg-background rounded-lg border border-border hover:border-primary hover:text-primary transition-colors text-sm font-medium"
                    >
                      {station.stationName}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 説明 */}
        <section className="mt-12 p-6 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl">
          <h2 className="font-bold text-lg mb-3">駅から探すとは？</h2>
          <p className="text-foreground/70 text-sm leading-relaxed">
            お出かけ先や通勤・通学の途中で、ヘルシーな食事ができるチェーン店を探せます。
            各駅のページでは、周辺のチェーン店と、そのお店で食べられる健康的なメニューをまとめて紹介しています。
            高タンパク、低糖質、ダイエット向けなど、目的に合わせたメニュー選びにお役立てください。
          </p>
        </section>
      </div>
    </main>
  );
}
