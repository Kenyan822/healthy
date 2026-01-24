# 機能要件・非機能要件定義書

## 1. プロジェクト概要

### 1.1 プロジェクト名
チェーン店ヘルシー検索サイト

### 1.2 概要
トレーニーやダイエット中の女性をターゲットに、チェーン店の食事のPFC（タンパク質・脂質・炭水化物）やヘルシー度合いを数値化してまとめるWebサイト。プログラマティックSEOを活用し、数千〜数万ページを自動生成してロングテールキーワードでの検索流入を独占する。

### 1.3 目的
- データドリブンなSEOサイトの構築
- チェーン店の栄養成分データを構造化
- PFCバランス・ヘルシー度合いでの検索・絞り込み機能の提供
- 検索流入から広告収入・アフィリエイト収入を得る

### 1.4 ターゲットユーザー
- トレーニー（筋トレをしている人）
- ダイエット中の女性
- 健康志向の人
- 外食が多いビジネスパーソン

### 1.5 技術スタック
| 項目 | 技術 |
|------|------|
| フロントエンド | Next.js 16.1.1 + React 19.2.3 |
| スタイリング | Tailwind CSS 4 |
| データベース | SQLite (better-sqlite3) |
| ORM | Drizzle ORM 0.45.1 |
| 言語 | TypeScript 5 |
| フォント | Noto Sans JP, Zen Maru Gothic |

---

## 2. 機能要件

### 2.1 データベース構造

#### 2.1.1 テーブル構成

**chains（チェーン店マスタ）**
| カラム | 型 | 説明 |
|--------|------|------|
| chainId | TEXT (PK) | チェーン店ID |
| chainName | TEXT | 日本語名 |
| chainNameEn | TEXT | 英語名 |
| chainNameKana | TEXT | カタカナ名 |
| category | TEXT | teishoku, gyudon, fastfood, cafe, famires, ramen, curry, udon, other |
| subcategory | TEXT | サブカテゴリ |
| officialUrl | TEXT | 公式サイトURL |
| logoUrl | TEXT | ロゴURL |
| description | TEXT | 説明文 |
| storeCount | INTEGER | 店舗数 |

**menus（メニューマスタ）**
| カラム | 型 | 説明 |
|--------|------|------|
| menuId | TEXT (PK) | メニューID |
| chainId | TEXT (FK) | チェーン店ID |
| menuName | TEXT | メニュー名 |
| menuNameKana | TEXT | カタカナ名 |
| menuSlug | TEXT | URL用スラッグ |
| price | INTEGER | 価格（円） |
| category | TEXT | カテゴリ |
| subcategory | TEXT | サブカテゴリ |
| calories | REAL | カロリー (kcal) |
| protein | REAL | タンパク質 (g) |
| fat | REAL | 脂質 (g) |
| carb | REAL | 炭水化物 (g) |
| fiber | REAL | 食物繊維 (g) |
| sodium | REAL | 塩分 (g) |
| sugar | REAL | 糖質 (g) |
| allergens | TEXT (JSON) | アレルゲン情報 |
| muscleScore | INTEGER | 筋トレスコア (0-100) |
| dietScore | INTEGER | ダイエットスコア (0-100) |
| healthScore | INTEGER | 健康スコア (0-100) |
| isSeasonal | INTEGER | 季節限定フラグ |
| isLimited | INTEGER | 期間限定フラグ |
| isAvailable | INTEGER | 販売中フラグ |
| viewCount | INTEGER | 閲覧数 |
| searchCount | INTEGER | 検索数 |
| timing | TEXT | breakfast, lunch, anytime |

**stations（駅マスタ）**
| カラム | 型 | 説明 |
|--------|------|------|
| stationId | TEXT (PK) | 駅ID |
| stationCd | TEXT | 駅コード |
| stationName | TEXT | 駅名 |
| stationNameKana | TEXT | カタカナ名 |
| stationNameEn | TEXT | 英語名 |
| prefecture | TEXT | 都道府県 |
| prefCode | INTEGER | 都道府県コード (1-47) |
| line | TEXT | 路線名 |
| lineCd | TEXT | 路線コード |
| lat | REAL | 緯度 |
| lng | REAL | 経度 |
| address | TEXT | 住所 |
| passengerCount | INTEGER | 乗降客数 |
| passengerRank | INTEGER | 乗降客数ランキング |

