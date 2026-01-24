/**
 * 駅×チェーン店の紐づけデータをGoogle Places APIで取得してDBに投入するスクリプト
 *
 * 実行: npx tsx scripts/seed-station-chains.ts
 *
 * 注意: このスクリプトはGoogle Places APIを使用します。
 * 月5000回の無料枠があります。199駅×18チェーン = 3582回で無料枠内です。
 */

import * as dotenv from "dotenv";
import * as path from "path";

// 環境変数を読み込み
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { stations, chains } from "../lib/db/schema";

// Google Places API用の関数を直接定義（環境変数を確実に読み込むため）
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

interface PlacesSearchResult {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  location: { lat: number; lng: number };
  rating?: number;
  userRatingCount?: number;
  distanceMeters: number;
}

function calculateDistanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

interface PlacesApiResponse {
  places?: Array<{
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    location?: { latitude: number; longitude: number };
    rating?: number;
    userRatingCount?: number;
  }>;
  nextPageToken?: string;
}

// チェーン名のマッチング条件（表記揺れ対応）
const CHAIN_MATCH_RULES: Record<string, (name: string) => boolean> = {
  // いきなり！ステーキ → 「いきなり」AND「ステーキ」両方含む
  ikinari: (name) => name.includes("いきなり") && name.includes("ステーキ"),
  // セブン-イレブン → 「セブン」AND「イレブン」両方含む
  seven: (name) => name.includes("セブン") && name.includes("イレブン"),
  // CoCo壱番屋 → 「CoCo」または「壱番屋」を含む
  cocoichi: (name) => name.includes("CoCo") || name.includes("壱番屋"),
  // ローソン → 「ローソン」を含むが「ナチュラルローソン」「ローソンストア100」「ローソン銀行ATM」は除外
  lawson: (name) =>
    name.includes("ローソン") &&
    !name.includes("ナチュラル") &&
    !name.includes("ストア100") &&
    !name.includes("銀行ATM"),
};

// チェーン名が店舗名にマッチするかチェック
function matchesChain(chainId: string, chainName: string, placeName: string): boolean {
  // カスタムルールがあればそれを使用
  if (CHAIN_MATCH_RULES[chainId]) {
    return CHAIN_MATCH_RULES[chainId](placeName);
  }
  // デフォルト: チェーン名が店舗名に含まれているか
  return placeName.includes(chainName);
}

