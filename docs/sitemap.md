# サイトマップ・ページ構成設計書

## 1. 概要

本ドキュメントでは、チェーン店ヘルシー検索サイトのページ構成、URL設計、およびサイトマップ生成ロジックを定義する。

---

## 2. ページタイプ一覧

### 2.1 ページタイプ概要

| タイプ | 説明 | URL例 | 優先度 |
|--------|------|-------|--------|
| トップページ | サイトのエントリーポイント | `/` | 1.0 |
| チェーン店×目的 | チェーン店の目的別ランキング | `/大戸屋/高タンパク` | 0.8 |
| 駅×条件 | 駅周辺のチェーン店ガイド | `/渋谷駅/高タンパク-ランチ` | 0.7 |
| メニュー詳細 | 個別メニューの詳細情報 | `/menu/ootoya-chicken-kaasan` | 0.6 |
| 組み合わせ提案 | 栄養素目標の組み合わせ | `/combination/protein/30g` | 0.6 |
| チェーン店一覧 | チェーン店の一覧ページ | `/chains` | 0.5 |
| 駅一覧 | 駅の一覧ページ | `/stations` | 0.5 |

---

## 3. URL設計

### 3.1 URL設計方針

1. **日本語URLを許容**: SEOの観点から、検索キーワードと一致しやすい日本語URLを使用
2. **階層構造**: カテゴリ > サブカテゴリの明確な階層
3. **短く意味のある**: URLだけで内容が推測できる
4. **正規化**: 末尾スラッシュなし、小文字統一（英語部分）

### 3.2 URL構造詳細

#### トップページ

```
/
```

**内容**:
- サイト紹介
- 人気チェーン店ランキング
- 人気検索キーワード
- 最新更新メニュー

#### チェーン店×目的ページ

```
/[chain_name_en]/[purpose]

例:
/ootoya/高タンパク
/yoshinoya/低糖質
/matsuya/ダイエット
/sukiya/ヘルシー
/mcdonalds/低脂質
```

**内容**:
- チェーン店の概要
- 目的に合うメニューランキング（トップ10）
- 各メニューのPFC情報
- おすすめポイント
- 関連ページリンク

**SEOキーワード例**:
- 「大戸屋 高タンパク メニュー」
- 「吉野家 低糖質 おすすめ」

#### 駅×条件ページ

```
/[station_name]/[condition]

例:
/渋谷駅/高タンパク-ランチ
/新宿駅/ヘルシー
/東京駅/ダイエット
/池袋駅/低糖質-ディナー
```

**内容**:
- 駅の概要
- 周辺のチェーン店リスト
- 各店舗のおすすめメニュー
- 「迷ったらここ！」即決リスト
- 徒歩距離、営業時間情報

**SEOキーワード例**:
- 「渋谷駅 高タンパク ランチ」
- 「新宿 ヘルシー チェーン店」

#### メニュー詳細ページ

```
/menu/[menu_id]

例:
/menu/ootoya-chicken-kaasan
/menu/yoshinoya-gyudon-light
/menu/sukiya-negi-tamago-gyudon
```

**内容**:
- メニュー名、画像
- 詳細なPFC情報
- 価格
- 同じチェーン店の他メニュー比較
- 類似メニュー（他チェーン）
- FAQ

**SEOキーワード例**:
- 「チキンかあさん煮定食 PFC」
- 「牛丼ライト カロリー」

#### 組み合わせ提案ページ

```
/combination/[nutrient]/[target]

例:
/combination/protein/30g
/combination/protein/40g
/combination/carb/50g以下
/combination/fat/20g以下
```

**内容**:
- 目標栄養素の説明
- 達成できるメニュー組み合わせランキング
- 各組み合わせの詳細（メニュー名、価格、PFC）
- 複数チェーン店を跨いだ提案

**SEOキーワード例**:
- 「タンパク質 30g メニュー 組み合わせ」
- 「糖質 50g 以下 外食」

#### チェーン店一覧ページ

```
/chains
/chains/teishoku     # カテゴリ別
/chains/fastfood
/chains/cafe
```

**内容**:
- 全チェーン店のリスト
- カテゴリ別絞り込み
- 各チェーン店の概要、メニュー数

#### 駅一覧ページ

```
/stations
/stations/tokyo      # 都道府県別
/stations/osaka
/stations/yamanote   # 路線別
```

**内容**:
- 対応駅のリスト
- 地域別、路線別の絞り込み

---

## 4. ページ生成ロジック

### 4.1 SSG（Static Site Generation）

#### generateStaticParams の実装