**stationChains（駅×チェーン店紐付け）**
| カラム | 型 | 説明 |
|--------|------|------|
| id | INTEGER (PK) | ID |
| stationId | TEXT (FK) | 駅ID |
| chainId | TEXT (FK) | チェーン店ID |
| placeId | TEXT | Google Places ID |
| placeName | TEXT | 店舗名 |
| placeAddress | TEXT | 店舗住所 |
| lat | REAL | 緯度 |
| lng | REAL | 経度 |
| distanceMeters | REAL | 駅からの距離 (m) |
| rating | REAL | Google評価 (0-5) |
| userRatingsTotal | INTEGER | レビュー数 |

---

### 2.2 栄養指標の計算ロジック

#### 2.2.1 事実ベース指標（メインで使用）

検索・ソート・ランキングで使用される主要な栄養指標。すべてSQLクエリ内で計算される。

| 指標名 | 計算式 | 説明 | ソート順 |
|--------|--------|------|----------|
| **proteinDensity**<br>(タンパク質密度) | `protein * 100.0 / calories` | カロリーあたりのタンパク質量。高タンパク低カロリーほど高い | DESC |
| **carbRatio**<br>(糖質比率) | `(carb * 4.0) / calories` | 総カロリーに占める糖質由来カロリーの割合 | ASC |
| **fatRatio**<br>(脂質比率) | `(fat * 9.0) / calories` | 総カロリーに占める脂質由来カロリーの割合 | ASC |
| **pfcBalance**<br>(PFCバランス) | 下記参照 | 理想比率(P:20%, F:25%, C:55%)との乖離度 | DESC |
| **costPerformance**<br>(コスパ) | `price / protein` | タンパク質1gあたりの価格（円）。低いほどコスパ良好 | ASC |

#### 2.2.2 PFCバランス計算の詳細

PFCバランスは理想的な栄養バランス（P:20%, F:25%, C:55%）との乖離を計算し、100点満点でスコア化する。

**SQLでの計算式:**

```sql
-- PFCから算出したカロリーを基準に各栄養素の比率を計算
-- totalCal = protein * 4 + fat * 9 + carb * 4

100 - (
  ABS((protein * 4.0 / totalCal) - 0.20) * 100 +  -- P比率の乖離
  ABS((fat * 9.0 / totalCal) - 0.25) * 100 +      -- F比率の乖離
  ABS((carb * 4.0 / totalCal) - 0.55) * 100       -- C比率の乖離
)
```

**TypeScriptでの計算式（API内）:**

```typescript
// 各栄養素のカロリー比率を計算
const proteinRatio = (protein * 4 / calories) * 100;  // タンパク質のカロリー比率
const fatRatio = (fat * 9 / calories) * 100;          // 脂質のカロリー比率
const carbRatio = (carb * 4 / calories) * 100;        // 炭水化物のカロリー比率

// 理想比率との乖離を計算（正規化）
const pDev = Math.abs(proteinRatio - 20) / 20;  // P: 理想20%
const fDev = Math.abs(fatRatio - 25) / 25;      // F: 理想25%
const cDev = Math.abs(carbRatio - 55) / 55;     // C: 理想55%

// 100点満点のスコアに変換（乖離が少ないほど高スコア）
const pfcBalance = Math.max(0, Math.round(100 * (1 - (pDev + fDev + cDev) / 3)));
```

#### 2.2.3 PFC検索のマッチングロジック

ユーザーが入力したPFC目標値との類似度をユークリッド距離で計算する。

```typescript
// 入力された項目のみで距離を計算（未入力=0の項目は除外）
let distanceSq = 0;

if (targetP > 0) {
  distanceSq += (menu.protein - targetP) ** 2;
}
if (targetF > 0) {
  distanceSq += (menu.fat - targetF) ** 2;
}
if (targetC > 0) {
  distanceSq += (menu.carb - targetC) ** 2;
}

// 距離が小さいほどマッチ度が高い
// 結果は距離の昇順でソート
```

#### 2.2.4 レガシースコア（参考・非推奨）

過去の設計で使用されていたスコア。現在は事実ベース指標に置き換えられている。

