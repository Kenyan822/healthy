# 収益化戦略書

## 1. 概要

本ドキュメントでは、チェーン店ヘルシー検索サイトの収益化戦略を定義する。

### 1.1 収益モデル

| 収益源 | 比率（目標） | 特徴 |
|--------|-------------|------|
| Google AdSense | 35% | 安定収入、PV比例 |
| アフィリエイト | 45% | 高単価、CV依存 |
| サブスクリプション | 15% | 継続収入、LTV高 |
| その他 | 5% | 将来的な拡張 |

### 1.2 収益目標

| 期間 | 月間PV | 月間収益 |
|------|--------|---------|
| 6ヶ月後 | 10,000 | ¥30,000 |
| 12ヶ月後 | 50,000 | ¥100,000 |
| 18ヶ月後 | 100,000 | ¥200,000 |
| 24ヶ月後 | 300,000 | ¥500,000 |

---

## 2. Google AdSense

### 2.1 概要

Google AdSenseは、サイト訪問者に対して関連性の高い広告を自動配信し、クリックやインプレッションに応じて収益を得るサービス。

### 2.2 収益計算

```
月間収益 = PV × CTR × CPC

PV:  ページビュー数
CTR: クリック率（1-3%が一般的）
CPC: クリック単価（健康・フィットネス系は高め）
```

#### 想定収益シミュレーション

| 月間PV | CTR | CPC | 月間収益 |
|--------|-----|-----|---------|
| 10,000 | 1.5% | ¥30 | ¥4,500 |
| 50,000 | 2.0% | ¥35 | ¥35,000 |
| 100,000 | 2.0% | ¥40 | ¥80,000 |
| 300,000 | 2.5% | ¥45 | ¥337,500 |

### 2.3 AdSense申請要件

#### 必須条件

```
□ 独自ドメイン（無料ブログNG）
□ プライバシーポリシーページ
□ お問い合わせページ
□ 運営者情報
□ 30記事以上（目安）
□ 1記事1,000文字以上
□ オリジナルコンテンツ
□ 著作権侵害なし
```

#### 推奨条件

```
□ 運営期間3ヶ月以上
□ 月間1,000PV以上
□ 定期的な更新
□ サイトマップ設置
□ HTTPS対応
```

### 2.4 広告配置戦略

#### 配置位置

```
┌─────────────────────────────────┐
│           ヘッダー               │
├─────────────────────────────────┤
│ [広告1] レスポンシブ広告         │  ← 記事上
├─────────────────────────────────┤
│                                 │
│         記事本文                 │
│                                 │
├─────────────────────────────────┤
│ [広告2] インフィード広告         │  ← 記事中
├─────────────────────────────────┤
│                                 │
│       記事本文（続き）            │
│                                 │
├─────────────────────────────────┤
│ [広告3] レスポンシブ広告         │  ← 記事下
├─────────────────────────────────┤
│       関連記事                   │
├─────────────────────────────────┤
│ [広告4] サイドバー（PC）         │
└─────────────────────────────────┘
```

#### ページ別配置

| ページタイプ | 広告数 | 配置 |
|-------------|--------|------|
| チェーン店×目的 | 3 | 上・中・下 |
| メニュー詳細 | 2 | 上・下 |
| 駅×条件 | 3 | 上・中・下 |
| 組み合わせ提案 | 2 | 上・下 |

### 2.5 AdSenseコード実装

```typescript
// components/AdSense.tsx

'use client';

import { useEffect } from 'react';

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'fluid' | 'rectangle';
  style?: React.CSSProperties;
}

export const AdSense: React.FC<AdSenseProps> = ({
  adSlot,
  adFormat = 'auto',
  style = { display: 'block' }
}) => {
  useEffect(() => {
    try {
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="true"
    />
  );
};
```