```typescript
// app/[chain]/[purpose]/page.tsx

import { getDatabase } from "@/lib/database";

// 事前生成するパスを定義
export async function generateStaticParams() {
  const db = await getDatabase();

  const chains = await db.all(`
    SELECT chain_id, chain_name_en FROM chains
  `);

  const purposes = [
    "高タンパク",
    "低脂質",
    "低糖質",
    "ダイエット",
    "ヘルシー",
  ];

  const params = [];

  for (const chain of chains) {
    for (const purpose of purposes) {
      params.push({
        chain: chain.chain_name_en,
        purpose: encodeURIComponent(purpose),
      });
    }
  }

  return params;
}

// ページコンポーネント
export default async function ChainPurposePage({
  params,
}: {
  params: { chain: string; purpose: string };
}) {
  const { chain, purpose } = params;
  const decodedPurpose = decodeURIComponent(purpose);

  const db = await getDatabase();

  // チェーン店情報を取得
  const chainInfo = await db.get(
    `SELECT * FROM chains WHERE chain_name_en = ?`,
    [chain]
  );

  // 目的に合うメニューを取得
  const menus = await db.all(
    `
    SELECT * FROM menus
    WHERE chain_id = ?
    ORDER BY ${getPurposeColumn(decodedPurpose)} DESC
    LIMIT 10
  `,
    [chainInfo.chain_id]
  );

  return (
    <main>
      <h1>
        {chainInfo.chain_name}の{decodedPurpose}メニューランキング
      </h1>
      {/* メニュー一覧 */}
    </main>
  );
}

function getPurposeColumn(purpose: string): string {
  const mapping: Record<string, string> = {
    高タンパク: "muscle_score",
    低脂質: "fat",
    低糖質: "keto_score",
    ダイエット: "health_score",
    ヘルシー: "health_score",
  };
  return mapping[purpose] || "muscle_score";
}
```

### 4.2 ISR（Incremental Static Regeneration）

```typescript
// app/[chain]/[purpose]/page.tsx

// 再生成の間隔を設定
export const revalidate = 86400; // 24時間

// または動的に設定
export async function generateMetadata({ params }) {
  return {
    // メタデータ
  };
}
```

### 4.3 動的ページ生成（fallback: 'blocking'）

```typescript
// next.config.js

module.exports = {
  // 未生成のパスは動的に生成
  experimental: {
    // ISRのフォールバック設定
  },
};
```

---

## 5. ページ数の見積もり

### 5.1 Phase 1（MVP）

| ページタイプ | 計算式 | ページ数 |
|--------------|--------|----------|
| トップページ | 1 | 1 |
| チェーン店×目的 | 5店 × 5目的 | 25 |
| メニュー詳細 | 5店 × 50メニュー | 250 |
| **合計** | | **約280ページ** |

### 5.2 Phase 2-3（拡張）

| ページタイプ | 計算式 | ページ数 |
|--------------|--------|----------|
| トップページ | 1 | 1 |
| チェーン店×目的 | 10店 × 5目的 | 50 |
| 駅×条件 | 100駅 × 3条件 | 300 |
| メニュー詳細 | 10店 × 80メニュー | 800 |
| 組み合わせ提案 | 10パターン | 10 |
| **合計** | | **約1,160ページ** |

### 5.3 Phase 5（大規模）

| ページタイプ | 計算式 | ページ数 |
|--------------|--------|----------|
| トップページ | 1 | 1 |
| チェーン店×目的 | 30店 × 5目的 | 150 |
| 駅×条件 | 500駅 × 3条件 | 1,500 |
| メニュー詳細 | 30店 × 100メニュー | 3,000 |
| 組み合わせ提案 | 50パターン | 50 |
| チェーン店一覧 | 1 + カテゴリ5 | 6 |
| 駅一覧 | 1 + 地域10 | 11 |
| **合計** | | **約4,720ページ** |

さらに拡大（駅1000、チェーン50）で **10,000ページ以上** も可能。

---

## 6. SEOキーワード戦略との対応

### 6.1 ページタイプとキーワードのマッピング

| キーワードカテゴリ | 対応ページタイプ | 優先度 |
|-------------------|-----------------|--------|
| チェーン店名 × 目的 | チェーン店×目的ページ | 最優先 |
| 駅名 × 条件 | 駅×条件ページ | 高 |
| メニュー名 × PFC | メニュー詳細ページ | 中 |
| 栄養素 × 目標量 | 組み合わせ提案ページ | 中 |

### 6.2 キーワード対応表

```
キーワード: 「大戸屋 高タンパク メニュー」
→ ページ: /ootoya/高タンパク
→ タイトル: 大戸屋の高タンパクメニューランキング【2024年最新】
→ H1: 大戸屋の高タンパクメニューランキング

キーワード: 「渋谷駅 ヘルシー ランチ」
→ ページ: /渋谷駅/ヘルシー-ランチ
→ タイトル: 渋谷駅のヘルシーランチチェーン店【おすすめ10選】
→ H1: 渋谷駅周辺のヘルシーランチが食べられるチェーン店

キーワード: 「タンパク質 30g 外食」
→ ページ: /combination/protein/30g
→ タイトル: タンパク質30gが摂れる外食メニュー組み合わせ
→ H1: タンパク質30gを摂取できるチェーン店メニュー組み合わせ
```