```typescript
// 筋トレスコア: 高タンパク・低カロリーほど高スコア（0-100）
muscleScore = min(100, (protein / calories * 100) * 3)

// ダイエットスコア: 低カロリー・低脂質ほど高スコア
dietScore = 100 - (calories / 15) - (fat * 1.5)

// 健康スコア: 総合的な健康指標
healthScore = 50 + protein + (fiber * 3) - (sodium * 5) - (fat * 0.5)
```

※ これらはDBスキーマに残存するが、表示・検索には使用されていない。

---

### 2.3 ページ構成・ルーティング

#### 実装済みページ一覧

| パス | ページ名 | 説明 | 生成方式 |
|------|----------|------|----------|
| `/` | ホーム | ヒーローセクション、メニューランキング、人気キーワード、クイックアクセス | 静的 |
| `/chains` | チェーン店一覧 | 全チェーン店をカテゴリ別に表示 | 静的 |
| `/chains/[chainId]` | チェーン店詳細 | メニュー一覧、栄養データ、目的別フィルタリング | SSG |
| `/search` | PFC検索 | カスタムPFC入力 + プリセット検索 | 静的 |
| `/area` | エリア検索 | 199主要駅を都道府県別に表示、人気駅トップ10 | 静的 |
| `/area/[station]` | 駅詳細 | 半径2km以内のチェーン店を距離順に表示 | SSG |
| `/ranking` | ランキングハブ | 目的別トップ5プレビュー、全チェーンランキングリンク | 静的 |
| `/ranking/[type]` | 目的別ランキング | 全チェーン横断の目的別ランキング | SSG |
| `/purpose/[purposeId]` | 目的別メニュー一覧 | 特定目的のメニューを全チェーンから表示 | SSG |
| `/menu/[menuId]` | メニュー詳細（グローバル） | 単一メニューの詳細ページ | SSG |
| `/[store]` | 店舗トップ | メニュー概要、人気メニュートップ5 | SSG |
| `/[store]/ranking` | 店舗内ランキング | チェーン店内ベストメニュー | SSG |
| `/[store]/menu` | メニュー一覧 | 全メニューを価格順に表示 | SSG |
| `/[store]/[segment]` | 動的フィルタページ | 目的/栄養/価格/時間帯フィルタ + メニュー詳細 | SSG |
| `/auth/signin` | ログイン | ユーザーログインページ | 静的 |
| `/auth/signup` | 新規登録 | ユーザー登録ページ | 静的 |
| `/contact` | お問い合わせ | お問い合わせフォーム | 静的 |
| `/contact/complete` | 送信完了 | お問い合わせ送信完了ページ | 静的 |
| `/favorites` | お気に入り | ユーザーのお気に入りメニュー一覧 | 動的 |

#### 動的セグメント対応

`/[store]/[segment]` は以下のセグメントタイプに対応:

**目的（Purpose）- 事実ベース指標**

| ID | 名前 | 説明 | ソートフィールド | ソート順 |
|----|------|------|------------------|----------|
| `high-protein` | 高タンパク | タンパク質が豊富なメニュー | protein | DESC |
| `protein-dense` | タンパク質効率 | カロリーあたりのタンパク質が多い | proteinDensity | DESC |
| `low-calorie` | 低カロリー | カロリーを抑えたメニュー | calories | ASC |
| `low-carb` | 低糖質 | 糖質比率が低いメニュー | carbRatio | ASC |
| `low-fat` | 低脂質 | 脂質比率が低いメニュー | fatRatio | ASC |
| `balanced` | バランス重視 | PFCバランスの良いメニュー | pfcBalance | DESC |
| `cost-performance` | タンパク質コスパ | タンパク質1gあたりの価格が安い | costPerformance | ASC |

**栄養フィルタ（Nutrition）**
- `protein-over-20g`, `protein-over-30g`, `protein-over-40g`, `protein-over-50g`, `protein-over-60g`
- `fat-under-10g`, `fat-under-20g`, `fat-under-30g`, `fat-under-40g`
- `carb-under-40g`, `carb-under-60g`, `carb-under-100g`, `carb-under-200g`

**価格フィルタ（Price）**
- `under-500yen`, `under-600yen`, `under-700yen`, `under-800yen`, `under-900yen`, `under-1000yen`