```typescript
// app/layout.tsx

import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## 3. アフィリエイト

### 3.1 概要

アフィリエイトは、商品やサービスを紹介し、ユーザーが購入・申込みした際に報酬を得るモデル。AdSenseより高単価だが、CV（コンバージョン）が必要。

### 3.2 ターゲット商材

本サイトのユーザー（トレーニー、ダイエッター）と親和性の高い商材を選定。

#### カテゴリ別商材

| カテゴリ | 商材例 | 単価目安 |
|---------|--------|---------|
| ジム | チョコザップ、エニタイム | ¥3,000-10,000 |
| プロテイン | マイプロテイン、DNS | ¥500-2,000 |
| 宅配弁当 | ナッシュ、Muscle Deli | ¥2,000-5,000 |
| 完全栄養食 | ベースフード | ¥1,000-3,000 |
| サプリメント | iHerb、Amazon | ¥100-500 |
| ダイエット食品 | 各種 | ¥1,000-3,000 |

### 3.3 ASP（アフィリエイトサービスプロバイダ）

#### 主要ASP

| ASP | 特徴 | 登録URL |
|-----|------|---------|
| A8.net | 最大手、案件数最多 | https://www.a8.net/ |
| もしもアフィリエイト | Amazon提携可 | https://af.moshimo.com/ |
| バリューコマース | Yahoo!系、大手案件 | https://www.valuecommerce.ne.jp/ |
| afb | 美容・健康に強い | https://www.afi-b.com/ |
| アクセストレード | 金融・サービス系 | https://www.accesstrade.ne.jp/ |

#### 推奨ASP登録順序

```
1. A8.net（必須）
   - 審査なし、即日利用可能
   - ジム、宅配弁当、サプリメント案件多数

2. もしもアフィリエイト
   - Amazon、楽天提携可能
   - W報酬制度あり

3. バリューコマース
   - Yahoo!ショッピング提携
   - 大手案件

4. afb
   - 健康・美容案件に強い
   - 報酬振込が早い
```

### 3.4 推奨アフィリエイト案件

#### ジム系

| 案件 | ASP | 報酬 | 訴求ポイント |
|------|-----|------|-------------|
| チョコザップ | A8.net | ¥3,000-5,000 | 月額2,980円、24時間、無人 |
| エニタイムフィットネス | A8.net | ¥5,000-10,000 | 24時間、全国展開 |
| ゴールドジム | バリューコマース | ¥5,000 | 本格派、設備充実 |

**訴求例（記事内）:**
```
外食で栄養管理ができたら、次はジムで体を変えませんか？

▼ 月額2,980円で24時間使い放題
[チョコザップ公式サイトはこちら]
```

#### 宅配弁当系

| 案件 | ASP | 報酬 | 訴求ポイント |
|------|-----|------|-------------|
| ナッシュ | A8.net | ¥2,000-3,000 | 糖質30g以下、レンジ調理 |
| Muscle Deli | A8.net | ¥3,000-5,000 | 高タンパク、トレーニー向け |
| マッスルデリ | afb | ¥3,000 | PFC調整済み |

**訴求例:**
```
外食が面倒な日は、宅配弁当がおすすめ。
糖質30g以下、レンジで5分で完成。

▼ 初回限定300円OFF
[ナッシュ公式サイトはこちら]
```

#### プロテイン・サプリ系

| 案件 | ASP | 報酬 | 訴求ポイント |
|------|-----|------|-------------|
| マイプロテイン | A8.net | ¥500-1,500 | 最安値、セール頻繁 |
| iHerb | もしも | 5-10% | 海外サプリ、安い |
| Amazon | もしも | 2-3% | 何でも揃う |

#### 完全栄養食系

| 案件 | ASP | 報酬 | 訴求ポイント |
|------|-----|------|-------------|
| ベースフード | A8.net | ¥1,000-2,000 | パン・パスタ、栄養バランス |
| COMP | A8.net | ¥1,000 | ドリンクタイプ |

### 3.5 アフィリエイトリンク実装

```typescript
// components/AffiliateLink.tsx

interface AffiliateLinkProps {
  href: string;
  children: React.ReactNode;
  campaign?: string;
}

