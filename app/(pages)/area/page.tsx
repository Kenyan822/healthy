import { Metadata } from "next";
import Link from "next/link";
import {
  getAllStations,
} from "@/lib/db/queries";
import type { StationSelect } from "@/lib/db/schema";

export const metadata: Metadata = {
  title: "駅から探す",
  description:
    "全国199駅の主要駅周辺のチェーン店を探せます。渋谷、新宿、梅田、名古屋など人気エリアの外食チェーンをチェック。",
  alternates: { canonical: "/area" },
};

// 都道府県ごとにグループ化
function groupByPrefecture(
  stations: StationSelect[]
): Record<string, StationSelect[]> {
  const grouped: Record<string, StationSelect[]> = {};

  for (const station of stations) {
    if (!grouped[station.prefecture]) {
      grouped[station.prefecture] = [];
    }
    grouped[station.prefecture].push(station);
  }

  return grouped;
}

export default function AreaPage() {
  const allStations = getAllStations(200);
  const stationsByPrefecture = groupByPrefecture(allStations);
  // 人気駅（乗降客数トップ10）
  const popularStations = allStations.slice(0, 10);

  // 地方ごとの並び順
  const regionOrder: Record<string, number> = {
    北海道: 1,
    青森県: 2,
    岩手県: 3,
    宮城県: 4,
    秋田県: 5,
    山形県: 6,
    福島県: 7,
    茨城県: 8,
    栃木県: 9,
    群馬県: 10,
    埼玉県: 11,
    千葉県: 12,
    東京都: 13,
    神奈川県: 14,
    新潟県: 15,
    富山県: 16,
    石川県: 17,
    福井県: 18,
    山梨県: 19,
    長野県: 20,
    岐阜県: 21,
    静岡県: 22,
    愛知県: 23,
    三重県: 24,
    滋賀県: 25,
    京都府: 26,
    大阪府: 27,
    兵庫県: 28,
    奈良県: 29,
    和歌山県: 30,
    鳥取県: 31,
    島根県: 32,
    岡山県: 33,
    広島県: 34,
    山口県: 35,
    徳島県: 36,
    香川県: 37,
    愛媛県: 38,
    高知県: 39,
    福岡県: 40,
    佐賀県: 41,
    長崎県: 42,
    熊本県: 43,
    大分県: 44,
    宮崎県: 45,
    鹿児島県: 46,
    沖縄県: 47,
  };

  const sortedPrefectures = Object.keys(stationsByPrefecture).sort(
    (a, b) => (regionOrder[a] || 99) - (regionOrder[b] || 99)
  );

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            駅から探す
          </h1>
          <p className="text-lg text-foreground/70">
            全国199の主要駅周辺のチェーン店を探せます
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* 人気の駅 */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            人気の駅（乗降客数トップ10）
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {popularStations.map((station, index) => {
              return (
                <Link
                  key={station.stationId}
                  href={`/area/${station.stationId}`}
                  className="group relative overflow-hidden bg-gradient-to-br from-white to-blue-50 dark:from-zinc-800 dark:to-blue-950/30 rounded-2xl p-6 border border-blue-100 dark:border-blue-900/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="absolute top-2 left-2 text-xs font-bold text-primary/60">
                    #{index + 1}
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                      {station.stationName}
                    </p>
                    <p className="text-xs text-foreground/50 mt-1">
                      {station.prefecture}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* 都道府県別 */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            都道府県から探す
          </h2>

          <div className="space-y-8">
            {sortedPrefectures.map((prefecture) => (
              <div
                key={prefecture}
                className="bg-card-bg rounded-2xl border border-border p-6"
              >
                <h3 className="font-bold text-lg mb-4 text-foreground flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary" />
                  {prefecture}
                  <span className="text-sm font-normal text-foreground/50">
                    ({stationsByPrefecture[prefecture].length}駅)
                  </span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {stationsByPrefecture[prefecture].map((station) => {
                    return (
                      <Link
                        key={station.stationId}
                        href={`/area/${station.stationId}`}
                        className="px-4 py-2 bg-background rounded-lg border border-border hover:border-primary hover:text-primary transition-colors text-sm font-medium"
                      >
                        {station.stationName}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 説明 */}
        <section className="mt-12 p-6 bg-zinc-100 dark:bg-zinc-800/50 rounded-2xl">
          <h2 className="font-bold text-lg mb-3">駅から探すとは？</h2>
          <p className="text-foreground/70 text-sm leading-relaxed">
            お出かけ先や通勤・通学の途中で、チェーン店のメニューを栄養成分で比較できます。
            各駅のページでは、駅から徒歩2km圏内のチェーン店と距離を表示しています。
            高タンパク、低糖質、低カロリーなど、目的に合わせたメニュー選びにお役立てください。
          </p>
        </section>
      </div>
    </main>
  );
}