**時間帯フィルタ（Timing）**
- `breakfast` - 朝食
- `lunch` - ランチ

**メニュースラッグ**
- 個別メニューへの直接アクセス

---

### 2.4 検索機能

#### 2.4.1 カスタムPFC検索
- タンパク質・脂質・炭水化物の目標値を入力
- ユークリッド距離によるPFCマッチング
- マッチ度（%）をリアルタイム計算

#### 2.4.2 プリセット検索
| プリセット | 条件 |
|------------|------|
| 高タンパク | タンパク質 ≥ 30g |
| 低脂質 | 脂質 ≤ 15g |
| 低糖質 | 炭水化物 ≤ 40g |
| バランス型 | P:F:C = 2:2:6 比率 |

- 複数プリセットのAND検索に対応

#### 2.4.3 ソートオプション
- PFCマッチ度
- 人気順（viewCount）
- コストパフォーマンス（円/タンパク質g）

---

### 2.5 エリア検索機能

#### 実装内容
- 日本国内199主要駅を収録
- 各駅半径2km以内のチェーン店を表示
- Google Places APIによるリアル店舗データ
- 距離順ソート

#### データ構造
- `major-stations.json` (92KB) - 主要駅マスタ
- `station-rankings.json` (33KB) - 乗降客数ランキング

---

### 2.6 ランキング機能

#### ランキングタイプ（事実ベース指標）

| type | 説明 | ソート基準 | 計算式 |
|------|------|------------|--------|
| `high-protein` | 高タンパク | protein DESC | タンパク質量(g)の多い順 |
| `protein-dense` | タンパク質効率 | proteinDensity DESC | `protein * 100 / calories` |
| `low-calorie` | 低カロリー | calories ASC | カロリーの少ない順 |
| `low-carb` | 低糖質 | carbRatio ASC | `(carb * 4) / calories` |
| `low-fat` | 低脂質 | fatRatio ASC | `(fat * 9) / calories` |
| `balanced` | バランス重視 | pfcBalance DESC | 理想比率P:20%/F:25%/C:55%との乖離 |
| `cost-performance` | コスパ | costPerformance ASC | `price / protein` |

#### 対象範囲
- **グローバルランキング** (`/ranking/[type]`): 全チェーン店のメニューを横断
- **チェーン店別ランキング** (`/[store]/ranking`): 特定チェーン店内でのランキング
- **目的別一覧** (`/purpose/[purposeId]`): 目的に沿ったメニュー一覧

---

### 2.7 API エンドポイント

| エンドポイント | メソッド | 説明 |
|----------------|----------|------|
| `/api/menus/search` | GET | カスタム/プリセットPFC検索 |
| `/api/menus/ranking` | GET | 目的別メニューランキング |
| `/api/menus/[menuId]` | GET | メニュー詳細取得 |
| `/api/menus/[menuId]/view` | POST | 閲覧数カウント |
| `/api/menus` | GET | 全メニュー（ページネーション対応） |
| `/api/chains` | GET | 全チェーン店取得 |
| `/api/chains/[chainId]` | GET | チェーン店詳細取得 |
| `/api/suggest` | GET | 検索サジェスト（1000+候補） |
| `/api/stores/nearby` | GET | 近隣店舗検索 |

---

### 2.8 SEO最適化機能

#### 実装済み
| 機能 | 説明 |
|------|------|
| 動的メタデータ生成 | 各ページでtitle, description, og:tagsを自動生成 |
| robots.ts | クローラー制御設定 |
| sitemap.ts | 動的サイトマップ生成 |
| セグメントリゾルバ | URLから適切なメタデータを自動解決 |
| SEOインデックス閾値 | メニュー3件以上のページのみインデックス |

#### ページ生成規模
- チェーン店あたり50+ページを自動生成
- セグメント × 目的 × フィルタの組み合わせ

---

### 2.9 コンポーネント構成

#### レイアウト
- `Header` - ナビゲーション、検索バー、ロゴ
- `Footer` - サイトフッター

#### ホーム
- `HeroSection` - ヒーロー + 検索ボックス + 統計
- `MenuRanking` - サイドバートップ10
- `PopularKeywords` - トレンドキーワード
- `LatestMenus` - 新着メニュー（横スクロール）
- `QuickAccessGrid` - 主要機能へのクイックアクセス

