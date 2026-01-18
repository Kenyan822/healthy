# Next.js App Router 学習ガイド

## 1. App Router とは

### 1.1 概要

Next.js 13以降で導入された新しいルーティングシステム。従来の `pages/` ディレクトリに代わり、`app/` ディレクトリを使用する。

```
従来（Pages Router）:
  pages/
    index.tsx      → /
    about.tsx      → /about
    posts/[id].tsx → /posts/:id

新方式（App Router）:
  app/
    page.tsx           → /
    about/page.tsx     → /about
    posts/[id]/page.tsx → /posts/:id
```

### 1.2 主な特徴

| 特徴 | 説明 |
|------|------|
| Server Components | デフォルトでサーバーコンポーネント |
| Streaming | コンテンツの段階的な読み込み |
| Layouts | 共通レイアウトの入れ子構造 |
| Route Groups | URLに影響しないフォルダ整理 |
| Parallel Routes | 同時に複数のページを表示 |

---

## 2. ディレクトリ構造

### 2.1 基本構造

```
app/
├── layout.tsx      # ルートレイアウト（必須）
├── page.tsx        # トップページ（/）
├── globals.css     # グローバルCSS
├── not-found.tsx   # 404ページ
├── error.tsx       # エラーページ
├── loading.tsx     # ローディング表示
├── sitemap.ts      # サイトマップ生成
└── robots.ts       # robots.txt生成
```

### 2.2 特殊ファイル

| ファイル名 | 役割 |
|-----------|------|
| `page.tsx` | ルートのUIを定義（これがあるとアクセス可能） |
| `layout.tsx` | 共通レイアウト |
| `template.tsx` | 再レンダリングするレイアウト |
| `loading.tsx` | ローディングUI（Suspense境界） |
| `error.tsx` | エラーUI（Error Boundary） |
| `not-found.tsx` | 404 UI |
| `route.ts` | API エンドポイント |

---

## 3. ルーティング

### 3.1 基本ルート

```
app/
├── page.tsx                    → /
├── about/page.tsx              → /about
├── contact/page.tsx            → /contact
└── blog/
    ├── page.tsx                → /blog
    └── [slug]/page.tsx         → /blog/:slug
```

### 3.2 動的ルート

```typescript
// app/menu/[menuId]/page.tsx

type Props = {
  params: Promise<{ menuId: string }>;
};

export default async function MenuPage({ params }: Props) {
  const { menuId } = await params;

  return <div>Menu ID: {menuId}</div>;
}
```

### 3.3 複数パラメータ

```typescript
// app/[chain]/[purpose]/page.tsx

type Props = {
  params: Promise<{ chain: string; purpose: string }>;
};

export default async function Page({ params }: Props) {
  const { chain, purpose } = await params;

  return (
    <div>
      Chain: {chain}, Purpose: {purpose}
    </div>
  );
}
```

### 3.4 Catch-all ルート

```
app/
└── docs/[...slug]/page.tsx    → /docs/a, /docs/a/b, /docs/a/b/c
```

```typescript
// app/docs/[...slug]/page.tsx
type Props = {
  params: Promise<{ slug: string[] }>;
};

export default async function DocsPage({ params }: Props) {
  const { slug } = await params;
  // /docs/a/b/c → slug = ['a', 'b', 'c']
  return <div>{slug.join('/')}</div>;
}
```

---

## 4. Route Groups

### 4.1 概要

`(フォルダ名)` で囲むと、URLに影響せずにファイルを整理できる。

```
app/
├── (pages)/
│   ├── chains/page.tsx        → /chains
│   ├── menu/[menuId]/page.tsx → /menu/:menuId
│   └── purpose/[id]/page.tsx  → /purpose/:id
├── (api)/
│   └── api/
│       └── chains/route.ts    → /api/chains
├── page.tsx                   → /
└── layout.tsx
```

### 4.2 使用例

