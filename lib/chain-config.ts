/**
 * 有効なチェーン店の設定
 *
 * アプリで表示・利用するチェーンをここで管理します。
 * コメントアウトまたは削除するだけでそのチェーンを無効化できます。
 */
export const ENABLED_CHAINS: ReadonlySet<string> = new Set([
  "ootoya",      // 大戸屋
  "yayoiken",    // やよい軒
  "sukiya",      // すき家
  "matsuya",     // 松屋
  "yoshinoya",   // 吉野家
  // "saizeriya",   // サイゼリヤ
  "cocoichi",    // CoCo壱番屋
  "nakau",       // なか卯
  // "seven",       // セブン-イレブン
  // "familymart",  // ファミリーマート
  // "lawson",      // ローソン
  "ringerhut",   // リンガーハット
  "marugame",    // 丸亀製麺
  // "gusto",       // ガスト
  // "sushiro",     // スシロー
  "mos",         // モスバーガー
  "subway",      // サブウェイ
  "ikinari",     // いきなり！ステーキ
]);

/** チェーンが有効かどうかを判定 */
export function isChainEnabled(chainId: string): boolean {
  return ENABLED_CHAINS.has(chainId);
}