#### 検索
- `PFCSearchForm` - カスタムPFC入力フォーム
- `PresetButtons` - プリセット選択ボタン
- `SearchResults` - 検索結果（ページネーション対応）

#### メニュー
- メニューカード（栄養成分表示）
- スコア可視化
- 価格表示

#### チェーン店
- チェーンカード（カテゴリバッジ付き）
- メニューリスト
- 目的別フィルタリングUI

---

## 3. 非機能要件

### 3.1 パフォーマンス要件

| 要件ID | 項目 | 基準 |
|--------|------|------|
| NFR-P01 | ページ読み込み時間 | 3秒以内 |
| NFR-P02 | Core Web Vitals - LCP | 2.5秒以内 |
| NFR-P03 | Core Web Vitals - FID | 100ms以内 |
| NFR-P04 | Core Web Vitals - CLS | 0.1以下 |
| NFR-P05 | 同時接続数 | 1,000以上 |

### 3.2 可用性要件

| 要件ID | 項目 | 基準 |
|--------|------|------|
| NFR-A01 | 稼働率 | 99.9%以上 |
| NFR-A02 | 計画停止 | 月1回、30分以内 |
| NFR-A03 | 障害復旧時間 | 1時間以内 |

### 3.3 セキュリティ要件

| 要件ID | 項目 | 基準 |
|--------|------|------|
| NFR-S01 | HTTPS | 全ページSSL/TLS化 |
| NFR-S02 | APIキー管理 | 環境変数での管理 |
| NFR-S03 | 入力値検証 | XSS、SQLインジェクション対策 |

### 3.4 法的要件

| 要件ID | 項目 | 基準 |
|--------|------|------|
| NFR-L01 | 著作権 | 公式データの利用規約遵守 |
| NFR-L02 | YMYL配慮 | 健康情報の断言を避ける |
| NFR-L03 | 広告規制 | 各広告ネットワーク規約遵守 |
| NFR-L04 | 個人情報 | 個人情報保護法遵守 |
| NFR-L05 | Google API規約 | Google Maps Platform利用規約遵守 |
| NFR-L06 | 商標 | チェーン店ロゴの使用禁止、非公式明示 |

---

## 4. 法的配慮・規約遵守ガイドライン

本プロジェクトは複数の法的・規約上のリスクを内包するため、以下のガイドラインを遵守する。

### 4.1 Google Maps Platform 利用規約

#### 4.1.1 データ保存ルール

| データ項目 | 保存可否 | 備考 |
|------------|----------|------|
| Place ID | 永続保存OK | 唯一許可されている永続保存項目 |
| 店舗名・住所 | 30日キャッシュのみ | 30日経過後は再取得または削除 |
| 評価・レビュー数 | 30日キャッシュのみ | 同上 |
| 緯度経度 | 30日キャッシュのみ | Place IDと紐付けが必要 |
| ユーザーレビュー・写真 | 保存NG | 常にAPIから取得 |

#### 4.1.2 stationChainsテーブル設計（規約準拠版）

```
**stationChains（駅×チェーン店紐付け）- 規約準拠版**
| カラム | 型 | 説明 |
|--------|------|------|
| id | INTEGER (PK) | ID |
| stationId | TEXT (FK) | 駅ID |
| chainId | TEXT (FK) | チェーン店ID |
| placeId | TEXT | Google Places ID（永続保存OK） |
| distanceMeters | REAL | 駅からの距離（自社計算値） |
| lastFetchedAt | DATETIME | 最終API取得日時 |
| createdAt | DATETIME | 作成日時 |
| updatedAt | DATETIME | 更新日時 |

※ placeName, placeAddress, lat, lng, rating, userRatingsTotal は
  表示時にPlace Details APIで都度取得するか、30日キャッシュルールを厳守
```

#### 4.1.3 地図表示の実装方針（コスト最適化）

**採用API: Google Maps Embed API（無料）**

| API | コスト | 用途 |
|-----|--------|------|
| Maps JavaScript API | $7/1000回 | 使用しない |
| Places API | $17〜32/1000回 | シード時のみ使用 |
| **Maps Embed API** | **無料（無制限）** | 駅ページの地図表示 |

