# Route Groups 学習ガイド

## 1. Route Groups とは

### 1.1 概要

`(フォルダ名)` で囲むと、**URLに影響せずに**ファイルを整理できる機能。

```
従来:
  app/
  ├── api/chains/route.ts      → /api/chains
  ├── chains/page.tsx          → /chains
  └── menu/[id]/page.tsx       → /menu/:id

  → ページとAPIが混在して見にくい

Route Groups使用後:
  app/
  ├── (api)/
  │   └── api/chains/route.ts  → /api/chains（URLは同じ）
  ├── (pages)/
  │   ├── chains/page.tsx      → /chains（URLは同じ）
  │   └── menu/[id]/page.tsx   → /menu/:id（URLは同じ）

  → ファイル整理されるがURLは変わらない
```

### 1.2 ポイント

```
(フォルダ名) の括弧は:
  - URLには含まれない
  - ファイル整理のためだけ
  - 複数のRoute Groupsを作れる
```

---

## 2. 基本的な使い方

### 2.1 構文

```
app/
└── (グループ名)/
    └── 実際のルート/
        └── page.tsx
```

### 2.2 例

```
app/
├── (marketing)/
│   ├── about/page.tsx         → /about
│   └── contact/page.tsx       → /contact
├── (shop)/
│   ├── products/page.tsx      → /products
│   └── cart/page.tsx          → /cart
└── page.tsx                   → /
```

---

## 3. このプロジェクトでの活用

### 3.1 Before（整理前）

```
app/
├── api/
│   ├── chains/route.ts
│   └── menus/route.ts
├── chains/
│   ├── page.tsx
│   └── [chainId]/page.tsx
├── menu/
│   └── [menuId]/page.tsx
├── purpose/
│   └── [purposeId]/page.tsx
├── [chain]/
│   └── [purpose]/page.tsx
├── page.tsx
├── layout.tsx
├── sitemap.ts
└── robots.ts
```

問題点:
- ページとAPIが混在
- 何がページで何がAPIか分かりにくい

### 3.2 After（整理後）

```
app/
├── (api)/                        # API系をまとめる
│   └── api/
│       ├── chains/
│       │   ├── route.ts          → /api/chains
│       │   └── [chainId]/route.ts → /api/chains/:chainId
│       └── menus/
│           ├── route.ts          → /api/menus
│           ├── [menuId]/route.ts → /api/menus/:menuId
│           └── ranking/route.ts  → /api/menus/ranking
│
├── (pages)/                      # ページ系をまとめる
│   ├── chains/
│   │   ├── page.tsx              → /chains
│   │   └── [chainId]/page.tsx    → /chains/:chainId
│   ├── menu/
│   │   └── [menuId]/page.tsx     → /menu/:menuId
│   ├── purpose/
│   │   └── [purposeId]/page.tsx  → /purpose/:purposeId
│   └── [chain]/
│       └── [purpose]/page.tsx    → /:chain/:purpose
│
├── page.tsx                      → /
├── layout.tsx
├── not-found.tsx
├── sitemap.ts
└── robots.ts
```

メリット:
- ページとAPIが明確に分離
- ファイル構成が見やすい
- URLは変わらない

---

## 4. グループ別レイアウト

### 4.1 異なるレイアウトを適用

Route Groupsごとに異なるレイアウトを設定できる。

```
app/
├── (marketing)/
│   ├── layout.tsx              # マーケティング用レイアウト
│   ├── about/page.tsx
│   └── contact/page.tsx
├── (shop)/
│   ├── layout.tsx              # ショップ用レイアウト
│   ├── products/page.tsx
│   └── cart/page.tsx
└── layout.tsx                  # ルートレイアウト
```

```typescript
// app/(marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-theme">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}

// app/(shop)/layout.tsx
export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="shop-theme">
      <ShopHeader />
      <ShopSidebar />
      {children}
    </div>
  );
}
```

---

## 5. 複数のルートレイアウト

### 5.1 ルートレイアウトを分ける

```
app/
├── (main)/
│   ├── layout.tsx              # <html>, <body>を含む
│   └── page.tsx
├── (auth)/
│   ├── layout.tsx              # 別の<html>, <body>
│   ├── login/page.tsx
│   └── register/page.tsx
```

```typescript
// app/(main)/layout.tsx
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="main-app">{children}</body>
    </html>
  );
}

// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="auth-app">{children}</body>
    </html>
  );
}
```

---

## 6. 注意点

### 6.1 ルートの衝突

同じURLになるルートは作れない。

```
❌ エラーになる:
app/
├── (marketing)/
│   └── about/page.tsx          → /about
└── (shop)/
    └── about/page.tsx          → /about（衝突!）
```

### 6.2 グループ名の規則

```
✅ OK:
(pages)
(api)
(marketing)
(shop)
(auth)

❌ NG:
[pages]     # 動的ルートと混同
_pages      # Next.jsの特殊フォルダと混同
```

### 6.3 ネストの深さ

深くなりすぎないように注意。

```
❌ 避けるべき:
app/(group1)/(group2)/(group3)/page.tsx

✅ 推奨:
app/(pages)/chains/[chainId]/page.tsx
```

---

## 7. ユースケース

### 7.1 ページとAPIの分離

```
app/
├── (api)/api/...
└── (pages)/...
```

### 7.2 認証ページの分離

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
└── (app)/
    ├── dashboard/page.tsx
    └── settings/page.tsx
```

### 7.3 マルチテナント

```
app/
├── (tenant-a)/
│   └── ...
└── (tenant-b)/
    └── ...
```

### 7.4 A/Bテスト

```
app/
├── (variant-a)/
│   └── pricing/page.tsx
└── (variant-b)/
    └── pricing/page.tsx
```

---

## 8. まとめ

```
Route Groups の特徴:
- (フォルダ名) でURLに影響しない整理が可能
- グループごとに異なるレイアウトを適用できる
- ファイル構成を論理的に分けられる

このプロジェクト:
  (api)   → APIルートをまとめる
  (pages) → ページをまとめる

メリット:
- コードの見通しが良くなる
- チーム開発で責任範囲が明確
- URLは一切変わらない
```
