/**
 * メニュー名マッチングロジック
 * スクレイピングしたメニュー名と既存DBのメニュー名を照合
 */

import type {
  ScrapedMenuItem,
  ExistingMenu,
  MatchResult,
  PriceUpdateReport,
} from "./types";

export class MenuMatcher {
  // 手動マッピング辞書（スクレイピング名 → DB名）
  private manualMapping: Record<string, string> = {};

  /**
   * 文字レベルの正規化のみ（サイズ情報は保持）
   * 正規化マッチ（ステップ3）で使用
   * - 全角→半角変換
   * - スペース削除
   * - 括弧の統一
   * - 記号正規化
   */
  normalizeChars(name: string): string {
    return (
      name
        // 全角英数字→半角
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) =>
          String.fromCharCode(s.charCodeAt(0) - 0xfee0)
        )
        // 全角スペース→半角
        .replace(/　/g, " ")
        // 括弧の正規化
        .replace(/（/g, "(")
        .replace(/）/g, ")")
        // 「（単品）」「(単品）」等 → 「単品」（括弧を除去して統一）
        .replace(/[（(]単品[）)]/g, "単品")
        // 表記ゆれ統一: たまご→玉子
        .replace(/たまご/g, "玉子")
        // 残りのスペース削除
        .replace(/\s+/g, "")
        // 波線の統一
        .replace(/[〜～]/g, "~")
        .trim()
    );
  }

  /**
   * メニュー名を正規化（サイズ情報も削除）
   * ファジーマッチ（ステップ4）で使用
   */
  normalize(name: string): string {
    return (
      this.normalizeChars(name)
        // サイズ情報を含む括弧を削除（並盛、大盛、小盛、特盛、あたま大盛、並など）
        .replace(/\([小並大特]盛\)/g, "")
        .replace(/\(あたま[大小]盛\)/g, "")
        .replace(/\(アタマの[大小]盛\)/g, "")
        .replace(/\(並\)/g, "")
    );
  }

  /**
   * スクレイピングした名前+サイズから、DB名の候補を複数生成
   * DB側の命名パターンにバリエーションがあるため
   */
  private generateCandidates(name: string, size: string): string[] {
    // サイズなし → メニュー名そのまま
    if (!size) return [name];

    const candidates: string[] = [];

    // 1. 標準形: メニュー名（サイズ）
    candidates.push(`${name}（${size}）`);

    // 2. 定食系: 「〇〇定食」の「定食」をサイズで置き換える命名パターン
    //    例: カルビ焼肉定食 + 単品 → カルビ焼肉単品
    if (name.endsWith("定食")) {
      const base = name.slice(0, -2);
      candidates.push(`${base}${size}`);
    }

    // 3. 単品固有パターン
    if (size === "単品") {
      candidates.push(`${name}単品`);
      candidates.push(`${name}(単品）`);
    }

    // 4. ダブル→W変換パターン
    //    サイトでは「ダブル」、DBでは「Ｗ定食」「W定食」等
    if (size === "ダブル") {
      if (name.endsWith("定食")) {
        const base = name.slice(0, -2);
        candidates.push(`${base}Ｗ定食`);
        candidates.push(`${base}W定食`);
        candidates.push(`${name}W`);
        candidates.push(`${name}Ｗ`);
      }
    }

    // 5. 生野菜セット系: 「定食」を除いて直結
    //    例: うまトマハンバーグ定食 + 生野菜セット → うまトマハンバーグ生野菜セット
    if (size === "生野菜セット" && name.endsWith("定食")) {
      // base + 生野菜セット は step 2 で既に追加済み
    }

    // 6. サイズ直結パターン（括弧なし）
    //    例: 大判豚肩ロース焼き丼（旨ダレ生姜）+ 並盛 → 大判豚肩ロース焼き丼（旨ダレ生姜）並盛
    candidates.push(`${name}${size}`);

    return candidates;
  }

  /**
   * Levenshtein距離を計算（ファジーマッチ用）
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const m = str1.length;
    const n = str2.length;

    if (m === 0) return n;
    if (n === 0) return m;

    const dp: number[][] = Array(m + 1)
      .fill(null)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // 削除
          dp[i][j - 1] + 1, // 挿入
          dp[i - 1][j - 1] + cost // 置換
        );
      }
    }

    return dp[m][n];
  }

  /**
   * スクレイピングしたアイテムと既存メニューをマッチング
   * 複数の候補名を生成し、それぞれでマッチを試みる
   */
  matchItem(
    scraped: ScrapedMenuItem,
    existingMenus: ExistingMenu[]
  ): MatchResult | null {
    const scrapedName = scraped.name;
    const scrapedSize = scraped.size || "";

    // DB命名パターンに合わせて複数の候補名を生成
    const candidates = this.generateCandidates(scrapedName, scrapedSize);
    const primaryName = candidates[0]; // レポート表示用

    // 1. 手動マッピングをチェック（全候補）
    for (const fullName of candidates) {
      if (this.manualMapping[fullName]) {
        const mapped = this.manualMapping[fullName];
        const menu = existingMenus.find((m) => m.menuName === mapped);
        if (menu) {
          return {
            menuId: menu.menuId,
            menuName: menu.menuName,
            scrapedName: primaryName,
            price: scraped.price,
            confidence: 1.0,
            matchType: "manual",
          };
        }
      }
    }

    // 2. 完全一致（全候補）
    for (const fullName of candidates) {
      const exactMatch = existingMenus.find((m) => m.menuName === fullName);
      if (exactMatch) {
        return {
          menuId: exactMatch.menuId,
          menuName: exactMatch.menuName,
          scrapedName: primaryName,
          price: scraped.price,
          confidence: 1.0,
          matchType: "exact",
        };
      }
    }

    // 3. 正規化後一致（全候補）- 文字正規化のみ（サイズ情報は保持）
    for (const fullName of candidates) {
      const normalizedCandidate = this.normalizeChars(fullName);
      const normalizedMatch = existingMenus.find(
        (m) => this.normalizeChars(m.menuName) === normalizedCandidate
      );
      if (normalizedMatch) {
        return {
          menuId: normalizedMatch.menuId,
          menuName: normalizedMatch.menuName,
          scrapedName: primaryName,
          price: scraped.price,
          confidence: 0.95,
          matchType: "normalized",
        };
      }
    }

    // 4. ファジーマッチ（全候補の中で最も近いもの、Levenshtein距離 <= 3）
    let bestFuzzyMatch: ExistingMenu | null = null;
    let bestDistance = Infinity;

    for (const fullName of candidates) {
      const normalizedCandidate = this.normalize(fullName);
      for (const menu of existingMenus) {
        const normalizedMenu = this.normalize(menu.menuName);
        const distance = this.levenshteinDistance(
          normalizedCandidate,
          normalizedMenu
        );

        if (distance <= 3 && distance < bestDistance) {
          bestDistance = distance;
          bestFuzzyMatch = menu;
        }
      }
    }

    if (bestFuzzyMatch) {
      // 距離に応じてconfidenceを調整（0 → 0.9, 1 → 0.85, 2 → 0.8, 3 → 0.75）
      const confidence = 0.9 - bestDistance * 0.05;
      return {
        menuId: bestFuzzyMatch.menuId,
        menuName: bestFuzzyMatch.menuName,
        scrapedName: primaryName,
        price: scraped.price,
        confidence,
        matchType: "fuzzy",
      };
    }

    // マッチなし
    return null;
  }

  /**
   * 全アイテムをマッチング
   */
  matchAll(
    scrapedItems: ScrapedMenuItem[],
    existingMenus: ExistingMenu[]
  ): PriceUpdateReport {
    const report: PriceUpdateReport = {
      chainId: "",
      updatedAt: new Date().toISOString(),
      totalMatched: 0,
      totalUnmatched: 0,
      totalUpdated: 0,
      matched: [],
      unmatched: [],
    };

    for (const item of scrapedItems) {
      const result = this.matchItem(item, existingMenus);

      if (result) {
        report.matched.push(result);
        report.totalMatched++;
      } else {
        report.unmatched.push(item);
        report.totalUnmatched++;
      }
    }

    return report;
  }

  /**
   * 手動マッピングを追加
   */
  addManualMapping(scrapedName: string, dbName: string): void {
    this.manualMapping[scrapedName] = dbName;
  }

  /**
   * 手動マッピングを一括設定
   */
  setManualMappings(mappings: Record<string, string>): void {
    this.manualMapping = { ...this.manualMapping, ...mappings };
  }
}