**実装方法:**

```html
<!-- 駅中心の地図を表示（viewモード） -->
<iframe
  width="100%"
  height="300"
  style="border:0"
  loading="lazy"
  allowfullscreen
  src="https://www.google.com/maps/embed/v1/view?key=API_KEY&center={lat},{lng}&zoom=15">
</iframe>
```

**Embed API の4つのモード:**

| モード | 用途 | URL形式 |
|--------|------|---------|
| `place` | 特定店舗を表示 | `&q=place_id:ChIJ...` |
| `view` | 地図のみ表示 | `&center=35.68,139.76&zoom=15` |
| `directions` | ルート案内 | `&origin=A&destination=B` |
| `search` | 検索結果表示 | `&q=渋谷駅+ラーメン` |

**駅詳細ページの構成:**

```
┌─────────────────────────────────────┐
│ {駅名}駅周辺のヘルシーチェーン店    │
├─────────────────────────────────────┤
│ [Google Maps Embed - 駅中心]        │
│ （iframe / 無料 / viewモード）      │
├─────────────────────────────────────┤
│ 📍 吉野家 (200m)                    │
│    [メニューを見る] [Googleマップ→] │
│ 📍 松屋 (350m)                      │
│    [メニューを見る] [Googleマップ→] │
│ 📍 すき家 (500m)                    │
│    [メニューを見る] [Googleマップ→] │
├─────────────────────────────────────┤
│ ※店舗情報はGoogleマップを参照      │
└─────────────────────────────────────┘
```

#### 4.1.4 表示時の必須要件

**規約の根拠（Section 3.2.4）:**

> "You can display Place data from the Places API only in conjunction with a Google Map."

**「in conjunction with a Google Map」の解釈:**

| 解釈 | 意味 | 適用 |
|------|------|------|
| 厳格解釈 | 各店舗データの横に地図必須 | × 過剰 |
| **標準解釈** | **同一ページ内に地図が1つあればOK** | **◯ 採用** |
| 緩い解釈 | サイト内のどこかにあればOK | × 不十分 |

**実装要件:**

1. **同一ページ内に地図を表示**
   - 店舗リストと同じページにGoogle Maps Embed APIで地図を1つ表示
   - 各店舗ごとに地図を表示する必要はない

2. **Google帰属表示の確保**
   - Embed APIはiframe内にGoogleロゴが自動表示される
   - ロゴを隠す・改変することは禁止

3. **Googleマップへのリンク**
   - 各店舗に「Googleマップ→」リンクを設置
   - 形式: `https://www.google.com/maps/place/?q=place_id:{placeId}`

4. **出典注記**
   - 「※店舗情報はGoogleマップを参照しています」を表示

**OK / NG 例:**

```
【OK】ページ上部に地図1つ + 店舗リスト
┌─────────────────────────────┐
│ [Google Maps Embed]         │ ← 1つでOK
├─────────────────────────────┤
│ 店舗A: 住所、評価 [MAP→]    │
│ 店舗B: 住所、評価 [MAP→]    │
│ 店舗C: 住所、評価 [MAP→]    │
└─────────────────────────────┘

【NG】地図なしで店舗情報のみ表示
┌─────────────────────────────┐
│ 店舗A: 住所、評価           │ ← 地図がない
│ 店舗B: 住所、評価           │
│ [別ページで地図を見る→]     │ ← 同一ページにない
└─────────────────────────────┘
```

#### 4.1.5 禁止事項

- Place ID以外のデータの永続的なDB保存（30日キャッシュは可）
- Googleデータを使った独自APIの構築・再販
- Googleマップなしでの店舗情報表示

#### 4.1.6 コスト試算

| 項目 | 使用API | 頻度 | コスト |
|------|---------|------|--------|
| シード実行 | Places API | 月1回（約3,500回） | 無料枠内 |
| 30日キャッシュ更新 | Places API | 月1回 | 無料枠内 |
| 駅ページ地図表示 | Embed API | 無制限 | **無料** |
| 店舗詳細 | Googleマップへリンク | - | **無料** |

**→ 月額コスト: 0円（無料枠内で運用可能）**

---

### 4.2 栄養成分データの取り扱い