export const AffiliateLink: React.FC<AffiliateLinkProps> = ({
  href,
  children,
  campaign
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener sponsored"
      className="affiliate-link"
      data-campaign={campaign}
    >
      {children}
    </a>
  );
};
```

```typescript
// components/AffiliateBanner.tsx

interface AffiliateBannerProps {
  type: 'gym' | 'meal' | 'protein';
  size?: 'small' | 'medium' | 'large';
}

export const AffiliateBanner: React.FC<AffiliateBannerProps> = ({
  type,
  size = 'medium'
}) => {
  const banners = {
    gym: {
      title: '外食管理の次はジムで体を変える',
      description: '月額2,980円で24時間使い放題',
      href: 'https://px.a8.net/xxxxx',
      cta: 'チョコザップを見る'
    },
    meal: {
      title: '外食が面倒な日は宅配弁当',
      description: '糖質30g以下、レンジ5分',
      href: 'https://px.a8.net/xxxxx',
      cta: 'ナッシュを見る'
    },
    protein: {
      title: 'タンパク質が足りない時は',
      description: 'コスパ最強のプロテイン',
      href: 'https://px.a8.net/xxxxx',
      cta: 'マイプロテインを見る'
    }
  };

  const banner = banners[type];

  return (
    <div className={`affiliate-banner affiliate-banner--${size}`}>
      <p className="affiliate-banner__title">{banner.title}</p>
      <p className="affiliate-banner__description">{banner.description}</p>
      <a
        href={banner.href}
        target="_blank"
        rel="noopener sponsored"
        className="affiliate-banner__cta"
      >
        {banner.cta} →
      </a>
    </div>
  );
};
```

### 3.6 配置戦略

#### ページ別アフィリエイト配置

| ページタイプ | 配置位置 | 推奨案件 |
|-------------|----------|---------|
| チェーン店×高タンパク | 記事下 | ジム、プロテイン |
| チェーン店×低糖質 | 記事下 | 宅配弁当、ダイエット食品 |
| メニュー詳細 | サイドバー | 関連サプリ |
| 組み合わせ提案 | 記事中・下 | 宅配弁当、完全栄養食 |
| 駅×条件 | 記事下 | ジム（近くの店舗） |

#### 文脈に応じた訴求

```typescript
// lib/affiliate-matcher.ts

interface AffiliateRecommendation {
  type: string;
  reason: string;
  priority: number;
}

