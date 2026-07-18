/**
 * 定期バッチ: 全チェーンのスクレイプ→seed→レポート生成
 *
 * 実行:
 *   npm run batch:update                    # 全チェーン
 *   npm run batch:update -- --only=matsuya,subway   # 対象を絞る
 *   npm run batch:update -- --concurrency=1         # 並行度(既定3、サイトごとには常に直列)
 *   npm run batch:update -- --sync                  # 完了後にTurso本番同期まで実行
 *
 * 設計:
 * - スクレイパーは --yes 付きで非対話実行。失敗してもチェーン単位で隔離し他を続行
 * - seedは価格履歴(price_history)を自動記録する共通ランナー経由
 * - レポートを data/reports/batch-YYYYMMDD-HHmm.json に保存
 * - 1件でも失敗があれば exit 1（cron/launchdの失敗検知用）
 */

import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

interface ChainJob {
  chain: string;
  scrapeScript: string; // scripts/scrape/ 配下
  seedScript: string; // scripts/ 配下
}

// KFCは栄養PDF+SPA価格のため半自動（このバッチ対象外。docs/scraping-ops.md参照）
const JOBS: ChainJob[] = [
  { chain: "matsuya", scrapeScript: "matsuya-prices.ts", seedScript: "seed-matsuya.ts" },
  { chain: "yoshinoya", scrapeScript: "yoshinoya-prices.ts", seedScript: "seed-yoshinoya.ts" },
  { chain: "sukiya", scrapeScript: "sukiya-prices.ts", seedScript: "seed-sukiya.ts" },
  { chain: "nakau", scrapeScript: "nakau-prices.ts", seedScript: "seed-nakau.ts" },
  { chain: "cocoichi", scrapeScript: "cocoichi-prices.ts", seedScript: "seed-cocoichi.ts" },
  { chain: "ikinari", scrapeScript: "ikinari-prices.ts", seedScript: "seed-ikinari.ts" },
  { chain: "ringerhut", scrapeScript: "ringerhut-prices.ts", seedScript: "seed-ringerhut.ts" },
  { chain: "yayoiken", scrapeScript: "yayoiken.ts", seedScript: "seed-yayoiken.ts" },
  { chain: "ootoya", scrapeScript: "ootoya.ts", seedScript: "seed-ootoya.ts" },
  { chain: "subway", scrapeScript: "subway.ts", seedScript: "seed-subway.ts" },
  { chain: "mcdonalds", scrapeScript: "mcdonalds.ts", seedScript: "seed-mcdonalds.ts" },
  { chain: "lawson", scrapeScript: "lawson.ts", seedScript: "seed-lawson.ts" },
  { chain: "familymart", scrapeScript: "familymart.ts", seedScript: "seed-familymart.ts" },
  { chain: "seven", scrapeScript: "seveneleven.ts", seedScript: "seed-seven.ts" },
];

interface JobResult {
  chain: string;
  scrapeOk: boolean;
  seedOk: boolean;
  newMenus: number | null;
  priceChanges: number | null;
  durationSec: number;
  error?: string;
}

function parseArg(name: string): string | null {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split("=")[1] : null;
}

function run(
  cmd: string,
  args: string[]
): Promise<{ code: number; output: string }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args, { cwd: process.cwd() });
    let output = "";
    child.stdout.on("data", (d) => (output += d.toString()));
    child.stderr.on("data", (d) => (output += d.toString()));
    child.on("close", (code) => resolve({ code: code ?? 1, output }));
  });
}