#### 4.2.1 保存・利用の可否

| データ項目 | 保存可否 | 理由 |
|------------|----------|------|
| 栄養成分（数値） | OK | 事実データのため著作権なし |
| メニュー名 | OK | 短文・一般名称のため著作権なし |
| 価格 | OK | 事実データ |
| 公式説明文 | NG | 創作性があり著作権が発生する可能性 |
| 公式画像・ロゴ | NG | 著作権・商標権の侵害リスク |

#### 4.2.2 データ収集ルール

| 項目 | ルール |
|------|--------|
| 収集頻度 | 月1回程度（過度なアクセス禁止） |
| 収集方法 | PDF手動解析を優先、スクレイピングは最小限 |
| robots.txt | 必ず確認し、Disallowを尊重 |
| アクセス間隔 | 最低3秒以上のインターバル |
| 深夜実行 | サーバー負荷を考慮し深夜帯に実行 |

#### 4.2.3 独自付加価値の明確化

本サイトの価値は「公式データの転載」ではなく「独自スコアリングによる分析」にある。

- muscleScore, dietScore, healthScore は独自の計算ロジック
- PFCマッチング検索は独自機能
- これらを「メインコンテンツ」として前面に出す

---

### 4.3 商標・ブランド保護

#### 4.3.1 禁止事項

| 項目 | NG例 | 理由 |
|------|------|------|
| ロゴ使用 | チェーン店ロゴの表示 | 商標権侵害リスク |
| 公式誤認 | 「公式」「オフィシャル」の表記 | 不正競争防止法 |
| ブランドカラー | 公式と同じ配色の使用 | 混同のおそれ |

#### 4.3.2 必須対応

- 全ページに「非公式サイト」であることを明示
- チェーン店名はテキストのみ使用（ロゴ不使用）
- OGP画像は独自デザイン（公式素材不使用）

---

### 4.4 サイト内必須表示

#### 4.4.1 免責事項（全ページフッターに表示）

```
本サイトは各チェーン店の公式サイトではありません。
掲載している栄養成分情報は、各社が公開している情報を参考に、
独自に整理・スコアリングしたものです。
内容の正確性・完全性を保証するものではありません。
最新情報は必ず各公式サイトをご確認ください。
```

#### 4.4.2 スコア説明（ランキング・検索結果ページ）

```
本スコアはPFCバランスに基づいた当サイト独自の指標であり、
特定の効果を保証するものではありません。
栄養成分は調理過程や店舗により変動する可能性があります。
```

#### 4.4.3 出典表示（各チェーン店ページ）

```
データ出典：[チェーン名] 公式サイト栄養成分表（YYYY年MM月時点）
```

#### 4.4.4 削除依頼フォーム

- お問い合わせページに「掲載内容に関するお問い合わせ」フォームを設置
- 権利者からの削除依頼に速やかに対応するフローを整備

---

### 4.5 YMYL（Your Money Your Life）対策

健康・栄養に関わる情報を扱うため、Googleの品質評価で厳しく審査される領域。

#### 4.5.1 コンテンツ作成ルール

| NG表現 | OK表現 |
|--------|--------|
| 「これを食べれば痩せる」 | 「ダイエット中の方に選ばれている傾向があります」 |
| 「筋肉がつく」 | 「タンパク質が豊富に含まれています」 |
| 「健康になる」 | 「栄養バランスの参考としてご活用ください」 |

#### 4.5.2 信頼性向上施策

- スコア計算ロジックの公開（透明性）
- 出典・参照元の明記
- 「このサイトについて」ページでの運営者情報開示
- 将来的には管理栄養士等の専門家監修を検討

---

### 4.6 クレーム対応フロー

```
1. クレーム受領（メール/フォーム）
   ↓
2. 内容確認（権利侵害の有無を判断）
   ↓
3. 一時的な該当コンテンツの非公開化（24時間以内）
   ↓
4. 権利者との協議
   ↓
5. 恒久対応（削除/修正/掲載継続の判断）
   ↓
6. 対応結果の記録・報告
```

---

## 5. データ管理

### 5.1 データソース
- チェーン店公式データ（栄養成分表PDF、Webページ）
- スクレイピング（規約遵守の範囲内）
- Google Places API（店舗位置情報）