export function getAffiliateRecommendation(
  pageType: string,
  purpose?: string
): AffiliateRecommendation[] {
  const recommendations: AffiliateRecommendation[] = [];

  // 高タンパク系ページ
  if (purpose === '高タンパク' || purpose === 'muscle') {
    recommendations.push({
      type: 'gym',
      reason: '筋トレに興味がある可能性が高い',
      priority: 1
    });
    recommendations.push({
      type: 'protein',
      reason: 'タンパク質摂取に関心がある',
      priority: 2
    });
  }

  // 低糖質・ダイエット系ページ
  if (purpose === '低糖質' || purpose === 'ダイエット' || purpose === 'keto') {
    recommendations.push({
      type: 'meal',
      reason: '食事管理に関心がある',
      priority: 1
    });
    recommendations.push({
      type: 'gym',
      reason: 'ダイエット目的でジムも検討',
      priority: 2
    });
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
}
```

---

## 4. 収益最大化戦略

### 4.1 SEOによる流入最大化

```
収益 = PV × (AdSense収益率 + アフィリエイトCV率)

→ PVを増やすことが最重要
→ ロングテールSEOで検索流入を獲得
```

#### ロングテールキーワード戦略

| キーワードタイプ | 検索ボリューム | 競合 | 狙いやすさ |
|-----------------|---------------|------|-----------|
| 大戸屋 高タンパク | 100-500 | 低 | ◎ |
| 渋谷 ヘルシー ランチ | 500-1000 | 中 | ○ |
| タンパク質 30g 外食 | 100-300 | 低 | ◎ |

### 4.2 CVR（コンバージョン率）最適化

#### A/Bテスト項目

```
□ CTAボタンの色・文言
□ アフィリエイトバナーの位置
□ 訴求文のバリエーション
□ 画像の有無
```

#### ヒートマップ分析

- Microsoft Clarity（無料）を導入
- クリック位置、スクロール深度を分析
- 離脱ポイントを特定

### 4.3 リピーター獲得

#### メールマガジン（将来施策）

```
□ 新メニュー情報
□ 期間限定メニューのPFC情報
□ ダイエットTips
□ クーポン情報（アフィリエイト連携）
```

### 4.4 収益多角化（将来施策）

| 施策 | 難易度 | 収益性 | 優先度 |
|------|--------|--------|--------|
| サブスクリプション | 中 | 高 | 高 |
| 企業タイアップ記事 | 中 | 高 | 中 |
| 自社商品販売 | 高 | 高 | 低 |
| コンサルティング | 中 | 中 | 低 |

---

## 5. サブスクリプション（プラス会員）

### 5.1 概要

月額課金制のプラス会員サービスを提供し、無料ユーザーとの差別化された価値を提供する。

外食検索サービスの特性（使用頻度: 週2-3回程度）を考慮し、シンプルな1プラン構成とする。

#### 収益ポジション

| 収益源 | 比率（目標） | 特徴 |
|--------|-------------|------|
| Google AdSense | 35% | 安定収入、PV比例 |
| アフィリエイト | 45% | 高単価、CV依存 |
| **サブスクリプション** | **15%** | **継続収入、LTV高** |
| その他 | 5% | 将来的な拡張 |

### 5.2 プラン設計

#### 無料プラン vs プラスプラン

| 機能 | 無料 | プラス |
|------|------|--------|
| 月額料金 | ¥0 | **¥480** |
| 年額料金 | - | ¥4,800（2ヶ月分お得） |
| チェーン店検索 | ○ | ○ |
| 基本栄養情報（カロリー・P・F・C） | ○ | ○ |
| **コンビニ検索** | × | ○ |
| **お気に入り保存** | 5件まで | 無制限 |
| **組み合わせ検索** | × | ○ |
| **遠隔地検索** | × | ○ |
| **広告** | あり | 非表示 |

#### プラン設計の考え方

外食検索サービスとして自然な課金ポイントに絞り込み：

| 機能 | 価値 | 理由 |
|------|------|------|
| コンビニ追加 | ◎ | 対象店舗が増える＝価値が増える |
| お気に入り無制限 | ○ | よく行く店・メニューを保存 |
| 組み合わせ検索 | ○ | 複数メニューでPFCバランス調整（外食特化機能） |
| 遠隔地検索 | ○ | 出張・旅行前に調べたい需要 |
| 広告非表示 | ○ | 課金ユーザーへの当然の配慮 |

※ 食事記録・AI献立提案などは「あすけん」等の総合食事管理アプリの領域のため除外

### 5.3 機能詳細

#### コンビニ検索

対象コンビニ:
- セブンイレブン
- ローソン
- ファミリーマート
- ミニストップ

```typescript
// types/store.ts

type StoreType = 'chain' | 'convenience';

interface ConvenienceStore {
  id: string;
  name: string;
  type: 'convenience';
  menuCount: number;
}
```

**ユーザー価値:**
- チェーン店が近くにない時の代替選択肢
- コンビニでもPFCバランスを意識した選択が可能

#### 組み合わせ検索

複数メニューを組み合わせてPFCバランスを調整する機能。

```typescript
// types/combination.ts

interface CombinationSearch {
  menus: MenuItem[];
  totalNutrition: {
    calories: number;
    protein: number;
    fat: number;
    carb: number;
  };
}

// 使用例: サラダ + メイン + サイドで目標PFCに近づける
```

**ユーザー価値:**
- 単品では足りない栄養素を補完
- 「サラダ + メイン」などの組み合わせ提案

#### 遠隔地検索

現在地以外のエリアを検索できる機能。

```typescript
// types/search.ts

interface AreaSearch {
  station?: string;      // 駅名
  area?: string;         // エリア名
  prefecture?: string;   // 都道府県
}
```

**ユーザー価値:**
- 出張先・旅行先での事前リサーチ
- 引越し先での外食環境チェック

### 5.4 料金シミュレーション

#### 収益予測

| 月間アクティブユーザー | 無料 | プラス | 月間収益 |
|----------------------|------|--------|---------|
| 10,000 | 9,800 | 200 (2%) | ¥96,000 |
| 50,000 | 48,500 | 1,500 (3%) | ¥720,000 |
| 100,000 | 96,500 | 3,500 (3.5%) | ¥1,680,000 |

#### LTV（顧客生涯価値）計算

```
プラスプラン:
  月額 ¥480 × 平均継続月数 8ヶ月 = LTV ¥3,840

年額プラン:
  年額 ¥4,800 × 平均継続年数 1.5年 = LTV ¥7,200
```

### 5.5 決済システム

#### 推奨: Stripe

```typescript
// lib/stripe.ts

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// プラン定義
const PLANS = {
  plus_monthly: {
    priceId: 'price_plus_monthly',
    name: 'プラス（月額）',
    price: 480,
  },
  plus_yearly: {
    priceId: 'price_plus_yearly',
    name: 'プラス（年額）',
    price: 4800,
  },
};

// チェックアウトセッション作成
export async function createCheckoutSession(
  userId: string,
  planType: 'plus_monthly' | 'plus_yearly'
) {
  const plan = PLANS[planType];
  
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_URL}/subscription/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/subscription/cancel`,
    metadata: {
      userId,
      planType,
    },
  });

  return session;
}
```

#### Webhook処理

```typescript
// app/api/webhooks/stripe/route.ts

import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      // サブスク開始処理
      await handleSubscriptionCreated(event.data.object);
      break;
    case 'customer.subscription.updated':
      // プラン変更処理
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      // 解約処理
      await handleSubscriptionCanceled(event.data.object);
      break;
  }

  return NextResponse.json({ received: true });
}
```

### 5.6 ユーザー認証

#### 推奨: NextAuth.js + Prisma

```typescript
// lib/auth.ts

import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // サブスク情報をセッションに追加
      const subscription = await prisma.subscription.findUnique({
        where: { userId: user.id },
      });

      return {
        ...session,
        user: {
          ...session.user,
          id: user.id,
          plan: subscription?.plan ?? 'free', // 'free' | 'plus'
        },
      };
    },
  },
});
```

### 5.7 UI/UXデザイン

#### 価格表コンポーネント

```typescript
// components/PricingTable.tsx

'use client';

import { useState } from 'react';

interface PricingPlan {
  name: string;
  price: number;
  yearlyPrice?: number;
  features: string[];
  notIncluded?: string[];
  highlighted?: boolean;
  cta: string;
}

const plans: PricingPlan[] = [
  {
    name: '無料',
    price: 0,
    features: [
      'チェーン店検索',
      '基本栄養情報（カロリー・PFC）',
      'お気に入り5件まで',
    ],
    notIncluded: [
      'コンビニ検索',
      '組み合わせ検索',
      '遠隔地検索',
    ],
    cta: '無料で始める',
  },
  {
    name: 'プラス',
    price: 480,
    yearlyPrice: 4800,
    features: [
      '無料プランの全機能',
      'コンビニ検索',
      'お気に入り無制限',
      '組み合わせ検索',
      '遠隔地検索',
      '広告非表示',
    ],
    highlighted: true,
    cta: 'プラスを始める',
  },
];

export const PricingTable = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <div className="pricing-container">
      <div className="billing-toggle">
        <span>月額</span>
        <button onClick={() => setIsYearly(!isYearly)}>
          {isYearly ? '年額' : '月額'}
        </button>
        <span>年額（2ヶ月分お得）</span>
      </div>
      <div className="pricing-grid">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`pricing-card ${plan.highlighted ? 'pricing-card--highlighted' : ''}`}
          >
            <h3>{plan.name}</h3>
            <p className="price">
              <span className="price-amount">
                ¥{isYearly && plan.yearlyPrice
                  ? plan.yearlyPrice.toLocaleString()
                  : plan.price.toLocaleString()}
              </span>
              <span className="price-period">/{isYearly ? '年' : '月'}</span>
            </p>
            {isYearly && plan.yearlyPrice && (
              <p className="price-note">（月あたり¥400）</p>
            )}
            <ul>
              {plan.features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
              {plan.notIncluded?.map((feature) => (
                <li key={feature} className="not-included">× {feature}</li>
              ))}
            </ul>
            <button className="cta-button">{plan.cta}</button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 5.8 解約防止（チャーン対策）

#### 解約理由調査

```typescript
// components/CancelSurvey.tsx

const CANCEL_REASONS = [
  { id: 'price', label: '料金が高い' },
  { id: 'not_using', label: 'あまり使っていない' },
  { id: 'missing_feature', label: '欲しい機能がない' },
  { id: 'found_alternative', label: '他のサービスを使う' },
  { id: 'temporary', label: '一時的に休止したい' },
  { id: 'other', label: 'その他' },
];
```

#### リテンション施策

| 解約理由 | 対応策 |
|---------|--------|
| 料金が高い | 年額プラン提案（2ヶ月無料） |
| あまり使っていない | 使い方ガイド送付、リマインド設定 |
| 欲しい機能がない | 要望ヒアリング、開発ロードマップ共有 |
| 一時的に休止 | 休止プラン提案（月額¥100で情報保持） |

#### 年額プラン（割引）

| プラン | 月額 | 年額 | 割引率 |
|--------|------|------|--------|
| プラス | ¥480 | ¥4,800 (¥400/月) | 17% OFF |

### 5.9 店舗別カスタマイズ機能（プラス限定）

各チェーン店の実際のカスタマイズオプションに対応し、栄養値を再計算・合算する機能。

#### 実装パターン

| パターン | 内容 | 難易度 |
|---------|------|--------|
| A. 合算型 | 既存メニュー同士の栄養を足し算（セット・トッピング追加） | 低〜中 |
| B. 計算型 | パラメータ変更で栄養値を再計算（ライス量・グラム数） | 中〜高 |

#### チェーン別カスタマイズ一覧

##### CoCo壱番屋（パターンA+B / 優先度:高）
- **ライス量変更**（200g / 250g / 300g / 400g）→ 炭水化物が大きく変動
- **トッピング組み合わせシミュレーター** → 複数トッピングの栄養合算
- **辛さレベル表示** → カロリーへの影響は少ないが情報として有用

##### いきなり！ステーキ（パターンB / 優先度:高）
- 既にグラム別データあり（100g〜450g）
- **任意のグラム数で栄養計算** → スライダーUIで直感的に操作
- カット種類別（肩ロース・リブロース・ヒレ等）の比較

##### サブウェイ（パターンA+B / 優先度:中）
- **パンの種類変更** → 栄養値が変わる
- **トッピング増減** → 野菜多め/少なめで栄養再計算
- **ソース選択** → カロリー・脂質が変動
- **サイズ変更**（15cm / 30cm）

##### 丸亀製麺（パターンA / 優先度:中）
- 既にサイズ・温度データあり
- **天ぷらトッピング組み合わせ** → 天ぷら単品の栄養を合算

##### 吉野家 / すき家 / 松屋（パターンA / 優先度:中）
- **サイズ別比較UI** → 既存データを並べて比較表示
- **セット組み合わせ** → 味噌汁・サラダ・卵をつけた合計栄養

##### モスバーガー（パターンA / 優先度:中）
- **セットメニュー構成** → バーガー + サイド + ドリンクの合算
- **パティ変更**（ソイパティ / ダブル / トリプル）

##### 大戸屋 / やよい軒（パターンB / 優先度:低）
- **ごはん量変更** → 大盛り/少なめで炭水化物変化
- やよい軒: おかわり自由のため「おかわり1杯分」の栄養表示

##### リンガーハット（パターンB / 優先度:低）
- **麺量変更**（1.5倍 / 2倍）
- **野菜増量** → 食物繊維変化

##### なか卯（パターンA / 優先度:低）
- **卵の状態変更**（生卵 / 温泉卵 / なし）
- **セット組み合わせ**（うどん + 丼）

#### 導入優先順位

| 順位 | チェーン | 理由 |
|------|---------|------|
| 1 | CoCo壱番屋 | トッピング合算はUI映えが良く、ユーザー需要が高い |
| 2 | いきなり！ステーキ | 既存データでグラムスライダーが実装可能 |
| 3 | サブウェイ | カスタマイズ文化が根付いておりユーザーの期待値が高い |
| 4 | 丸亀製麺 | 天ぷら合算は実装がシンプル |
| 5 | 牛丼チェーン3社 | セット合算はデータ追加のみで対応可 |

### 5.10 サブスク導入ロードマップ

#### Phase 1: MVP（3-6ヶ月目）

```
□ NextAuth.js導入（Google認証）
□ Stripe連携
□ プラスプラン提供開始
□ コンビニ検索機能
□ お気に入り無制限
□ 広告非表示
```

**目標: 有料会員100人**

#### Phase 2: 機能拡充（6-12ヶ月目）

```
□ 組み合わせ検索機能
□ 遠隔地検索機能
□ 年額プラン追加
□ コンビニデータ拡充
□ 店舗別カスタマイズ機能（CoCo壱・いきなりステーキ）
```

**目標: 有料会員500人**

#### Phase 3: 改善・最適化（12-18ヶ月目）

```
□ ユーザーフィードバック反映
□ 検索精度向上
□ UI/UX改善
□ 対象店舗拡大
□ 店舗別カスタマイズ機能（サブウェイ・丸亀・牛丼チェーン）
```

**目標: 有料会員2,000人**

---

## 6. 収益トラッキング

### 6.1 KPI

| 指標 | 計測方法 | 目標 |
|------|---------|------|
| PV | Google Analytics | 月間10万以上 |
| AdSense収益 | AdSense管理画面 | 月間5万円以上 |
| アフィリエイト収益 | 各ASP管理画面 | 月間10万円以上 |
| CTR | AdSense | 2%以上 |
| CVR | ASP | 1%以上 |

### 6.2 トラッキング実装

```typescript
// lib/analytics.ts

export const trackEvent = (
  eventName: string,
  params: Record<string, any>
) => {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, params);
  }
};