```
# このプロジェクトの構成
app/
├── (pages)/           # ページ系をまとめる
│   ├── chains/
│   ├── menu/
│   ├── purpose/
│   └── [chain]/[purpose]/
├── (api)/             # API系をまとめる
│   └── api/
│       ├── chains/
│       └── menus/
├── page.tsx           # トップページ
├── layout.tsx         # ルートレイアウト
└── not-found.tsx      # 404ページ
```

### 4.3 Route Groups の利点

- URLを変えずにファイル整理
- 異なるレイアウトを適用可能
- チーム開発での責任分担が明確に

---

## 5. レイアウト

### 5.1 ルートレイアウト

```typescript
// app/layout.tsx
import { ReactNode } from 'react';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### 5.2 ネストしたレイアウト

```typescript
// app/chains/layout.tsx
import { ReactNode } from 'react';

export default function ChainsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="chains-container">
      <nav>チェーン店ナビゲーション</nav>
      {children}
    </div>
  );
}
```

---

## 6. Server Components vs Client Components

### 6.1 Server Components（デフォルト）

```typescript
// サーバーコンポーネント（デフォルト）
// データベースに直接アクセス可能

import { getMenuById } from '@/lib/db/queries';

export default async function MenuPage({ params }: Props) {
  const { menuId } = await params;
  const menu = getMenuById(menuId);  // 直接DBアクセス

  return <div>{menu.menuName}</div>;
}
```

### 6.2 Client Components

```typescript
// クライアントコンポーネント
// インタラクティブな機能が必要な場合

'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

### 6.3 使い分け

| Server Components | Client Components |
|-------------------|-------------------|
| データフェッチ | ユーザーインタラクション |
| バックエンドリソースアクセス | ブラウザAPIの使用 |
| 機密情報の処理 | useState, useEffect |
| 大きな依存関係 | イベントハンドラ |

---

## 7. 静的生成（SSG）

### 7.1 generateStaticParams

動的ルートを事前にビルドする。

```typescript
// app/menu/[menuId]/page.tsx
import { getAllMenuIds } from '@/lib/db/queries';

// ビルド時に生成するパスを定義
export async function generateStaticParams() {
  const menuIds = getAllMenuIds();
  return menuIds.map((menuId) => ({ menuId }));
}

export default async function MenuPage({ params }: Props) {
  const { menuId } = await params;
  // ...
}
```

### 7.2 ビルド結果

```bash
npm run build

# 出力例
Route (app)
├ ● /menu/[menuId]
│   ├ /menu/matsuya-001
│   ├ /menu/matsuya-002
│   └ [+23 more paths]
```

---

## 8. メタデータ

### 8.1 静的メタデータ

```typescript
// app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ヘルシー検索',
  description: 'チェーン店のメニューをPFCで検索',
};
```

### 8.2 動的メタデータ

```typescript
// app/menu/[menuId]/page.tsx
import type { Metadata } from 'next';
import { getMenuById } from '@/lib/db/queries';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { menuId } = await params;
  const menu = getMenuById(menuId);

  if (!menu) {
    return { title: 'メニューが見つかりません' };
  }

  return {
    title: `${menu.menuName} | ヘルシー検索`,
    description: `${menu.menuName}の栄養成分・PFCバランス`,
    openGraph: {
      title: `${menu.menuName} | ヘルシー検索`,
      description: `カロリー: ${menu.calories}kcal, タンパク質: ${menu.protein}g`,
    },
  };
}
```

---

## 9. サイトマップと robots.txt

### 9.1 サイトマップ

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllChains, getAllMenuIds } from '@/lib/db/queries';

const BASE_URL = 'https://healthy-chain.jp';

