# サイトマップ・robots.txt 自動生成ガイド

## 1. そもそもサイトマップって何？

### 1.1 サイトマップの役割

```
あなたのサイト          Google
    │                    │
    │  「うちのサイトには  │
    │   こんなページが    │
    │   ありますよ！」    │
    │ ─────────────────→ │
    │   sitemap.xml      │
    │                    │
    │  「了解！全部       │
    │   チェックするね」  │
    │ ←───────────────── │
```

**sitemap.xml = サイトのページ一覧表**

Googleに「このサイトにはこんなページがあるよ」と教えるためのファイル。

### 1.2 robots.txt の役割

```
robots.txt = 「ここは見ないで」リスト

Google: 「このサイト見に来たよ」
サイト: 「/api/ は見なくていいよ」
Google: 「了解、それ以外を見るね」
```

---

## 2. 従来の方法 → 面倒くさい

### 2.1 手動で書く場合

```xml
<!-- sitemap.xml を手で書く -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
  </url>
  <url>
    <loc>https://example.com/about</loc>
  </url>
  <url>
    <loc>https://example.com/contact</loc>
  </url>
  <!-- ページ増えるたびに手動追加... -->
</urlset>
```

**問題点:**
- ページ追加するたびに手動更新
- 忘れがち
- 間違いやすい

---

## 3. Next.js の方法 → 自動生成！

### 3.1 魔法のファイル: sitemap.ts

`app/sitemap.ts` を作るだけで、Next.js が自動で XML を生成してくれる。

```
app/
└── sitemap.ts  ←これを作る

ビルドすると...

/sitemap.xml  ←これが自動で生成される！
```

### 3.2 最小限の例

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://example.com' },
    { url: 'https://example.com/about' },
  ];
}
```

これだけで `/sitemap.xml` が生成される:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com</loc>
  </url>
  <url>
    <loc>https://example.com/about</loc>
  </url>
</urlset>
```

---

## 4. このプロジェクトでの使い方

### 4.1 やりたいこと

```
登録したいページ:
- /                      トップページ
- /chains                チェーン店一覧
- /chains/ootoya         大戸屋
- /chains/sukiya         すき家
- /purpose/protein       高タンパク一覧
- /menu/matsuya-001      メニュー詳細
- ... （全部で60ページくらい）

→ 手動は無理！自動化したい
```

### 4.2 実際のコード

```typescript
// app/sitemap.ts
import { MetadataRoute } from "next";
import { getAllChains, getAllMenuIds, purposes } from "@/lib/db/queries";

const BASE_URL = "https://healthy-chain.jp";

export default function sitemap(): MetadataRoute.Sitemap {
  // DBからデータを取得
  const chains = getAllChains();        // [大戸屋, すき家, ...]
  const menuIds = getAllMenuIds();      // [matsuya-001, matsuya-002, ...]
  const purposeIds = Object.keys(purposes); // [muscle, diet, ...]

  const now = new Date().toISOString();

  // 1. 固定ページ
  const staticPages = [
    { url: BASE_URL, priority: 1.0 },
    { url: `${BASE_URL}/chains`, priority: 0.9 },
  ];

  // 2. チェーン店ページ（DBから自動生成）
  const chainPages = chains.map((chain) => ({
    url: `${BASE_URL}/chains/${chain.chainId}`,
    // → /chains/ootoya, /chains/sukiya, ...
  }));

  // 3. 目的別ページ
  const purposePages = purposeIds.map((id) => ({
    url: `${BASE_URL}/purpose/${id}`,
    // → /purpose/muscle, /purpose/diet, ...
  }));

  // 4. メニュー詳細ページ
  const menuPages = menuIds.map((id) => ({
    url: `${BASE_URL}/menu/${id}`,
    // → /menu/matsuya-001, /menu/matsuya-002, ...
  }));

  // 全部まとめて返す
  return [...staticPages, ...chainPages, ...purposePages, ...menuPages];
}
```

### 4.3 ポイント

```
DBから取得 → 配列に変換 → 返す

これだけで:
- チェーン店が増えたら自動で追加
- メニューが増えたら自動で追加
- 手動更新不要！
```

---

## 5. 生成の流れ

### 5.1 図解

```
┌─────────────────────────────────────────────────────┐
│  npm run build                                      │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  app/sitemap.ts を実行                              │
│                                                     │
│  1. getAllChains() → [ootoya, sukiya, ...]         │
│  2. getAllMenuIds() → [matsuya-001, ...]           │
│  3. URL配列を作成                                   │
│  4. return で返す                                   │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  Next.js が XML に変換                              │
│                                                     │
│  <?xml version="1.0"?>                             │
│  <urlset>                                          │
│    <url><loc>https://...</loc></url>               │
│    ...                                             │
│  </urlset>                                         │
└─────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────┐
│  /sitemap.xml としてアクセス可能に                  │
└─────────────────────────────────────────────────────┘
```

### 5.2 確認方法

```bash
# 開発中
npm run dev
# → http://localhost:3000/sitemap.xml でアクセス

# ビルド後
npm run build
# → ビルド出力に表示される
# Route (app)
# ├ ○ /sitemap.xml    ← これ
```

---

## 6. robots.txt も同じ仕組み

### 6.1 コード

```typescript
// app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",        // 全てのクローラーに対して
      allow: "/",            // 基本的に全部OK
      disallow: "/api/",     // APIは見なくていい
    },
    sitemap: "https://healthy-chain.jp/sitemap.xml",
  };
}
```

### 6.2 生成結果

```
User-Agent: *
Allow: /
Disallow: /api/

Sitemap: https://healthy-chain.jp/sitemap.xml
```

---

## 7. オプション項目

### 7.1 使える設定

```typescript
{
  url: "https://example.com/page",  // 必須: ページURL

  lastModified: new Date(),         // 最終更新日
  changeFrequency: "weekly",        // 更新頻度
  priority: 0.8,                    // 重要度 (0.0〜1.0)
}
```

### 7.2 changeFrequency の目安

```
"daily"   → トップページ（毎日更新）
"weekly"  → カテゴリページ（週1更新）
"monthly" → 詳細ページ（月1更新）
"yearly"  → 利用規約など（ほぼ変わらない）
```

### 7.3 priority の目安

```
1.0  → トップページ（最重要）
0.9  → 主要カテゴリ
0.8  → 詳細ページ
0.6  → 末端ページ
0.3  → 補助ページ
```

---

## 8. まとめ

### 8.1 やること

```
1. app/sitemap.ts を作る
2. URL配列を return する
3. npm run build

以上！XMLは自動生成される
```

### 8.2 メリット

```
Before:
  ページ追加 → sitemap.xml を手動編集 → 忘れる → SEO低下

After:
  ページ追加 → ビルド → 自動反映！
```

### 8.3 このプロジェクトの場合

```
app/sitemap.ts
  ↓ ビルド
/sitemap.xml（約60ページ分のURL）

app/robots.ts
  ↓ ビルド
/robots.txt（クローラー設定）
```