---

## 7. sitemap.xml 生成ロジック

### 7.1 サイトマップ構造

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- トップページ -->
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- チェーン店×目的ページ -->
  <url>
    <loc>https://example.com/ootoya/高タンパク</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- 駅×条件ページ -->
  <url>
    <loc>https://example.com/渋谷駅/ヘルシー</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- メニュー詳細ページ -->
  <url>
    <loc>https://example.com/menu/ootoya-chicken-kaasan</loc>
    <lastmod>2024-01-01</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

### 7.2 Next.js での実装

```typescript
// app/sitemap.ts

import { MetadataRoute } from "next";
import { getDatabase } from "@/lib/database";

const BASE_URL = "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const db = await getDatabase();
  const entries: MetadataRoute.Sitemap = [];

  // トップページ
  entries.push({
    url: BASE_URL,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 1.0,
  });

  // チェーン店×目的ページ
  const chains = await db.all("SELECT chain_name_en FROM chains");
  const purposes = ["高タンパク", "低脂質", "低糖質", "ダイエット", "ヘルシー"];

  for (const chain of chains) {
    for (const purpose of purposes) {
      entries.push({
        url: `${BASE_URL}/${chain.chain_name_en}/${encodeURIComponent(purpose)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // 駅×条件ページ
  const stations = await db.all(
    "SELECT DISTINCT station_name FROM stores LIMIT 100"
  );
  const conditions = ["高タンパク-ランチ", "ヘルシー", "ダイエット"];

  for (const station of stations) {
    for (const condition of conditions) {
      entries.push({
        url: `${BASE_URL}/${encodeURIComponent(station.station_name)}/${encodeURIComponent(condition)}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // メニュー詳細ページ
  const menus = await db.all("SELECT menu_id FROM menus LIMIT 1000");

  for (const menu of menus) {
    entries.push({
      url: `${BASE_URL}/menu/${menu.menu_id}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
```

### 7.3 大規模サイトマップ（分割）

ページ数が50,000を超える場合は、サイトマップインデックスを使用：

```typescript
// app/sitemap/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const perPage = 10000;
  const offset = id * perPage;

  // ページ数に応じたサイトマップを生成
  const entries = await generateSitemapEntries(offset, perPage);

  const xml = generateSitemapXml(entries);

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
```

---

## 8. robots.txt

```txt
User-agent: *
Allow: /

# クローラーの負荷軽減
Crawl-delay: 1

# 不要なパスを除外
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

# サイトマップの場所
Sitemap: https://example.com/sitemap.xml
```

### Next.js での実装

```typescript
// app/robots.ts

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/", "/admin/"],
    },
    sitemap: "https://example.com/sitemap.xml",
  };
}
```

---

## 9. ページ階層構造

```
/                                    # トップページ
├── /chains                          # チェーン店一覧
│   ├── /chains/teishoku             # 定食カテゴリ
│   ├── /chains/fastfood             # ファストフードカテゴリ
│   └── /chains/cafe                 # カフェカテゴリ
│
├── /[chain]/                        # チェーン店トップ（将来）
│   ├── /ootoya/高タンパク           # 大戸屋×高タンパク
│   ├── /ootoya/低脂質               # 大戸屋×低脂質
│   ├── /yoshinoya/高タンパク        # 吉野家×高タンパク
│   └── ...
│
├── /stations                        # 駅一覧
│   ├── /stations/tokyo              # 東京都の駅
│   └── /stations/yamanote           # 山手線の駅
│
├── /[station]/                      # 駅トップ（将来）
│   ├── /渋谷駅/高タンパク-ランチ    # 渋谷駅×高タンパクランチ
│   ├── /渋谷駅/ヘルシー             # 渋谷駅×ヘルシー
│   └── ...
│
├── /menu/                           # メニュー
│   ├── /menu/ootoya-chicken-kaasan  # メニュー詳細
│   └── ...
│
└── /combination/                    # 組み合わせ
    ├── /combination/protein/30g     # タンパク質30g
    ├── /combination/protein/40g     # タンパク質40g
    └── /combination/carb/50g以下    # 糖質50g以下
```

---

## 10. パンくずリスト設計

### 10.1 パンくずリスト例

**チェーン店×目的ページ**:
```
トップ > 大戸屋 > 高タンパクメニュー
```

**駅×条件ページ**:
```
トップ > 東京都 > 渋谷駅 > ヘルシー
```

**メニュー詳細ページ**:
```
トップ > 大戸屋 > チキンかあさん煮定食
```

### 10.2 構造化データ（BreadcrumbList）

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "トップ",
      "item": "https://example.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "大戸屋",
      "item": "https://example.com/ootoya"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "高タンパクメニュー",
      "item": "https://example.com/ootoya/高タンパク"
    }
  ]
}
```