async function searchStationChain(
  stationLat: number,
  stationLng: number,
  chainId: string,
  chainName: string,
  radiusMeters: number = 500
): Promise<{ results: PlacesSearchResult[]; apiCalls: number }> {
  if (!GOOGLE_PLACES_API_KEY) {
    console.warn("GOOGLE_MAPS_API_KEY is not configured");
    return { results: [], apiCalls: 0 };
  }

  const allResults: PlacesSearchResult[] = [];
  let pageToken: string | undefined = undefined;
  let apiCalls = 0;

  try {
    // 最大3ページ（60件）まで取得
    for (let page = 0; page < 3; page++) {
      const requestBody: Record<string, unknown> = {
        textQuery: chainName,
        locationBias: {
          circle: {
            center: { latitude: stationLat, longitude: stationLng },
            radius: radiusMeters,
          },
        },
        languageCode: "ja",
      };

      // 2ページ目以降はpageTokenを追加
      if (pageToken) {
        requestBody.pageToken = pageToken;
      }

      const response = await fetch(
        "https://places.googleapis.com/v1/places:searchText",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
            "X-Goog-FieldMask":
              "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,nextPageToken",
          },
          body: JSON.stringify(requestBody),
        }
      );

      apiCalls++;

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Places API error: ${response.status} - ${errorText}`);
        break;
      }

      const data: PlacesApiResponse = await response.json();

      if (!data.places || data.places.length === 0) {
        break;
      }

      // 結果を処理
      const prevCount = allResults.length;

      for (const place of data.places) {
        const placeName = place.displayName?.text || "";

        // チェーン名が店舗名にマッチするかチェック（表記揺れ対応）
        if (!matchesChain(chainId, chainName, placeName)) {
          continue; // 別のチェーン店はスキップ
        }

        const placeLat = place.location?.latitude || 0;
        const placeLng = place.location?.longitude || 0;
        const distance = calculateDistanceMeters(
          stationLat,
          stationLng,
          placeLat,
          placeLng
        );

        // 半径内のみ追加
        if (distance <= radiusMeters) {
          allResults.push({
            placeId: place.id,
            displayName: placeName,
            formattedAddress: place.formattedAddress || "",
            location: { lat: placeLat, lng: placeLng },
            rating: place.rating,
            userRatingCount: place.userRatingCount,
            distanceMeters: distance,
          });
        }
      }

      // このページで実際に追加された件数（名前マッチ AND 2km圏内）
      const addedThisPage = allResults.length - prevCount;

      // nextPageTokenがなければ終了（これ以上データがない）
      if (!data.nextPageToken) {
        break;
      }

      // 15件以上追加された場合のみ次のページを取得
      if (addedThisPage < 15) {
        break;
      }

      // 次のページがある場合のみ続行
      pageToken = data.nextPageToken;
      await sleep(100); // ページ間で少し待機
    }

    // 距離順でソート
    allResults.sort((a, b) => a.distanceMeters - b.distanceMeters);

    return { results: allResults, apiCalls };
  } catch (error) {
    console.error("Error searching nearby chain:", error);
    return { results: allResults, apiCalls };
  }
}

// API呼び出しの間隔（ミリ秒）- レート制限対策
const API_DELAY_MS = 200;

// 検索半径（メートル）
const SEARCH_RADIUS_METERS = 2000;

// 最大API呼び出し回数（安全マージン）
const MAX_API_CALLS = 4500;

// テストモード: 特定の駅のみ処理
const TEST_MODE = process.argv.includes("--test");
const TEST_STATIONS = ["musashikosugi"];

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const dbPath = path.join(process.cwd(), "data", "chain_restaurant.db");
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  // 全駅を取得
  let allStations = db.select().from(stations).all();
  console.log(`Found ${allStations.length} stations`);

  if (TEST_MODE) {
    allStations = allStations.filter((s) => TEST_STATIONS.includes(s.stationId));
    console.log(`TEST MODE: Processing only ${allStations.length} stations (${TEST_STATIONS.join(", ")})`);
  }

  // 全チェーン店を取得
  const allChains = db.select().from(chains).all();
  console.log(`Found ${allChains.length} chains`);

  let apiCallCount = 0;
  let insertedCount = 0;
  let updatedCount = 0;
  let noResultCount = 0;

  console.log(
    `\nStarting search... (${allStations.length} stations × ${allChains.length} chains = ${allStations.length * allChains.length} combinations)`
  );
  console.log(`Max API calls: ${MAX_API_CALLS}`);
  console.log(`Search radius: ${SEARCH_RADIUS_METERS}m`);
  console.log("");

  for (let i = 0; i < allStations.length; i++) {
    const station = allStations[i];

    if (!station.lat || !station.lng) {
      console.log(`  Skipped ${station.stationName} (no coordinates)`);
      continue;
    }

    console.log(
      `[${i + 1}/${allStations.length}] ${station.stationName}駅 (${station.prefecture})`
    );

    let stationHasResults = false;

    for (const chain of allChains) {
      if (apiCallCount >= MAX_API_CALLS) {
        console.log("\n⚠️ API call limit reached. Stopping...");
        break;
      }

      try {
        // Google Places APIで検索（ページネーション対応）
        const { results, apiCalls } = await searchStationChain(
          station.lat,
          station.lng,
          chain.chainId,
          chain.chainName,
          SEARCH_RADIUS_METERS
        );
        apiCallCount += apiCalls;

        if (results.length === 0) {
          noResultCount++;
          continue;
        }

        // 全店舗をDBに保存（UPSERT: place_idが同じなら更新）
        const now = new Date().toISOString();
        let chainInsertCount = 0;
        let chainUpdateCount = 0;

        for (const place of results) {
          try {
            // まず既存レコードをチェック
            const existing = sqlite
              .prepare("SELECT id FROM station_chains WHERE station_id = ? AND place_id = ?")
              .get(station.stationId, place.placeId) as { id: number } | undefined;

            if (existing) {
              // 既存レコードがあれば更新
              sqlite
                .prepare(
                  `UPDATE station_chains SET
                    chain_id = ?, place_name = ?, place_address = ?, lat = ?, lng = ?,
                    distance_meters = ?, rating = ?, user_ratings_total = ?,
                    last_checked_at = ?, updated_at = ?
                  WHERE id = ?`
                )
                .run(
                  chain.chainId,
                  place.displayName,
                  place.formattedAddress,
                  place.location.lat,
                  place.location.lng,
                  place.distanceMeters,
                  place.rating || null,
                  place.userRatingCount || null,
                  now,
                  now,
                  existing.id
                );
              updatedCount++;
              chainUpdateCount++;
            } else {
              // なければ新規挿入
              sqlite
                .prepare(
                  `INSERT INTO station_chains
                  (station_id, chain_id, place_id, place_name, place_address, lat, lng, distance_meters, rating, user_ratings_total, last_checked_at, created_at, updated_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
                )
                .run(
                  station.stationId,
                  chain.chainId,
                  place.placeId,
                  place.displayName,
                  place.formattedAddress,
                  place.location.lat,
                  place.location.lng,
                  place.distanceMeters,
                  place.rating || null,
                  place.userRatingCount || null,
                  now,
                  now,
                  now
                );
              insertedCount++;
              chainInsertCount++;
            }
          } catch (dbError) {
            console.error(`    ✗ DB error:`, dbError);
          }
        }

        if (chainInsertCount > 0 || chainUpdateCount > 0) {
          stationHasResults = true;
          const nearest = results[0];
          const countInfo = chainUpdateCount > 0
            ? `${chainInsertCount}新規/${chainUpdateCount}更新`
            : `${chainInsertCount}店舗`;
          console.log(
            `    ✓ ${chain.chainName}: ${countInfo} (最短${nearest.distanceMeters}m)${apiCalls > 1 ? ` [${apiCalls}API]` : ""}`
          );
        }
      } catch (error) {
        console.error(`    ✗ ${chain.chainName}: API error`, error);
      }

      // レート制限対策
      await sleep(API_DELAY_MS);
    }

    // 駅の最終チェック日を更新
    if (stationHasResults || apiCallCount > 0) {
      sqlite
        .prepare("UPDATE stations SET last_checked_at = ? WHERE station_id = ?")
        .run(new Date().toISOString(), station.stationId);
    }

    if (apiCallCount >= MAX_API_CALLS) {
      break;
    }
  }

  console.log("\n=== Summary ===");
  console.log(`API calls: ${apiCallCount}`);
  console.log(`Inserted: ${insertedCount} new records`);
  console.log(`Updated: ${updatedCount} existing records`);
  console.log(`No results: ${noResultCount}`);

  // 統計を表示
  const stats = sqlite
    .prepare(
      `SELECT
        COUNT(*) as total,
        COUNT(DISTINCT station_id) as stations,
        COUNT(DISTINCT chain_id) as chains,
        AVG(distance_meters) as avg_distance
      FROM station_chains`
    )
    .get() as {
    total: number;
    stations: number;
    chains: number;
    avg_distance: number;
  };

  console.log(`\nDB Stats:`);
  console.log(`  Total pairs: ${stats.total}`);
  console.log(`  Stations with chains: ${stats.stations}`);
  console.log(`  Chains found: ${stats.chains}`);
  console.log(`  Average distance: ${Math.round(stats.avg_distance)}m`);

  sqlite.close();
}

main().catch(console.error);