### 5.2 シードスクリプト

| スクリプト | 説明 |
|------------|------|
| `seed.ts` | メインデータ投入（チェーン店、メニュー、スコア計算） |
| `seed-stations.ts` | 駅マスタ投入 |
| `seed-station-chains.ts` | 駅×チェーン店紐付け（Google Places API経由） |
| `extract-major-stations.ts` | 主要駅抽出 |
| `scrape-station-rankings.ts` | 乗降客数ランキング取得 |

### 5.3 更新方針
- グランドメニュー（定番）を優先
- 季節限定メニューは余裕が出てから対応
- `lastCheckedAt` による店舗データ鮮度管理
- `viewCount` による人気度追跡

---

## 5. リスク管理

### 5.1 Google品質ガイドライン

**リスク**: 自動生成コンテンツがスパム判定される

**対策**:
- 高品質なコンテンツ生成（実データ使用）
- 定期的な更新
- SEOインデックス閾値（3件以上）
- 断言を避け、事実の提示に徹する

### 5.2 データ更新の負担

**リスク**: 季節限定メニューの頻繁な更新

**対策**:
- グランドメニューに絞る
- モジュラーなシードスクリプト
- 増分更新対応

### 5.3 競合の参入

**リスク**: 成功後の競合増加

**対策**:
- 差別化（独自スコア、UI/UX、データ正確性）
- 継続的な改善
- 複数の収入源確保

### 5.4 インデックス遅延

**リスク**: 検索結果に表示されるまでの時間

**対策**:
- robots.ts、sitemap.tsによる適切なクローラー誘導
- Google Search Consoleでの早期インデックス申請

---

## 6. 成功基準

### 6.1 短期目標（6-12ヶ月）
- インデックスページ数: 1,000ページ以上
- 月間PV: 10,000以上
- 月間収益: 5-10万円

### 6.2 中期目標（12-24ヶ月）
- インデックスページ数: 5,000ページ以上
- 月間PV: 100,000以上
- 月間収益: 20-30万円

### 6.3 長期目標（24ヶ月以降）
- インデックスページ数: 10,000ページ以上
- 月間PV: 300,000以上
- 月間収益: 50万円以上

---

## 7. ディレクトリ構成

```
/healthy
├── app/                          # Next.js App Router
│   ├── (pages)/                 # ユーザー向けページ（Route Group）
│   │   ├── area/               # エリア検索
│   │   ├── chains/             # チェーン店一覧・詳細
│   │   ├── ranking/            # ランキング
│   │   ├── search/             # PFC検索
│   │   └── [store]/            # 店舗動的ルート
│   ├── (api)/api/               # APIルート（Route Group）
│   ├── layout.tsx               # ルートレイアウト
│   ├── page.tsx                 # ホームページ
│   ├── robots.ts                # SEO robots設定
│   └── sitemap.ts               # 動的サイトマップ
├── components/                   # Reactコンポーネント
│   ├── chain/                   # チェーン店関連
│   ├── home/                    # ホームページ関連
│   ├── layout/                  # Header & Footer
│   ├── menu/                    # メニュー関連
│   ├── search/                  # 検索関連
│   └── ui/                      # UIプリミティブ
├── lib/                         # コアロジック
│   ├── db/
│   │   ├── index.ts            # DB接続設定
│   │   ├── schema.ts           # Drizzle ORMスキーマ
│   │   └── queries.ts          # データベースクエリ（〜1000行）
│   ├── filters.ts              # フィルタ定義
│   ├── presets.ts              # 検索プリセット
│   ├── segment-resolver.ts     # URL解決 & SEOメタデータ
│   ├── google-places.ts        # Google Places API
│   ├── location.ts             # 位置情報機能
│   └── utils.ts                # ユーティリティ
├── types/                       # TypeScript型定義
├── public/                      # 静的アセット
├── scripts/                     # データシード & ETLスクリプト
├── data/                        # データベース & JSONデータ
│   ├── chain_restaurant.db     # SQLiteデータベース
│   ├── major-stations.json    # 主要駅マスタ
│   ├── station-rankings.json  # 乗降客数ランキング
│   └── mock/                  # 開発用モックデータ
└── docs/                       # ドキュメント
```
