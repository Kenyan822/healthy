/**
 * 主要駅データをDBに投入するスクリプト
 *
 * 実行: npx tsx scripts/seed-stations.ts
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { stations } from "../lib/db/schema";
import * as fs from "fs";
import * as path from "path";

interface MajorStation {
  stationId: string;
  stationCd: string;
  stationGCd: string;
  stationName: string;
  stationNameKana: string;
  stationNameEn: string;
  prefecture: string;
  prefCode: number;
  line: string;
  lineCd: number;
  lat: number;
  lng: number;
  address: string;
  passengerCount: number;
  passengerRank: number;
}

interface MajorStationsData {
  updatedAt: string;
  totalCount: number;
  stations: MajorStation[];
}

async function main() {
  const dbPath = path.join(process.cwd(), "data", "chain_restaurant.db");
  const sqlite = new Database(dbPath);
  const db = drizzle(sqlite);

  // major-stations.jsonを読み込み
  const dataPath = path.join(process.cwd(), "data", "major-stations.json");
  if (!fs.existsSync(dataPath)) {
    console.error("major-stations.json not found. Run extract-major-stations.ts first.");
    process.exit(1);
  }

  const data: MajorStationsData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  console.log(`Loading ${data.stations.length} stations...`);

  // stationsテーブルを再作成（既存データを削除）
  console.log("Recreating stations table...");
  sqlite.exec(`
    DROP TABLE IF EXISTS station_chains;
    DROP TABLE IF EXISTS stations;
    CREATE TABLE stations (
      station_id TEXT PRIMARY KEY NOT NULL,
      station_cd TEXT,
      station_g_cd TEXT,
      station_name TEXT NOT NULL,
      station_name_kana TEXT,
      station_name_en TEXT,
      prefecture TEXT NOT NULL,
      pref_code INTEGER,
      line TEXT,
      line_cd INTEGER,
      lat REAL,
      lng REAL,
      address TEXT,
      passenger_count INTEGER,
      passenger_rank INTEGER,
      last_checked_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE station_chains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      station_id TEXT NOT NULL REFERENCES stations(station_id),
      chain_id TEXT NOT NULL REFERENCES chains(chain_id),
      place_id TEXT,
      place_name TEXT,
      place_address TEXT,
      lat REAL,
      lng REAL,
      distance_meters INTEGER,
      rating REAL,
      user_ratings_total INTEGER,
      last_checked_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 駅データを挿入
  let insertedCount = 0;
  let skippedCount = 0;
  const seenIds = new Set<string>();

  for (const station of data.stations) {
    // lat/lngが0の駅はスキップ
    if (station.lat === 0 || station.lng === 0) {
      console.log(`  Skipped (no coordinates): ${station.stationName}`);
      skippedCount++;
      continue;
    }

    // 重複するstationIdは都道府県コードを付けて区別
    let stationId = station.stationId;
    if (seenIds.has(stationId)) {
      stationId = `${stationId}-${station.prefCode}`;
      console.log(`  Renamed duplicate: ${station.stationName} -> ${stationId}`);
    }
    seenIds.add(stationId);

    try {
      db.insert(stations)
        .values({
          stationId: stationId,
          stationCd: station.stationCd || null,
          stationGCd: station.stationGCd || null,
          stationName: station.stationName,
          stationNameKana: station.stationNameKana || null,
          stationNameEn: station.stationNameEn || null,
          prefecture: station.prefecture,
          prefCode: station.prefCode || null,
          line: station.line || null,
          lineCd: station.lineCd || null,
          lat: station.lat,
          lng: station.lng,
          address: station.address || null,
          passengerCount: station.passengerCount,
          passengerRank: station.passengerRank,
          createdAt: new Date().toISOString(),
        })
        .run();
      insertedCount++;
    } catch (error) {
      console.error(`  Error inserting ${station.stationName}:`, error);
    }
  }

  console.log(`\nSeeding completed!`);
  console.log(`  Inserted: ${insertedCount} stations`);
  console.log(`  Skipped: ${skippedCount} stations`);

  // 確認
  const count = sqlite.prepare("SELECT COUNT(*) as count FROM stations").get() as {
    count: number;
  };
  console.log(`  Total in DB: ${count.count} stations`);

  sqlite.close();
}

main().catch(console.error);