async function processChain(job: ChainJob): Promise<JobResult> {
  const start = Date.now();
  const result: JobResult = {
    chain: job.chain,
    scrapeOk: false,
    seedOk: false,
    newMenus: null,
    priceChanges: null,
    durationSec: 0,
  };

  // 1. スクレイプ（非対話）
  const scrape = await run("npx", [
    "tsx",
    `scripts/scrape/${job.scrapeScript}`,
    "--yes",
  ]);
  result.scrapeOk = scrape.code === 0;
  if (!result.scrapeOk) {
    result.error = `scrape failed (exit ${scrape.code}): ${scrape.output.slice(-300)}`;
    result.durationSec = Math.round((Date.now() - start) / 1000);
    return result;
  }

  // 2. seed（価格履歴の記録込み）
  const seed = await run("npx", ["tsx", `scripts/${job.seedScript}`]);
  result.seedOk = seed.code === 0;
  if (!result.seedOk) {
    result.error = `seed failed (exit ${seed.code}): ${seed.output.slice(-300)}`;
  } else {
    const m = seed.output.match(/新規(\d+)件 \/ 価格変更(\d+)件/);
    if (m) {
      result.newMenus = parseInt(m[1], 10);
      result.priceChanges = parseInt(m[2], 10);
    }
  }

  result.durationSec = Math.round((Date.now() - start) / 1000);
  return result;
}

async function main() {
  const only = parseArg("only")?.split(",");
  const concurrency = parseInt(parseArg("concurrency") ?? "3", 10);
  const doSync = process.argv.includes("--sync");

  const jobs = only ? JOBS.filter((j) => only.includes(j.chain)) : JOBS;
  console.log(
    `🚀 バッチ開始: ${jobs.length}チェーン / 並行度${concurrency}${doSync ? " / 完了後にTurso同期" : ""}\n`
  );

  // 並行度制御つきワーカープール（サイトごとには直列＝礼儀正しいアクセス）
  const results: JobResult[] = [];
  const queue = [...jobs];
  async function worker() {
    while (queue.length > 0) {
      const job = queue.shift();
      if (!job) break;
      console.log(`▶ ${job.chain} 開始`);
      const r = await processChain(job);
      const status = r.seedOk
        ? `✅ 新規${r.newMenus ?? "?"} / 価格変更${r.priceChanges ?? "?"}`
        : `❌ ${r.error?.split("\n")[0]?.slice(0, 80)}`;
      console.log(`  ${job.chain}: ${status} (${r.durationSec}秒)`);
      results.push(r);
    }
  }
  await Promise.all(
    Array.from({ length: Math.max(1, concurrency) }, () => worker())
  );

  // レポート保存
  const failed = results.filter((r) => !r.seedOk);
  const report = {
    ranAt: new Date().toISOString(),
    total: results.length,
    succeeded: results.length - failed.length,
    failed: failed.length,
    totalPriceChanges: results.reduce((s, r) => s + (r.priceChanges ?? 0), 0),
    totalNewMenus: results.reduce((s, r) => s + (r.newMenus ?? 0), 0),
    results,
  };
  const reportDir = path.join(process.cwd(), "data", "reports");
  fs.mkdirSync(reportDir, { recursive: true });
  const stamp = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .slice(0, 13)
    .replace("T", "-");
  const reportPath = path.join(reportDir, `batch-${stamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(
    `\n📊 完了: 成功${report.succeeded}/${report.total} / 価格変更${report.totalPriceChanges}件 / 新規${report.totalNewMenus}件`
  );
  console.log(`📄 レポート: ${reportPath}`);
  if (failed.length > 0) {
    console.error(`\n❌ 失敗チェーン: ${failed.map((f) => f.chain).join(", ")}`);
  }

  // 3. Turso同期（明示フラグ時のみ。本番データ変更のため既定OFF）
  if (doSync && failed.length === 0) {
    console.log("\n🔄 Turso本番同期...");
    const sync = await run("npx", [
      "tsx",
      "scripts/sync-to-turso.ts",
      "--confirm",
    ]);
    console.log(sync.output.slice(-500));
    if (sync.code !== 0) process.exit(1);
  } else if (doSync) {
    console.error("⚠️ 失敗チェーンがあるためTurso同期はスキップしました");
  }

  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
