/**
 * スクレイパー基盤クラス
 * サーバー負荷対策として、レート制限とバッチ処理を実装
 */

import axios, { AxiosError } from "axios";
import { load, type CheerioAPI } from "cheerio";
import type { ScraperConfig, ScrapedMenuItem, ScrapeResult } from "./types";

export abstract class BaseScraper {
  protected config: ScraperConfig;

  constructor(config: ScraperConfig) {
    this.config = config;
  }

  /**
   * 指定時間待機
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * レート制限付きfetch（リトライ対応）
   */
  protected async fetchWithRetry(url: string): Promise<CheerioAPI> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        console.log(`  Fetching: ${url} (attempt ${attempt})`);

        const response = await axios.get(url, {
          timeout: this.config.timeout,
          headers: {
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
          },
        });

        return load(response.data);
      } catch (error) {
        lastError = error as Error;

        if (axios.isAxiosError(error)) {
          const axiosError = error as AxiosError;
          if (axiosError.code === "ECONNABORTED") {
            console.error(`  Timeout: ${url}`);
          } else if (axiosError.response?.status === 404) {
            console.error(`  Page not found: ${url}`);
            throw error; // 404はリトライしない
          } else if (axiosError.response?.status === 429) {
            console.error(`  Rate limited, waiting longer...`);
            await this.sleep(30000); // 30秒待機
          }
        }

        if (attempt < this.config.maxRetries) {
          const backoff = Math.pow(2, attempt) * 5000; // 指数バックオフ: 10s, 20s, 40s...
          console.log(`  Retrying in ${backoff / 1000}s...`);
          await this.sleep(backoff);
        }
      }
    }

    throw lastError || new Error(`Failed to fetch: ${url}`);
  }

  /**
   * カテゴリページをスクレイピング（サブクラスで実装）
   */
  abstract scrapeCategory(category: string): Promise<ScrapedMenuItem[]>;

  /**
   * 全カテゴリをスクレイピング
   */
  async scrapeAll(): Promise<ScrapeResult> {
    const result: ScrapeResult = {
      chainId: this.config.chainId,
      scrapedAt: new Date().toISOString(),
      totalScraped: 0,
      categories: [],
      items: [],
      errors: [],
    };

    console.log(`\n=== ${this.config.chainId} Price Scraping ===`);
    console.log(`Categories: ${this.config.categories.length}`);
    console.log(
      `Rate limit: ${this.config.rateLimit}ms between requests, ${this.config.batchDelay}ms every ${this.config.batchSize} items\n`
    );

    let itemCount = 0;

    for (let i = 0; i < this.config.categories.length; i++) {
      const category = this.config.categories[i];

      try {
        console.log(
          `[${i + 1}/${this.config.categories.length}] Scraping: ${category}`
        );

        const items = await this.scrapeCategory(category);

        result.categories.push({
          name: category,
          count: items.length,
        });

        result.items.push(...items);
        itemCount += items.length;

        console.log(`  Found ${items.length} items`);

        // バッチ処理: 10件ごとに長めの待機
        if (itemCount >= this.config.batchSize) {
          console.log(
            `  Batch limit reached, waiting ${this.config.batchDelay / 1000}s...`
          );
          await this.sleep(this.config.batchDelay);
          itemCount = 0;
        }

        // 通常のレート制限
        if (i < this.config.categories.length - 1) {
          await this.sleep(this.config.rateLimit);
        }
      } catch (error) {
        const errorMsg = `Failed to scrape ${category}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(`  ERROR: ${errorMsg}`);
        result.errors.push(errorMsg);
      }
    }

    result.totalScraped = result.items.length;

    console.log(`\n=== Scraping Complete ===`);
    console.log(`Total items: ${result.totalScraped}`);
    console.log(`Errors: ${result.errors.length}`);

    return result;
  }
}