// アフィリエイトクリック計測
export const trackAffiliateClick = (
  affiliateType: string,
  campaign: string,
  pageUrl: string
) => {
  trackEvent('affiliate_click', {
    affiliate_type: affiliateType,
    campaign,
    page_url: pageUrl
  });
};
```

```typescript
// 使用例
<AffiliateLink
  href="https://px.a8.net/xxxxx"
  onClick={() => trackAffiliateClick('gym', 'chocoZap', window.location.href)}
>
  チョコザップを見る
</AffiliateLink>
```

### 6.3 レポート

#### 週次レポート項目

```
□ PV推移
□ 検索流入キーワードトップ10
□ AdSense収益・CTR
□ アフィリエイト収益・CV数
□ 新規インデックスページ数
```

#### 月次レポート項目

```
□ 月間PV・UU
□ 月間収益合計
□ 収益源別内訳
□ 前月比較
□ 目標達成率
□ 改善施策の効果検証
```

---

## 7. 法的・規約対応

### 7.1 必須ページ

#### プライバシーポリシー

```markdown
# プライバシーポリシー

## 広告について

当サイトでは、第三者配信の広告サービス（Google AdSense）を利用しています。
広告配信事業者は、ユーザーの興味に応じた広告を表示するために
Cookie（クッキー）を使用することがあります。

