# SSG（Static Site Generation）学習ガイド

## 1. SSGとは

### 1.1 概要

SSG（Static Site Generation）は、ビルド時にHTMLを事前生成する手法。
ユーザーがアクセスする前にページが完成している。

```
ビルド時:
  データベース → HTML生成 → 静的ファイル

アクセス時:
  ユーザー → CDN → 静的HTML（超高速）
```

### 1.2 レンダリング方式の比較

| 方式 | 生成タイミング | 特徴 |
|------|---------------|------|
| SSG | ビルド時 | 最速、SEO最強 |
| SSR | リクエスト時 | 常に最新、サーバー負荷あり |
| CSR | ブラウザ | インタラクティブ、初期表示遅い |
| ISR | ビルド時 + 再生成 | SSG + 定期更新 |

### 1.3 SSGが適している場面

```
✅ 適している:
- ブログ、ドキュメント
- ECサイトの商品ページ
- このプロジェクト（メニュー情報は頻繁に変わらない）

❌ 不向き:
- リアルタイムデータ（株価、チャット）
- ユーザー固有のコンテンツ
- 大量のページ（ビルド時間が長い）
```

---

## 2. Next.jsでのSSG実装

### 2.1 基本的なSSG

`page.tsx` にデータ取得を書くだけで自動的にSSG。

```typescript
// app/chains/page.tsx
import { getAllChains } from '@/lib/db/queries';

export default function ChainsPage() {
  // ビルド時にDBからデータ取得
  const chains = getAllChains();

  return (
    <ul>
      {chains.map((chain) => (
        <li key={chain.chainId}>{chain.chainName}</li>
      ))}
    </ul>
  );
}
```

### 2.2 動的ルートのSSG

`generateStaticParams` で事前にパスを定義。

```typescript
// app/menu/[menuId]/page.tsx
import { getAllMenuIds, getMenuById } from '@/lib/db/queries';

// ビルド時に生成するパスを返す
export async function generateStaticParams() {
  const menuIds = getAllMenuIds();

  // 例: [{ menuId: 'matsuya-001' }, { menuId: 'matsuya-002' }, ...]
  return menuIds.map((menuId) => ({ menuId }));
}

// 各ページのコンポーネント
export default async function MenuPage({
  params,
}: {
  params: Promise<{ menuId: string }>;
}) {
  const { menuId } = await params;
  const menu = getMenuById(menuId);

  return <div>{menu?.menuName}</div>;
}
```

### 2.3 複数パラメータのSSG

```typescript
// app/[chain]/[purpose]/page.tsx
import { getAllChains, purposes } from '@/lib/db/queries';

export async function generateStaticParams() {
  const chains = getAllChains();
  const purposeIds = Object.keys(purposes);

  // 5チェーン × 5目的 = 25パターン
  const params = [];
  for (const chain of chains) {
    for (const purposeId of purposeIds) {
      params.push({
        chain: chain.chainId,
        purpose: purposeId,
      });
    }
  }
  return params;
}

// 出力例:
// [
//   { chain: 'ootoya', purpose: 'muscle' },
//   { chain: 'ootoya', purpose: 'diet' },
//   { chain: 'sukiya', purpose: 'muscle' },
//   ...
// ]
```

---

## 3. ビルド結果の確認

### 3.1 ビルドコマンド

```bash
npm run build
```

### 3.2 出力の見方

```
Route (app)
┌ ○ /                          # ○ = 静的（SSG）
├ ○ /_not-found
├ ● /[chain]/[purpose]         # ● = SSG（generateStaticParams使用）
│ ├ /ootoya/muscle
│ ├ /ootoya/diet
│ └ [+22 more paths]
├ ƒ /api/chains                # ƒ = 動的（API）
├ ○ /chains
├ ● /chains/[chainId]
│ ├ /chains/ootoya
│ └ [+4 more paths]
└ ● /menu/[menuId]
    ├ /menu/matsuya-001
    └ [+24 more paths]

○  (Static)   静的HTML
●  (SSG)      generateStaticParams使用
ƒ  (Dynamic)  サーバーで動的処理
```

### 3.3 生成されたファイル

```
.next/
└── server/
    └── app/
        ├── chains/
        │   ├── ootoya.html      # 事前生成されたHTML
        │   ├── sukiya.html
        │   └── ...
        └── menu/
            ├── matsuya-001.html
            └── ...
```

---

## 4. このプロジェクトでの活用

### 4.1 ページ構成

```
静的生成されるページ:

/                           # トップページ（1ページ）
/chains                     # チェーン店一覧（1ページ）
/chains/[chainId]           # チェーン店詳細（5ページ）
/purpose/[purposeId]        # 目的別一覧（5ページ）
/[chain]/[purpose]          # チェーン×目的（25ページ）
/menu/[menuId]              # メニュー詳細（25ページ）

合計: 約62ページがビルド時に生成
```

### 4.2 データフロー

```
ビルド時:
  lib/db/seed.ts（データ）
       ↓
  lib/db/queries.ts（クエリ関数）
       ↓
  generateStaticParams（パス生成）
       ↓
  各page.tsx（HTML生成）
       ↓
  .next/（静的ファイル）

本番環境:
  ユーザー → CDN → 静的HTML
  （データベースアクセスなし = 高速）
```

### 4.3 メリット

```
1. 超高速
   - HTMLが事前生成済み
   - CDN配信可能
   - サーバー負荷ゼロ

2. SEO最強
   - クローラーが完全なHTMLを取得
   - OGPも正しく設定される

3. 安価
   - Vercel無料枠で運用可能
   - サーバーレス
```

---

## 5. ISR（Incremental Static Regeneration）

### 5.1 ISRとは

SSGの発展形。ビルド後もページを再生成できる。

```typescript
// 60秒ごとに再生成
export const revalidate = 60;

export default function Page() {
  // ...
}
```

### 5.2 使いどころ

```
SSG:
  - メニュー情報（週1回更新程度）
  - チェーン店情報

ISR:
  - 価格が頻繁に変わる場合
  - ランキング（毎日更新）
```

---

## 6. 注意点

### 6.1 ビルド時間

```
ページ数が多いとビルド時間が長くなる

対策:
- 本当に必要なページだけSSG
- 重要でないページはSSRに
```

### 6.2 データ更新

```
SSGはビルド時のデータを使用

データ更新時:
1. データ変更
2. 再ビルド（npm run build）
3. 再デプロイ

→ CI/CDで自動化するのが一般的
```

### 6.3 動的コンテンツ

```
SSGページでも動的要素は可能:
- Client Componentsで動的部分を実装
- APIから追加データを取得
```

---

## 7. まとめ

```
SSGの流れ:
1. generateStaticParams でパスを定義
2. ビルド時にHTMLを生成
3. CDNから静的ファイルを配信

このプロジェクト:
- 約62ページをSSGで事前生成
- データベースアクセスはビルド時のみ
- 本番環境は超高速
```