export default function sitemap(): MetadataRoute.Sitemap {
  const chains = getAllChains();
  const menuIds = getAllMenuIds();
  const now = new Date().toISOString();

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // チェーン店ページ
  const chainPages: MetadataRoute.Sitemap = chains.map((chain) => ({
    url: `${BASE_URL}/chains/${chain.chainId}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...chainPages];
}
```

ビルド時に `/sitemap.xml` が自動生成される。

### 9.2 robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/api/',
    },
    sitemap: 'https://healthy-chain.jp/sitemap.xml',
  };
}
```

---

## 10. API Routes

### 10.1 基本的なAPI

```typescript
// app/api/chains/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllChains } from '@/lib/db/queries';

export async function GET() {
  const chains = getAllChains();
  return NextResponse.json({ data: chains });
}
```

### 10.2 動的API

```typescript
// app/api/chains/[chainId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getChainById } from '@/lib/db/queries';

type Context = {
  params: Promise<{ chainId: string }>;
};

export async function GET(request: NextRequest, context: Context) {
  const { chainId } = await context.params;
  const chain = getChainById(chainId);

  if (!chain) {
    return NextResponse.json(
      { error: 'Chain not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: chain });
}
```

### 10.3 クエリパラメータ

```typescript
// app/api/menus/route.ts
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const chainId = searchParams.get('chainId');
  const minProtein = searchParams.get('minProtein');

  // クエリに基づいてデータを取得
  // ...
}
```

---

## 11. ナビゲーション

### 11.1 Link コンポーネント

```typescript
import Link from 'next/link';

export function Navigation() {
  return (
    <nav>
      <Link href="/">ホーム</Link>
      <Link href="/chains">チェーン店一覧</Link>
      <Link href="/chains/ootoya">大戸屋</Link>
    </nav>
  );
}
```

### 11.2 プログラマティックナビゲーション

```typescript
'use client';

import { useRouter } from 'next/navigation';

export function SearchForm() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    router.push(`/search?q=${query}`);
  };

  return (
    <button onClick={() => handleSearch('高タンパク')}>
      検索
    </button>
  );
}
```

---

## 12. このプロジェクトでの活用

### 12.1 ディレクトリ構成

```
app/
├── (pages)/                    # ページ系
│   ├── chains/
│   │   ├── page.tsx           # /chains（チェーン店一覧）
│   │   └── [chainId]/
│   │       └── page.tsx       # /chains/:chainId（チェーン店詳細）
│   ├── menu/
│   │   └── [menuId]/
│   │       └── page.tsx       # /menu/:menuId（メニュー詳細）
│   ├── purpose/
│   │   └── [purposeId]/
│   │       └── page.tsx       # /purpose/:purposeId（目的別一覧）
│   └── [chain]/
│       └── [purpose]/
│           └── page.tsx       # /:chain/:purpose（チェーン×目的）
├── (api)/                      # API系
│   └── api/
│       ├── chains/
│       └── menus/
├── page.tsx                    # /（トップページ）
├── layout.tsx                  # ルートレイアウト
├── globals.css
├── not-found.tsx              # 404ページ
├── sitemap.ts                 # サイトマップ
└── robots.ts                  # robots.txt
```

### 12.2 ページ数

```
ビルド時の出力:
- 静的ページ: 2件（/, /chains）
- チェーン詳細: 5件
- 目的別一覧: 5件
- チェーン×目的: 25件
- メニュー詳細: 25件
- API: 5エンドポイント

合計: 約70ページ
```

---

## 13. まとめ

### 13.1 App Router の利点

1. **Server Components** - パフォーマンス向上
2. **レイアウト** - コードの再利用
3. **Route Groups** - ファイル整理
4. **静的生成** - SEO対策
5. **型安全** - TypeScriptとの相性

### 13.2 学習の順序

```
1. 基本的なルーティング（page.tsx）
2. 動的ルート（[param]）
3. レイアウト（layout.tsx）
4. Server/Client Components
5. 静的生成（generateStaticParams）
6. メタデータ（generateMetadata）
7. Route Groups
8. API Routes
```