## アフィリエイトについて

当サイトは、Amazon.co.jp、A8.net等のアフィリエイトプログラムに参加しています。
当サイト経由で商品を購入された場合、当サイトに報酬が支払われることがあります。

## アクセス解析について

当サイトでは、Google Analyticsを使用してアクセス情報を収集しています。
```

#### 免責事項

```markdown
# 免責事項

当サイトに掲載されている情報は、各チェーン店の公式サイトから取得したものですが、
正確性を保証するものではありません。

最新の栄養成分情報は、各チェーン店の公式サイトをご確認ください。

当サイトの情報を利用したことによるいかなる損害についても、
当サイトは責任を負いかねます。
```

### 7.2 広告表記

#### AdSense

```html
<!-- 広告であることを明示（任意だが推奨） -->
<p class="ad-label">スポンサーリンク</p>
<ins class="adsbygoogle" ...></ins>
```

#### アフィリエイト

```html
<!-- PRであることを明示（ステマ規制対応） -->
<p class="pr-label">PR</p>
<a href="..." rel="sponsored">商品リンク</a>
```

### 7.3 景品表示法対応

#### NG表現

```
× 「絶対に痩せる」
× 「確実に筋肉がつく」
× 「No.1」（根拠なし）
× 「業界最安値」（根拠なし）
```

#### OK表現

```
○ 「タンパク質が35g含まれています」（事実）
○ 「公式サイトによると...」（引用）
○ 「個人の感想です」（体験談の場合）
```

---

## 8. 収益化ロードマップ

### Phase 1: 基盤構築（0-3ヶ月）

```
□ サイト公開
□ Google Search Console登録
□ Google Analytics設定
□ プライバシーポリシー設置
□ A8.net登録
□ 30ページ以上公開
□ AdSense申請準備
```

**目標収益: ¥0**

### Phase 2: AdSense承認（3-6ヶ月）

```
□ AdSense申請・承認
□ 広告配置最適化
□ もしもアフィリエイト登録
□ アフィリエイトリンク設置開始
□ 100ページ以上公開
```

**目標収益: ¥5,000-10,000/月**

### Phase 3: 収益安定化（6-12ヶ月）

```
□ 月間1万PV達成
□ アフィリエイト案件拡大
□ A/Bテスト実施
□ 高収益ページの分析・横展開
□ 500ページ以上公開
```

**目標収益: ¥30,000-50,000/月**

### Phase 4: 収益拡大（12-24ヶ月）

```
□ 月間10万PV達成
□ 企業タイアップ検討
□ メールマガジン開始
□ 1,000ページ以上公開
```

**目標収益: ¥100,000-200,000/月**

### Phase 5: 収益最大化（24ヶ月以降）

```
□ 月間30万PV達成
□ 複数サイト展開検討
□ 新規収益源の開拓
```

**目標収益: ¥300,000+/月**

---

## 9. 収益シミュレーション

### 9.1 保守的シナリオ

| 月 | PV | AdSense | アフィリエイト | 合計 |
|----|-----|---------|--------------|------|
| 6 | 5,000 | ¥2,500 | ¥2,500 | ¥5,000 |
| 12 | 20,000 | ¥12,000 | ¥18,000 | ¥30,000 |
| 18 | 50,000 | ¥30,000 | ¥50,000 | ¥80,000 |
| 24 | 100,000 | ¥60,000 | ¥90,000 | ¥150,000 |

### 9.2 楽観的シナリオ

| 月 | PV | AdSense | アフィリエイト | 合計 |
|----|-----|---------|--------------|------|
| 6 | 10,000 | ¥6,000 | ¥14,000 | ¥20,000 |
| 12 | 50,000 | ¥35,000 | ¥65,000 | ¥100,000 |
| 18 | 150,000 | ¥100,000 | ¥150,000 | ¥250,000 |
| 24 | 300,000 | ¥200,000 | ¥300,000 | ¥500,000 |

### 9.3 損益分岐点

```
月間コスト（目安）:
- ドメイン: ¥100/月
- ホスティング: ¥0-3,000/月
- API費用: ¥0-5,000/月
合計: ¥100-8,000/月

損益分岐点: 月間¥10,000の収益
→ 約5,000-10,000PVで達成可能
```
