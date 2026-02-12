# SEO戦略

## 目次

1. [技術的SEO実装](#技術的seo実装)
2. [プログラマティックSEO戦略](#プログラマティックseo戦略)
3. [品質管理](#品質管理)
4. [YMYL対策](#ymyl対策)
5. [運用フロー](#運用フロー)

---

## 技術的SEO実装

### メタデータ基盤

`app/layout.tsx` でグローバルメタデータを設定。全ページに自動適用される。

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  metadataBase: new URL("https://chenmeshi.com"),
  title: {
    default: "チェンメシ | チェーン店メニューの栄養成分・価格比較",
    template: "%s | チェンメシ",  // 各ページで title を設定すると自動的に「〇〇 | チェンメシ」になる
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "チェンメシ",
  },
  twitter: {
    card: "summary",
  },
  alternates: {
    canonical: "/",
  },
};
```

**ポイント:**
- `metadataBase` を設定することで、canonical URL などの相対パスが自動的に絶対URLに変換される
- `title.template` により各ページでは「チェンメシ」を付けずにタイトルを設定するだけでOK

### Canonical URL

全ページに `alternates.canonical` を設定済み。重複コンテンツ問題を防ぐ。

| ページ | canonical URL | 設定場所 |
|--------|--------------|---------|
| トップ | `/` | `app/layout.tsx` |
| チェーン一覧 | `/chains` | `chains/page.tsx` |
| チェーン詳細 | `/chains/{chainId}` | `chains/[chainId]/page.tsx` |
| 店トップ | `/{store}` | `[store]/page.tsx` |
| 店メニュー一覧 | `/{store}/menu` | `[store]/menu/page.tsx` |
| 店ランキング | `/{store}/ranking` | `[store]/ranking/page.tsx` |
| 店×目的/フィルター | `/{store}/{segment}` | `[store]/[segment]/page.tsx` |
| メニュー詳細 | `/menu/{menuId}` | `menu/[menuId]/page.tsx` |
| ランキングトップ | `/ranking` | `ranking/page.tsx` |
| ランキング詳細 | `/ranking/{type}` | `ranking/[type]/page.tsx` |
| 目的別 | `/purpose/{purposeId}` | `purpose/[purposeId]/page.tsx` |
| 駅一覧 | `/area` | `area/page.tsx` |
| 駅詳細 | `/area/{station}` | `area/[station]/page.tsx` |
| PFC検索 | `/search` | `search/layout.tsx` |
| 料金プラン | `/pricing` | `pricing/layout.tsx` |
| お気に入り | *(noindex)* | `favorites/layout.tsx` |

**注意:** `use client` ページ（search, pricing, favorites）は metadata export ができないため、`layout.tsx` を別途作成してメタデータを設定している。

### JSON-LD 構造化データ

メニュー詳細ページ（`/menu/{menuId}`）に2種類のJSON-LDを埋め込み。

#### MenuItem（メニュー情報）

```json
{
  "@context": "https://schema.org",
  "@type": "MenuItem",
  "name": "牛丼 並盛",
  "offers": {
    "@type": "Offer",
    "price": 400,
    "priceCurrency": "JPY"
  },
  "nutrition": {
    "@type": "NutritionInformation",
    "calories": "638 cal",
    "proteinContent": "20 g",
    "fatContent": "25 g",
    "carbohydrateContent": "85 g"
  }
}
```

#### BreadcrumbList（パンくずリスト）

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://chenmeshi.com" },
    { "@type": "ListItem", "position": 2, "name": "吉野家", "item": "https://chenmeshi.com/yoshinoya" },
    { "@type": "ListItem", "position": 3, "name": "牛丼 並盛" }
  ]
}
```

**効果:** Google検索結果にリッチスニペット（価格、カロリー、パンくず）が表示される可能性。

### robots.txt

```typescript
// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/_next/", "/private/"],
    },
    sitemap: "https://chenmeshi.com/sitemap.xml",
  };
}
```

### sitemap.xml

`app/sitemap.ts` で動的生成。メニュー3件以上の品質条件を満たすページのみ含む。

| カテゴリ | priority | changeFrequency |
|---------|----------|----------------|
| トップ | 1.0 | daily |
| ランキングトップ | 0.9 | daily |
| 店トップ | 0.9 | weekly |
| 目的別ランキング | 0.85 | weekly |
| 店メニュー一覧 | 0.8 | weekly |
| 店ランキング | 0.8 | weekly |
| 店×目的 | 0.8 | weekly |
| チェーン別ランキング | 0.75 | weekly |
| 店×栄養/価格/時間帯 | 0.7 | weekly |
| メニュー詳細 | 0.6 | monthly |
| 駅ページ | 0.5 | weekly |

### セキュリティヘッダー

`next.config.ts` で全ページにセキュリティヘッダーを設定。間接的にSEO評価に影響。

```typescript
async headers() {
  return [{
    source: "/(.*)",
    headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
    ],
  }];
},
```

### noindex 設定

以下のページは `robots: { index: false, follow: true }` を設定：

- メニュー3件未満のチェーン店ページ（`[store]/page.tsx`）
- メニュー3件未満のフィルターページ（`[store]/[segment]/page.tsx`）
- メニュー3件未満のメニュー一覧（`[store]/menu/page.tsx`）
- お気に入りページ（ユーザー固有コンテンツ）

### 301リダイレクト

URL変更時のSEO評価を引き継ぐため、`next.config.ts` で permanent redirect を設定。

```typescript
async redirects() {
  return [
    { source: "/chains/:chainId", destination: "/:chainId", permanent: true },
    { source: "/purpose/:purposeId", destination: "/ranking/:purposeId", permanent: true },
  ];
},
```

---

## プログラマティックSEO戦略

### 基本方針

- **URLは資産**: 一度決めたら変えない。中身は更新OK
- **質が最優先**: 各ページにメニュー3件以上の固有コンテンツ
- **検索意図ベース**: 同じ意図のキーワードは1ページに集約

### 項目定義

| 項目 | 値の例 | 備考 |
|------|--------|------|
| 駅 | 渋谷、新宿、池袋... | 199駅 |
| 店 | 吉野家、すき家、松屋... | 12店 |
| 目的 | ダイエット、高タンパク、低脂質、低糖質... | 7種 |
| 栄養 | タンパク質30g以上、脂質20g以下... | 10g刻み |
| 時間 | 朝食、ランチ | 2種 |
| 価格 | 500円以下、1000円以下... | 100円刻み |

#### 同義語マッピング

```
ダイエット = 低カロリー, ヘルシー, バランス
高タンパク = タンパク質, 筋トレ, プロテイン
低脂質 = 脂質制限, ローファット
低糖質 = 糖質制限, ローカーボ, ケトジェニック
```

### 組み合わせルール

#### 許可する組み合わせ

| ベース | 組み合わせ可能 |
|--------|---------------|
| 店 | 目的, 栄養, 時間, 価格, ランキング, メニュー一覧 |
| ランキング | 店, 目的（「外食」キーワードはここで拾う） |

#### 禁止する組み合わせ

- 駅 × ランキング（需要なし）
- 駅 × メニュー一覧（意味なし）
- 3階層以上の組み合わせ（需要薄い）

### URL設計

#### 店ベース

| パターン | 具体例 | 狙うキーワード |
|----------|--------|---------------|
| `/{store}` | `/yoshinoya` | 吉野家 ヘルシー |
| `/{store}/menu` | `/yoshinoya/menu` | 吉野家 メニュー 一覧 |
| `/{store}/{purpose}` | `/yoshinoya/high-protein` | 吉野家 高タンパク |
| `/{store}/{nutrition}` | `/yoshinoya/protein-over-30g` | 吉野家 タンパク質 30g |
| `/{store}/{timing}` | `/yoshinoya/breakfast` | 吉野家 朝食 メニュー |
| `/{store}/{price}` | `/yoshinoya/under-500yen` | 吉野家 500円以下 |
| `/{store}/ranking` | `/yoshinoya/ranking` | 吉野家 おすすめ ランキング |

#### 駅ベース

| パターン | 具体例 | 狙うキーワード |
|----------|--------|---------------|
| `/area/{station}` | `/area/shibuya` | 渋谷 ヘルシー ランチ |

#### ランキング

| パターン | 具体例 | 狙うキーワード |
|----------|--------|---------------|
| `/ranking/{purpose}` | `/ranking/high-protein` | 高タンパク 外食 ランキング |
| `/ranking/{chainId}` | `/ranking/yoshinoya` | 吉野家 メニュー ランキング |

### 1ページ複数キーワード戦略

#### 例: `/yoshinoya/high-protein`

**狙うキーワード:**
- 吉野家 高タンパク（メイン）
- 吉野家 タンパク質
- 吉野家 筋トレ
- 吉野家 ダイエット

**実装:**
- `title`: 検索意図に合ったメインキーワードを含む
- `description`: サブキーワードを自然に含む
- `h1`: メインキーワード
- 本文にイントロテキスト（セグメントごとにユニークな文章）

---

## 品質管理

### 生成条件

```typescript
// メニュー3件以上なら生成、未満は noindex
if (menuCount >= 3) {
  robots: { index: true, follow: true }
} else {
  robots: { index: false, follow: true }
}
```

### サイトマップ品質管理

- メニュー3件未満のページはサイトマップに含めない
- `priority` は検索ボリュームの推定に基づいて設定

### 生成ページ数

現在のビルドで **2,381ページ** を静的生成（SSG）。

| カテゴリ | ページ数 |
|---------|----------|
| メニュー詳細 | ~1,653 |
| 店×目的/栄養/価格/時間 | ~428 |
| 駅ページ | ~199 |
| 店トップ/メニュー/ランキング | ~36 |
| ランキング（目的別+チェーン別） | ~19 |
| 静的ページ（トップ/チェーン一覧等） | ~10 |

---

## YMYL対策

健康・栄養情報を扱うため、E-E-A-T（経験・専門性・権威性・信頼性）を意識。

### やっていいこと

- 「牛丼並は638kcal、タンパク質20gです」（**事実の提示**）
- 「ダイエット中の選択肢として」（**提案**）
- 「公式サイトより引用」（**出典明記**）
- 「タンパク質効率が高く、効率的にタンパク質を摂取可能」（**事実ベースの指標**）

### やってはいけないこと

- 「これで痩せます！」（**効果の断言**）
- 「筋トレにはこれを食べるべき」（**医療アドバイス**）
- 公式ロゴの無断使用

### 免責表示（フッターに記載）

- 「当サイトは各チェーン店の公式サイトではありません」
- 「栄養成分は公式情報を元に掲載しています。最新情報は公式サイトをご確認ください」

### メニュー詳細ページの工夫

おすすめポイントは「事実ベース指標」のみ使用:
- タンパク質密度（protein / calories）
- PFC比率（理想比 P:F:C = 20:25:55 との乖離）
- 具体的な数値で表示（例: P密度 5.2、糖質比率 38%）
- 「スコア」のような曖昧な表現を避け、計算根拠が明確な値を使う

---

## 運用フロー

### Phase 1: 初期構築 (完了)

1. 店×目的ページを生成
2. メニュー詳細ページを生成（JSON-LD付き）
3. ランキングページを生成
4. サイトマップ・robots.txt 設定
5. 全ページにcanonical URL設定
6. OGP・Twitter Card 設定
7. セキュリティヘッダー設定
8. noindex条件の実装

### Phase 2: 検証（1-3ヶ月）

1. Google Search Console でインデックス状況を確認
2. 順位・流入データを分析
3. 低パフォーマンスページを noindex に切り替え
4. 成果が出ている軸を特定

### Phase 3: 拡大

1. 成果が出た軸で横展開
2. 駅×目的ページを追加
3. 栄養・価格・時間帯の軸を追加

### 今後のSEO改善候補

| 施策 | 優先度 | 効果 |
|------|--------|------|
| OGP画像の動的生成（`opengraph-image.tsx`） | 中 | SNSシェア時のCTR向上 |
| FAQ構造化データ | 中 | 検索結果でFAQリッチスニペット表示 |
| WebSite構造化データ | 低 | サイト名表示の最適化 |
| Core Web Vitals最適化 | 中 | パフォーマンス指標の向上 |
| 内部リンク構造の強化 | 低 | クロール効率とページ評価の分散 |
