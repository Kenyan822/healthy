# 技術スタック定義書

## 1. 概要

本ドキュメントでは、チェーン店ヘルシー検索サイトで採用する技術スタックと選定理由を定義する。

---

## 2. システムアーキテクチャ

### 2.1 全体構成図

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                         │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Vercel Edge CDN                          │
│                    (グローバルキャッシュ配信)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js Application                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   SSG/ISR   │  │ API Routes  │  │  React Server Components │  │
│  │   Pages     │  │  (/api/*)   │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                    ┌───────────┼───────────┐
                    ▼           ▼           ▼
            ┌───────────┐ ┌───────────┐ ┌───────────┐
            │  SQLite/  │ │ OpenAI    │ │ Location  │
            │ PostgreSQL│ │ API       │ │ API       │
            └───────────┘ └───────────┘ └───────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    Python Batch Processing                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Data      │  │   Score     │  │   Content Generator     │  │
│  │  Scraper    │  │  Calculator │  │   (AI)                  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 データフロー

```
1. データ収集（Python）
   公式サイト → スクレイピング → CSV/JSON → SQLite

2. ページ生成（Next.js SSG）
   SQLite → API Routes → SSG Build → 静的HTML

3. ユーザーアクセス
   Browser → Vercel CDN → 静的HTML（キャッシュ）

4. 動的更新（ISR）
   リクエスト → revalidate → 再生成 → キャッシュ更新
```

### 2.3 ディレクトリ構造

```
healthy/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # トップページ
│   ├── layout.tsx                # ルートレイアウト
│   ├── [chain]/
│   │   └── [purpose]/
│   │       └── page.tsx          # チェーン店×目的ページ
│   ├── [station]/
│   │   └── [condition]/
│   │       └── page.tsx          # 駅×条件ページ
│   ├── menu/
│   │   └── [menuId]/
│   │       └── page.tsx          # メニュー詳細ページ
│   ├── combination/
│   │   └── [...slug]/
│   │       └── page.tsx          # 組み合わせ提案ページ
│   └── api/                      # API Routes
│       ├── chains/
│       ├── menus/
│       ├── stations/
│       └── combinations/
├── components/                   # Reactコンポーネント
│   ├── ui/                       # 汎用UIコンポーネント
│   ├── SEO.tsx
│   ├── MenuCard.tsx
│   ├── MenuTable.tsx
│   └── AdSense.tsx
├── lib/                          # ユーティリティ
│   ├── database.ts               # DB接続
│   ├── menu-combination.ts       # 組み合わせロジック
│   └── api-client.ts             # APIクライアント
├── python/                       # Pythonスクリプト
│   ├── scrapers/                 # スクレイピング
│   ├── scripts/                  # バッチ処理
│   └── requirements.txt
├── data/                         # データファイル
│   ├── chain_restaurant.db       # SQLite DB
│   └── seed/                     # 初期データCSV
├── sql/                          # SQLスキーマ
├── public/                       # 静的ファイル
│   ├── images/
│   ├── sitemap.xml
│   └── robots.txt
├── docs/                         # ドキュメント
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 3. フロントエンド

### 3.1 Next.js 14（App Router）

**バージョン**: 14.x

**選定理由**:
- SSG（Static Site Generation）で大量ページを効率的に生成
- ISR（Incremental Static Regeneration）で動的更新に対応
- React Server Componentsによるパフォーマンス最適化
- SEOに最適な設計
- Vercelとの親和性が高い

**主な機能**:
```typescript
// App Router構造
app/
├── page.tsx                           // トップページ
├── [chain]/
│   └── [purpose]/
│       └── page.tsx                   // チェーン店×目的ページ
├── [station]/
│   └── [condition]/
│       └── page.tsx                   // 駅×条件ページ
├── menu/
│   └── [menuName]/
│       └── page.tsx                   // メニュー詳細ページ
└── combination/
    └── [nutrient]/
        └── [target]/
            └── page.tsx               // 組み合わせ提案ページ
```

### 3.2 TypeScript

**バージョン**: 5.x

**選定理由**:
- 型安全性による開発効率向上
- コードの可読性・保守性向上
- IDEサポートの充実
- Next.jsとの親和性

**型定義例**:
```typescript
interface Menu {
  menu_id: string;
  menu_name: string;
  chain_id: string;
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  muscle_score: number;
  keto_score: number;
  health_score: number;
}

interface Chain {
  chain_id: string;
  chain_name: string;
  chain_name_en: string;
  category: string;
  official_url: string;
}
```

### 3.3 Tailwind CSS

**バージョン**: 3.x

**選定理由**:
- ユーティリティファーストで高速開発
- ビルド時の最適化（未使用CSSの削除）
- レスポンシブデザインの容易な実装
- カスタマイズ性の高さ

**設定例**:
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#10B981',    // 健康的なグリーン
        secondary: '#3B82F6',  // 信頼感のあるブルー
      },
    },
  },
}
```

### 3.4 React Server Components

**選定理由**:
- サーバーサイドでのレンダリングによるパフォーマンス向上
- クライアントバンドルサイズの削減
- データフェッチの最適化

---

## 4. バックエンド

### 4.1 Python

**バージョン**: 3.11+

**用途**:
- データ収集・スクレイピング
- 栄養成分データの前処理
- バッチ処理（定期的なデータ更新）
- AI API連携

**主要ライブラリ**:
```
requests>=2.31.0      # HTTP リクエスト
beautifulsoup4>=4.12  # HTML パース
pandas>=2.0           # データ処理
openai>=1.0           # OpenAI API
sqlite3               # データベース（標準ライブラリ）
```

### 4.2 Node.js

**バージョン**: 20.x LTS

**用途**:
- Next.js API Routes
- サーバーサイドレンダリング
- ビルドプロセス

### 4.3 データベース

#### SQLite（MVP〜中規模）

**選定理由**:
- セットアップ不要
- ファイルベースで管理が容易
- Vercelとの互換性（Edge Runtime制限に注意）
- 読み取り中心のワークロードに最適

**制限事項**:
- 同時書き込みの制限
- 大規模データには不向き

#### PostgreSQL（大規模時）

**移行タイミング**:
- データ量が10万レコードを超える場合
- 同時接続数が増加する場合

**推奨サービス**:
- Supabase（無料枠あり）
- PlanetScale（MySQL互換）
- Neon（サーバーレスPostgreSQL）

---

## 5. 外部API

### 5.1 AI API（コンテンツ生成）

#### OpenAI API（推奨）

**モデル**: GPT-4 / GPT-3.5-turbo

**用途**:
- ページコンテンツの生成
- メタディスクリプションの生成
- FAQ生成

**料金目安**:
```
GPT-4:        $0.03/1K tokens (input), $0.06/1K tokens (output)
GPT-3.5:      $0.0005/1K tokens (input), $0.0015/1K tokens (output)

1ページ生成（約1,000トークン）:
- GPT-4: 約$0.09/ページ（約14円）
- GPT-3.5: 約$0.002/ページ（約0.3円）
```

#### Claude API（代替）

**モデル**: Claude 3 Sonnet / Haiku

**用途**: OpenAI APIの代替・補完

### 5.2 位置情報API

#### 駅データ取得

**候補**:
- HeartRails Express API（無料）
- 駅データ.jp（有料）

**用途**:
- 駅名・路線名の取得
- 緯度・経度情報

#### 店舗データ取得

**候補**:
- Google Places API
- 各チェーン店の店舗検索ページ（スクレイピング）

---

## 6. インフラ・ホスティング

### 6.1 Vercel（推奨）

**選定理由**:
- Next.jsの開発元
- 無料枠が充実
- ISRのネイティブサポート
- グローバルCDN
- 自動デプロイ（Git連携）

**無料枠**:
```
- 帯域幅: 100GB/月
- サーバーレス関数: 100GB-hours/月
- ビルド時間: 6,000分/月
- 同時ビルド: 1
```

**有料プラン（Pro）**: $20/月
- 帯域幅: 1TB/月
- より多くのビルド時間
- チーム機能

### 6.2 代替案

#### Netlify
- 無料枠が充実
- フォーム機能が便利
- Next.jsサポートあり（ただしVercelほど最適化されていない）

#### AWS（大規模時）
- S3 + CloudFront + Lambda
- 完全なコントロール
- 設定の複雑さ

### 6.3 ドメイン

**推奨レジストラ**:
- Google Domains（年額約1,400円）
- Cloudflare Registrar（原価提供）
- お名前.com（セール時にお得）

**ドメイン例**:
- `healthy-chain.jp`
- `pfc-search.com`
- `chainmeshi.jp`

---

## 7. 監視・分析ツール

### 7.1 Google Search Console

**用途**:
- 検索パフォーマンスの監視
- インデックス状況の確認
- サイトマップの送信
- エラーの検出

**無料**

### 7.2 Google Analytics 4

**用途**:
- アクセス解析
- ユーザー行動の分析
- コンバージョン追跡

**無料**

### 7.3 Plausible（代替）

**用途**:
- プライバシー重視の分析
- シンプルなダッシュボード

**料金**: $9/月〜

### 7.4 Vercel Analytics

**用途**:
- Core Web Vitalsの監視
- リアルユーザーメトリクス

**無料枠あり**

---

## 8. 開発ツール

### 8.1 コード管理

**GitHub**
- バージョン管理
- Vercelとの自動連携
- GitHub Actions（CI/CD）

### 8.2 コード品質

```json
// package.json
{
  "devDependencies": {
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 8.3 テスト

```json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "playwright": "^1.40.0"
  }
}
```

---

## 9. コスト見積もり

### 9.1 初期費用

| 項目 | 費用 |
|------|------|
| ドメイン | ¥1,000〜1,500/年 |
| ホスティング | ¥0（無料枠） |
| **合計** | **¥1,000〜1,500/年** |

### 9.2 運用費用（月額）

#### 最小構成（MVP）

| 項目 | 費用 |
|------|------|
| Vercel | ¥0（無料枠） |
| OpenAI API | ¥0〜3,000 |
| 位置情報API | ¥0（無料枠） |
| **合計** | **¥0〜3,000/月** |

#### 中規模構成

| 項目 | 費用 |
|------|------|
| Vercel Pro | ¥3,000/月 |
| OpenAI API | ¥5,000〜10,000/月 |
| データベース | ¥0〜2,000/月 |
| **合計** | **¥8,000〜15,000/月** |

### 9.3 コスト対効果

```
収益目標: 月20万円
運用コスト: 月1万円
利益率: 95%

→ 低コストで高利益率のビジネスモデル
```

---

## 10. 技術選定のまとめ

| カテゴリ | 技術 | 選定理由 |
|----------|------|----------|
| フレームワーク | Next.js 14 | SSG/ISR、SEO最適 |
| 言語 | TypeScript | 型安全性 |
| スタイリング | Tailwind CSS | 高速開発 |
| データ処理 | Python | スクレイピング、AI連携 |
| データベース | SQLite→PostgreSQL | 段階的スケール |
| AI | OpenAI API | コンテンツ生成 |
| ホスティング | Vercel | Next.js最適化 |
| 分析 | Google Analytics | 無料、高機能 |

---

## 11. 将来の拡張性

### 11.1 スケールアップ時の対応

1. **データベース移行**
   - SQLite → PostgreSQL（Supabase/Neon）

2. **キャッシュ導入**
   - Redis（Upstash）
   - Vercel Edge Config

3. **検索機能強化**
   - Algolia
   - MeiliSearch

### 11.2 機能追加時の対応

1. **ユーザー認証**
   - NextAuth.js
   - Clerk

2. **リアルタイム機能**
   - Supabase Realtime
   - Pusher

3. **モバイルアプリ**
   - React Native
   - Expo
