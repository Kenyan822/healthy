---
tags:
  - プロジェクト案
  - マネタイズ
  - SEO
  - プログラマティックSEO
  - 自動化
  - 資産構築
  - 健康
  - ダイエット
  - トレーニング
aliases:
  - チェーン店PFC検索
  - ヘルシー外食検索
  - トレーニー向け外食検索
  - ダイエット外食検索
created: 2026-01-02
updated: 2026-01-02 03:05
---

# チェーン店ヘルシー検索サイト - プロジェクト案

## 概要

トレーニーやダイエット中の女性をターゲットに、チェーン店の食事の PFC（タンパク質・脂質・炭水化物）やヘルシー度合いを数値化してまとめる Web サイト。プログラマティック SEO を活用し、数千〜数万ページを自動生成してロングテールキーワードでの検索流入を独占する。一度構築すれば継続的に検索流入が来る資産として機能する。

## 目的

個人利用を前提とした、データドリブンな SEO サイト。チェーン店の栄養成分データを構造化し、ユーザーが求めている「PFC バランス」「ヘルシー度合い」での検索・絞り込みを可能にする。食べログなど既存サービスが弱い領域を攻め、検索流入から広告収入やアフィリエイト収入を得る。

## なぜ確実に利益を出せるか

### 優位性

1. **データが明確で構造化されている**

   - PFC（タンパク質・脂質・炭水化物）は数値データ
   - プログラムで扱いやすい
   - チェーン店の公式データを使用可能

2. **競合の弱点を突ける**

   - 食べログは「美味しさ・雰囲気」がメイン
   - 「PFC バランス」での検索・絞り込みに弱い
   - ニッチだが熱量が高い層（トレーニー・ダイエッター）が確実に存在

3. **初期投資が少ない**

   - ドメイン、ホスティングのみ（月額数千円）
   - 開発時間のみで開始可能
   - 元本が不要

4. **継続的な収入**

   - 一度作れば長期間検索流入が来る
   - メンテナンスが少ない（定番メニュー中心）
   - 資産として残る

5. **スケール可能**
   - チェーン店数 × 駅数 × 条件 = 数万ページ生成可能
   - ページ数を増やすほど収入が増える
   - 自動化により拡張が容易

## 機能要件

### 1. キーワードリサーチ機能

**機能:**

- Google Keyword Planner で検索ボリュームを取得
- 競合分析（競合サイト数、難易度の算出）
- ロングテールキーワードの抽出
- 検索意図の分類（情報収集、比較、購入など）

**狙うべきキーワード戦略:**

#### A. 【チェーン店名 × 目的】（最優先）

キーワード例:

- 「大戸屋 高タンパク メニュー」
- 「マクドナルド 低脂質」
- 「すき家 ダイエット 組み合わせ」
- 「スタバ 低糖質 フード」
- 「やよい軒 筋肉食堂 みたいな」

ページ内容: そのチェーンの全メニューの中から、条件（例：タンパク質 20g 以上、脂質 10g 以下）を満たすものをランキング形式で表示。

#### B. 【駅名 × チェーン・条件】（ユーザー検索）

キーワード例:

- 「渋谷駅 高タンパク ランチ」
- 「東横線 一人飯 ダイエット」
- 「新宿 ヘルシー チェーン店」
- 「渋谷 ヘルシー」
- 「東横線 チェーン」

ページ内容:

- その駅にあるチェーン店（大戸屋、やよい軒、サブウェイなど）を抽出
- その各店舗の「おすすめヘルシーメニュー」をトップに表示
- 「迷ったらここに行け！」という即決リストにする

#### C. 【メニュー単体】（ロングテール）

キーワード例:

- 「チキンかあさん煮定食 PFC」
- 「牛丼ライト カロリー」
- 「ビッグマック タンパク質」

#### D. 【栄養素 × 目標量】（組み合わせ提案）

キーワード例:

- 「タンパク質 30g メニュー 組み合わせ」
- 「タンパク質 40g 外食」
- 「糖質 50g 以下 チェーン店」
- 「糖質 30g 以下 ランチ」
- 「脂質 20g 以下 メニュー」
- 「タンパク質 30g 糖質 50g 以下」

ページ内容: 指定した栄養素量を達成できるメニュー組み合わせをランキング形式で表示。複数のメニューを組み合わせて目標を達成する方法を提示。

**実装:**

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd

class KeywordResearcher:
    def __init__(self):
        self.api_key = os.getenv('GOOGLE_API_KEY')

    def get_search_volume(self, keyword):
        """検索ボリュームを取得"""
        # Google Keyword Planner API またはスクレイピング
        pass

    def analyze_competition(self, keyword):
        """競合分析"""
        # Google 検索結果から競合サイト数を取得
        # 競合のドメイン権威性を分析
        pass

    def extract_long_tail_keywords(self, seed_keywords):
        """ロングテールキーワードを抽出"""
        # チェーン店名 × 目的の組み合わせを生成
        chains = ['大戸屋', 'マクドナルド', 'すき家', 'やよい軒', 'スタバ']
        purposes = ['高タンパク', '低脂質', '低糖質', 'ダイエット', 'ヘルシー']

        keywords = []
        for chain in chains:
            for purpose in purposes:
                keywords.append(f"{chain} {purpose}")

        return keywords

    def classify_search_intent(self, keyword):
        """検索意図を分類"""
        # 情報収集、比較、購入などに分類
        # コンテンツタイプを決定
        pass
```

### 2. データソース管理機能

**データソース:**

- **チェーン店公式データ**: 栄養成分表（PDF、Web ページ）
- **スクレイピング**: 規約遵守の範囲内でデータ取得
- **手動入力**: 初期は主要チェーン 5-10 社に絞る

**データベース構成:**

#### ① メニュー DB（心臓部）

| カラム名     | 型               | 説明                                    |
| ------------ | ---------------- | --------------------------------------- |
| menu_id      | TEXT PRIMARY KEY | メニュー ID                             |
| chain_id     | TEXT             | チェーン ID                             |
| menu_name    | TEXT             | メニュー名                              |
| price        | INTEGER          | 価格（円）                              |
| calories     | INTEGER          | カロリー（kcal）                        |
| protein      | REAL             | タンパク質（g）                         |
| fat          | REAL             | 脂質（g）                               |
| carb         | REAL             | 炭水化物（g）                           |
| muscle_score | REAL             | マッスルスコア（タンパク質 ÷ カロリー） |
| keto_score   | REAL             | ケトスコア（糖質が低い順）              |
| health_score | REAL             | ヘルシースコア（独自指標）              |
| category     | TEXT             | カテゴリ（定食、丼、ハンバーガーなど）  |
| is_seasonal  | BOOLEAN          | 季節限定フラグ                          |
| updated_at   | DATETIME         | 更新日時                                |

#### ② チェーン店 DB

| カラム名           | 型               | 説明                                   |
| ------------------ | ---------------- | -------------------------------------- |
| chain_id           | TEXT PRIMARY KEY | チェーン ID                            |
| chain_name         | TEXT             | チェーン名                             |
| chain_name_en      | TEXT             | チェーン名（英語）                     |
| category           | TEXT             | カテゴリ（定食、丼、ハンバーガーなど） |
| official_url       | TEXT             | 公式 URL                               |
| nutrition_data_url | TEXT             | 栄養成分データ URL                     |

#### ③ 店舗・エリア DB（ロケーション展開用）

| カラム名     | 型               | 説明               |
| ------------ | ---------------- | ------------------ |
| store_id     | TEXT PRIMARY KEY | 店舗 ID            |
| chain_id     | TEXT             | チェーン ID        |
| store_name   | TEXT             | 店舗名             |
| station_name | TEXT             | 最寄駅             |
| station_line | TEXT             | 路線名             |
| distance     | INTEGER          | 駅からの距離（分） |
| address      | TEXT             | 住所               |
| has_wifi     | BOOLEAN          | Wi-Fi 有無         |
| latitude     | REAL             | 緯度               |
| longitude    | REAL             | 経度               |

#### ④ 駅 DB

| カラム名     | 型               | 説明     |
| ------------ | ---------------- | -------- |
| station_id   | TEXT PRIMARY KEY | 駅 ID    |
| station_name | TEXT             | 駅名     |
| station_line | TEXT             | 路線名   |
| prefecture   | TEXT             | 都道府県 |
| city         | TEXT             | 市区町村 |
| latitude     | REAL             | 緯度     |
| longitude    | REAL             | 経度     |

**実装:**

```python
import sqlite3
import requests
from datetime import datetime
import pandas as pd

class DataSourceManager:
    def __init__(self, db_path='chain_restaurant.db'):
        self.conn = sqlite3.connect(db_path)
        self.setup_tables()

    def setup_tables(self):
        """テーブル作成"""
        # チェーン店テーブル
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS chains (
                chain_id TEXT PRIMARY KEY,
                chain_name TEXT NOT NULL,
                chain_name_en TEXT,
                category TEXT,
                official_url TEXT,
                nutrition_data_url TEXT
            )
        ''')

        # メニューテーブル
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS menus (
                menu_id TEXT PRIMARY KEY,
                chain_id TEXT NOT NULL,
                menu_name TEXT NOT NULL,
                price INTEGER,
                calories INTEGER,
                protein REAL,
                fat REAL,
                carb REAL,
                muscle_score REAL,
                keto_score REAL,
                health_score REAL,
                category TEXT,
                is_seasonal BOOLEAN DEFAULT 0,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (chain_id) REFERENCES chains(chain_id)
            )
        ''')

        # 店舗テーブル
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS stores (
                store_id TEXT PRIMARY KEY,
                chain_id TEXT NOT NULL,
                store_name TEXT NOT NULL,
                station_name TEXT,
                station_line TEXT,
                distance INTEGER,
                address TEXT,
                has_wifi BOOLEAN DEFAULT 0,
                latitude REAL,
                longitude REAL,
                FOREIGN KEY (chain_id) REFERENCES chains(chain_id)
            )
        ''')

        # 駅テーブル
        self.conn.execute('''
            CREATE TABLE IF NOT EXISTS stations (
                station_id TEXT PRIMARY KEY,
                station_name TEXT NOT NULL,
                station_line TEXT,
                prefecture TEXT,
                city TEXT,
                latitude REAL,
                longitude REAL
            )
        ''')

        self.conn.commit()

    def calculate_scores(self, protein, fat, carb, calories):
        """独自スコアを計算"""
        # マッスルスコア: タンパク質(g) ÷ カロリー が高い順
        muscle_score = protein / calories if calories > 0 else 0

        # ケトスコア: 糖質が低い順（糖質が低いほど高いスコア）
        keto_score = 100 - (carb * 2) if carb <= 50 else 0

        # ヘルシースコア: 総合的な指標
        # タンパク質が多い、脂質が少ない、炭水化物が適度 = 高スコア
        health_score = (protein * 2) - (fat * 1.5) - (carb * 0.5) if calories > 0 else 0

        return {
            'muscle_score': round(muscle_score, 3),
            'keto_score': round(keto_score, 1),
            'health_score': round(health_score, 1)
        }

    def load_menu_data(self, csv_path):
        """メニューデータを読み込み"""
        df = pd.read_csv(csv_path)

        # スコアを計算
        for idx, row in df.iterrows():
            scores = self.calculate_scores(
                row['protein'], row['fat'], row['carb'], row['calories']
            )
            df.at[idx, 'muscle_score'] = scores['muscle_score']
            df.at[idx, 'keto_score'] = scores['keto_score']
            df.at[idx, 'health_score'] = scores['health_score']

        df.to_sql('menus', self.conn, if_exists='append', index=False)
        self.conn.commit()
```

### 3. コンテンツ生成機能

**生成方法:**

- **テンプレートベース**: データをテンプレートに埋め込む
- **AI 生成**: ChatGPT API / Claude API でコンテンツ生成
- **ハイブリッド**: テンプレート + AI で品質を向上

**ページタイプ:**

1. **チェーン店 × 目的ページ**（例: `/大戸屋/高タンパク`）
2. **駅 × 条件ページ**（例: `/渋谷駅/高タンパク-ランチ`）
3. **メニュー詳細ページ**（例: `/メニュー/チキンかあさん煮定食`）

**実装:**

```typescript
// Next.js SSG の例
import { GetStaticPaths, GetStaticProps } from "next";
import { generateContent } from "@/lib/ai";
import { getMenusByChainAndCondition, getStoresByStation } from "@/lib/db";

// チェーン店 × 目的ページ
export const getStaticPaths: GetStaticPaths = async () => {
  const chains = await getChains();
  const purposes = ["高タンパク", "低脂質", "低糖質", "ダイエット", "ヘルシー"];

  const paths = chains.flatMap((chain) =>
    purposes.map((purpose) => ({
      params: {
        chain: chain.slug,
        purpose: purpose,
      },
    }))
  );

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { chain, purpose } = params as { chain: string; purpose: string };

  // 条件に合うメニューを取得
  const menus = await getMenusByChainAndCondition(chain, purpose);

  // AI でコンテンツ生成
  const content = await generateContent({
    template: "chain-purpose-page",
    data: {
      chain,
      purpose,
      menus: menus.slice(0, 10), // トップ10
    },
  });

  // メタデータ生成
  const metadata = {
    title: `${chain}の${purpose}メニューランキング | おすすめ10選`,
    description: `${chain}の${purpose}メニューをPFCバランスで徹底比較。タンパク質・脂質・炭水化物の数値とおすすめ順位を掲載。`,
    keywords: `${chain} ${purpose}, ${chain} メニュー, ${chain} PFC, ${chain} 栄養成分`,
  };

  return {
    props: {
      content,
      metadata,
      menus,
      chain,
      purpose,
    },
    revalidate: 86400, // 1日ごとに再生成
  };
};

// 駅 × 条件ページ
export const getStaticPaths: GetStaticPaths = async () => {
  const stations = await getStations();
  const conditions = ["高タンパク-ランチ", "ヘルシー", "ダイエット"];

  const paths = stations.flatMap((station) =>
    conditions.map((condition) => ({
      params: {
        station: station.slug,
        condition: condition,
      },
    }))
  );

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { station, condition } = params as {
    station: string;
    condition: string;
  };

  // その駅にあるチェーン店を取得
  const stores = await getStoresByStation(station);

  // 各チェーン店のおすすめメニューを取得
  const recommendations = await Promise.all(
    stores.map(async (store) => {
      const menus = await getRecommendedMenus(store.chain_id, condition);
      return {
        store,
        menus: menus.slice(0, 3), // 各店舗のトップ3
      };
    })
  );

  // AI でコンテンツ生成
  const content = await generateContent({
    template: "station-condition-page",
    data: {
      station,
      condition,
      recommendations,
    },
  });

  // メタデータ生成
  const metadata = {
    title: `${station}の${condition}チェーン店 | おすすめメニューまとめ`,
    description: `${station}周辺の${condition}チェーン店を徹底調査。各店舗のおすすめメニューをPFCバランスで比較。`,
    keywords: `${station} ${condition}, ${station} ヘルシー, ${station} チェーン店, ${station} ランチ`,
  };

  return {
    props: {
      content,
      metadata,
      recommendations,
      station,
      condition,
    },
    revalidate: 86400,
  };
};
```

**AI コンテンツ生成:**

```python
import openai
from typing import Dict, Any

class ContentGenerator:
    def __init__(self, api_key: str):
        openai.api_key = api_key

    def generate_content(self, template: str, data: Dict[str, Any]) -> str:
        """AI でコンテンツを生成"""
        prompt = self.build_prompt(template, data)

        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "あなたは健康・栄養に詳しいWebライターです。トレーニーやダイエット中の人に向けて、正確で役立つ情報を提供してください。断言や過度な表現は避け、事実（データ）の提示に徹してください。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=2000
        )

        return response.choices[0].message.content

    def build_prompt(self, template: str, data: Dict[str, Any]) -> str:
        """プロンプトを構築"""
        if template == 'chain-purpose-page':
            menus_text = "\n".join([
                f"- {m['menu_name']}: カロリー{m['calories']}kcal, P{m['protein']}g/F{m['fat']}g/C{m['carb']}g"
                for m in data['menus'][:10]
            ])

            return f"""
以下の情報を元に、{data['chain']}の{data['purpose']}メニューページのコンテンツを作成してください。

チェーン店: {data['chain']}
目的: {data['purpose']}

おすすめメニュー（トップ10）:
{menus_text}

要件:
- 500-800 文字程度
- SEO を意識した自然な文章
- ユーザーが知りたい情報（PFCバランス、おすすめポイント）を含める
- 見出しタグ（h2, h3）を適切に使用
- 「痩せる」「健康になる」などの断言は避け、「データを提示する」スタイルで書く
- 読みやすく構造化された内容
"""

        elif template == 'station-condition-page':
            stores_text = "\n".join([
                f"- {r['store']['store_name']} ({r['store']['chain_id']}): {', '.join([m['menu_name'] for m in r['menus']])}"
                for r in data['recommendations']
            ])

            return f"""
以下の情報を元に、{data['station']}の{data['condition']}チェーン店ページのコンテンツを作成してください。

駅: {data['station']}
条件: {data['condition']}

おすすめ店舗とメニュー:
{stores_text}

要件:
- 500-800 文字程度
- SEO を意識した自然な文章
- 「迷ったらここに行け！」という即決リストの形式
- 各店舗のおすすめポイントを簡潔に
- 見出しタグ（h2, h3）を適切に使用
- 読みやすく構造化された内容
"""
```

### 4. メニュー組み合わせ提案機能

**機能:**

- PFC（タンパク質・脂質・炭水化物）のどれかを優先して、指定した g を摂取できるメニューの組み合わせを提示
- 複数のメニューを組み合わせて、目標の栄養素量を達成する組み合わせを自動計算
- 価格、カロリー、その他の栄養素も考慮した最適な組み合わせを提案

**ユースケース:**

1. **タンパク質優先**

   - 「タンパク質 30g 摂取したい」→ 複数のメニューを組み合わせて 30g になる組み合わせを提示
   - 例: 大戸屋の「チキンかあさん煮定食（P: 35g）」単品、または「サラダ（P: 5g）+ 牛丼ライト（P: 25g）」の組み合わせ

2. **糖質制限**

   - 「糖質 50g 以下に抑えたい」→ 複数のメニューを組み合わせて 50g 以下になる組み合わせを提示
   - 例: 「サラダ（C: 10g）+ 焼き魚定食（C: 35g）」= 合計 45g

3. **脂質制限**

   - 「脂質 20g 以下に抑えたい」→ 複数のメニューを組み合わせて 20g 以下になる組み合わせを提示

4. **複合条件**
   - 「タンパク質 30g 以上、かつ糖質 50g 以下」→ 両方の条件を満たす組み合わせを提示

**実装:**

```typescript
// lib/menu-combination.ts
interface Menu {
  menu_id: string;
  menu_name: string;
  chain_id: string;
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
}

interface CombinationCriteria {
  target_protein?: number; // 目標タンパク質（g）
  target_fat?: number; // 目標脂質（g）
  target_carb?: number; // 目標炭水化物（g）
  max_protein?: number; // 最大タンパク質（g）
  max_fat?: number; // 最大脂質（g）
  max_carb?: number; // 最大炭水化物（g）
  max_calories?: number; // 最大カロリー（kcal）
  max_price?: number; // 最大価格（円）
  max_items?: number; // 最大メニュー数
  chain_ids?: string[]; // 対象チェーン店（指定なしなら全チェーン）
}

interface MenuCombination {
  menus: Menu[];
  total_protein: number;
  total_fat: number;
  total_carb: number;
  total_calories: number;
  total_price: number;
  score: number; // 組み合わせの評価スコア
}

export class MenuCombinationGenerator {
  /**
   * メニュー組み合わせを生成
   */
  async generateCombinations(
    allMenus: Menu[],
    criteria: CombinationCriteria
  ): Promise<MenuCombination[]> {
    const combinations: MenuCombination[] = [];
    const maxItems = criteria.max_items || 3; // デフォルトは3品まで

    // 組み合わせを生成（再帰的に）
    this.generateRecursive(allMenus, criteria, [], maxItems, combinations);

    // スコアを計算してソート
    combinations.forEach((combo) => {
      combo.score = this.calculateScore(combo, criteria);
    });

    return combinations.sort((a, b) => b.score - a.score).slice(0, 10); // トップ10を返す
  }

  /**
   * 再帰的に組み合わせを生成
   */
  private generateRecursive(
    menus: Menu[],
    criteria: CombinationCriteria,
    current: Menu[],
    maxItems: number,
    results: MenuCombination[]
  ): void {
    // 現在の組み合わせを評価
    const currentCombo = this.calculateCombination(current);

    // 条件を満たしているかチェック
    if (this.meetsCriteria(currentCombo, criteria)) {
      results.push(currentCombo);
    }

    // 最大アイテム数に達したら終了
    if (current.length >= maxItems) {
      return;
    }

    // 次のメニューを追加
    for (const menu of menus) {
      // 既に追加済みのメニューはスキップ
      if (current.some((m) => m.menu_id === menu.menu_id)) {
        continue;
      }

      // チェーン店のフィルタ
      if (criteria.chain_ids && !criteria.chain_ids.includes(menu.chain_id)) {
        continue;
      }

      // 暫定的に追加して評価
      const newCombo = this.calculateCombination([...current, menu]);

      // 条件を超えている場合はスキップ（枝刈り）
      if (this.exceedsCriteria(newCombo, criteria)) {
        continue;
      }

      // 再帰的に探索
      this.generateRecursive(
        menus,
        criteria,
        [...current, menu],
        maxItems,
        results
      );
    }
  }

  /**
   * 組み合わせの栄養素を計算
   */
  private calculateCombination(menus: Menu[]): MenuCombination {
    return {
      menus,
      total_protein: menus.reduce((sum, m) => sum + m.protein, 0),
      total_fat: menus.reduce((sum, m) => sum + m.fat, 0),
      total_carb: menus.reduce((sum, m) => sum + m.carb, 0),
      total_calories: menus.reduce((sum, m) => sum + m.calories, 0),
      total_price: menus.reduce((sum, m) => sum + m.price, 0),
      score: 0,
    };
  }

  /**
   * 条件を満たしているかチェック
   */
  private meetsCriteria(
    combo: MenuCombination,
    criteria: CombinationCriteria
  ): boolean {
    // タンパク質の条件
    if (criteria.target_protein !== undefined) {
      const diff = Math.abs(combo.total_protein - criteria.target_protein);
      if (diff > criteria.target_protein * 0.1) {
        // 10% の誤差を許容
        return false;
      }
    }
    if (criteria.max_protein !== undefined) {
      if (combo.total_protein > criteria.max_protein) {
        return false;
      }
    }

    // 脂質の条件
    if (criteria.target_fat !== undefined) {
      const diff = Math.abs(combo.total_fat - criteria.target_fat);
      if (diff > criteria.target_fat * 0.1) {
        return false;
      }
    }
    if (criteria.max_fat !== undefined) {
      if (combo.total_fat > criteria.max_fat) {
        return false;
      }
    }

    // 炭水化物の条件
    if (criteria.target_carb !== undefined) {
      const diff = Math.abs(combo.total_carb - criteria.target_carb);
      if (diff > criteria.target_carb * 0.1) {
        return false;
      }
    }
    if (criteria.max_carb !== undefined) {
      if (combo.total_carb > criteria.max_carb) {
        return false;
      }
    }

    // カロリーの条件
    if (criteria.max_calories !== undefined) {
      if (combo.total_calories > criteria.max_calories) {
        return false;
      }
    }

    // 価格の条件
    if (criteria.max_price !== undefined) {
      if (combo.total_price > criteria.max_price) {
        return false;
      }
    }

    return true;
  }

  /**
   * 条件を超えているかチェック（枝刈り用）
   */
  private exceedsCriteria(
    combo: MenuCombination,
    criteria: CombinationCriteria
  ): boolean {
    // 最大値を超えている場合は探索を打ち切る
    if (criteria.max_protein && combo.total_protein > criteria.max_protein) {
      return true;
    }
    if (criteria.max_fat && combo.total_fat > criteria.max_fat) {
      return true;
    }
    if (criteria.max_carb && combo.total_carb > criteria.max_carb) {
      return true;
    }
    if (criteria.max_calories && combo.total_calories > criteria.max_calories) {
      return true;
    }
    if (criteria.max_price && combo.total_price > criteria.max_price) {
      return true;
    }
    return false;
  }

  /**
   * 組み合わせのスコアを計算
   */
  private calculateScore(
    combo: MenuCombination,
    criteria: CombinationCriteria
  ): number {
    let score = 100;

    // 目標値に近いほど高スコア
    if (criteria.target_protein !== undefined) {
      const diff = Math.abs(combo.total_protein - criteria.target_protein);
      score -= diff * 2; // 1g の差で 2 ポイント減点
    }

    if (criteria.target_fat !== undefined) {
      const diff = Math.abs(combo.total_fat - criteria.target_fat);
      score -= diff * 2;
    }

    if (criteria.target_carb !== undefined) {
      const diff = Math.abs(combo.total_carb - criteria.target_carb);
      score -= diff * 2;
    }

    // 価格が安いほど高スコア
    score -= combo.total_price * 0.1;

    // メニュー数が少ないほど高スコア（シンプルな組み合わせを優先）
    score -= combo.menus.length * 5;

    // カロリーが適度なほど高スコア（極端に低い/高い場合は減点）
    if (combo.total_calories < 300) {
      score -= 10; // 極端に低い
    }
    if (combo.total_calories > 1000) {
      score -= 10; // 極端に高い
    }

    return Math.max(0, score); // 0 以下にはならない
  }
}
```

**使用例:**

```typescript
// タンパク質 30g を摂取できる組み合わせを探す
const generator = new MenuCombinationGenerator();
const allMenus = await getAllMenus();

const combinations = await generator.generateCombinations(allMenus, {
  target_protein: 30,
  max_calories: 800,
  max_price: 1500,
  max_items: 3,
});

// 結果を表示
combinations.forEach((combo, index) => {
  console.log(`組み合わせ ${index + 1}:`);
  combo.menus.forEach((menu) => {
    console.log(`  - ${menu.menu_name} (P: ${menu.protein}g, ¥${menu.price})`);
  });
  console.log(
    `  合計: P: ${combo.total_protein}g, F: ${combo.total_fat}g, C: ${combo.total_carb}g, カロリー: ${combo.total_calories}kcal, 価格: ¥${combo.total_price}`
  );
});
```

**ページタイプ:**

- **組み合わせ提案ページ**（例: `/組み合わせ/タンパク質30g`）
  - 指定した栄養素量を達成できるメニュー組み合わせをランキング形式で表示
  - SEO キーワード: 「タンパク質 30g メニュー 組み合わせ」「糖質 50g 以下 外食」など

**実装:**

```typescript
// pages/組み合わせ/[nutrient]/[target].tsx
import { GetStaticPaths, GetStaticProps } from "next";
import { MenuCombinationGenerator } from "@/lib/menu-combination";

export const getStaticPaths: GetStaticPaths = async () => {
  // よく検索される組み合わせを事前生成
  const paths = [
    { params: { nutrient: "タンパク質", target: "30g" } },
    { params: { nutrient: "タンパク質", target: "40g" } },
    { params: { nutrient: "タンパク質", target: "50g" } },
    { params: { nutrient: "糖質", target: "50g以下" } },
    { params: { nutrient: "糖質", target: "30g以下" } },
    { params: { nutrient: "脂質", target: "20g以下" } },
  ];

  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { nutrient, target } = params as {
    nutrient: string;
    target: string;
  };

  const allMenus = await getAllMenus();
  const generator = new MenuCombinationGenerator();

  // 条件を設定
  const criteria = parseCriteria(nutrient, target);
  const combinations = await generator.generateCombinations(allMenus, criteria);

  // AI でコンテンツ生成
  const content = await generateContent({
    template: "combination-page",
    data: {
      nutrient,
      target,
      combinations: combinations.slice(0, 10),
    },
  });

  return {
    props: {
      nutrient,
      target,
      combinations,
      content,
    },
    revalidate: 86400,
  };
};
```

### 5. SEO 最適化機能

**最適化項目:**

- **メタタグ**: title, description, og:tags
- **構造化データ**: JSON-LD（Restaurant, MenuItem, FAQ など）
- **内部リンク**: 関連ページへのリンク自動生成
- **sitemap.xml**: 全ページを自動生成
- **robots.txt**: 適切な設定

**実装:**

```typescript
// components/SEO.tsx
import Head from "next/head";

interface SEOProps {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  structuredData?: object;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  canonical,
  structuredData,
}) => {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonical} />

      {/* OGP */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />

      {/* 構造化データ */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </Head>
  );
};

// 構造化データの生成例（メニューページ）
export function generateMenuStructuredData(menu: MenuData) {
  return {
    "@context": "https://schema.org",
    "@type": "MenuItem",
    name: menu.menu_name,
    description: `${menu.menu_name}の栄養成分情報。カロリー${menu.calories}kcal、タンパク質${menu.protein}g、脂質${menu.fat}g、炭水化物${menu.carb}g。`,
    nutrition: {
      "@type": "NutritionInformation",
      calories: `${menu.calories} kcal`,
      proteinContent: `${menu.protein} g`,
      fatContent: `${menu.fat} g`,
      carbohydrateContent: `${menu.carb} g`,
    },
    offers: {
      "@type": "Offer",
      price: menu.price,
      priceCurrency: "JPY",
    },
  };
}

// 構造化データの生成例（FAQ）
export function generateFAQStructuredData(faqs: FAQ[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}
```

**sitemap.xml 生成:**

```python
from xml.etree.ElementTree import Element, SubElement, tostring
from datetime import datetime

class SitemapGenerator:
    def __init__(self, base_url: str):
        self.base_url = base_url

    def generate_sitemap(self, pages: list) -> str:
        """sitemap.xml を生成"""
        urlset = Element('urlset')
        urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')

        for page in pages:
            url = SubElement(urlset, 'url')
            loc = SubElement(url, 'loc')
            loc.text = f"{self.base_url}{page['path']}"

            lastmod = SubElement(url, 'lastmod')
            lastmod.text = page.get('lastmod', datetime.now().isoformat())

            changefreq = SubElement(url, 'changefreq')
            changefreq.text = page.get('changefreq', 'daily')

            priority = SubElement(url, 'priority')
            priority.text = str(page.get('priority', 0.5))

        return tostring(urlset, encoding='unicode')

    def generate_all_pages(self, db_conn):
        """全ページのパスを生成"""
        pages = []

        # チェーン店 × 目的ページ
        chains = db_conn.execute('SELECT chain_id, chain_name_en FROM chains').fetchall()
        purposes = ['高タンパク', '低脂質', '低糖質', 'ダイエット', 'ヘルシー']

        for chain in chains:
            for purpose in purposes:
                pages.append({
                    'path': f'/{chain[1]}/{purpose}',
                    'changefreq': 'weekly',
                    'priority': 0.8
                })

        # 駅 × 条件ページ
        stations = db_conn.execute('SELECT station_id, station_name FROM stations').fetchall()
        conditions = ['高タンパク-ランチ', 'ヘルシー', 'ダイエット']

        for station in stations:
            for condition in conditions:
                pages.append({
                    'path': f'/{station[1]}/{condition}',
                    'changefreq': 'weekly',
                    'priority': 0.7
                })

        # メニュー詳細ページ
        menus = db_conn.execute('SELECT menu_id, menu_name FROM menus').fetchall()

        for menu in menus:
            pages.append({
                'path': f'/メニュー/{menu[1]}',
                'changefreq': 'monthly',
                'priority': 0.6
            })

        return pages
```

### 6. 内部リンク自動生成機能

**機能:**

- 関連ページへの自動リンク生成
- サイトマップ構造の構築
- パンくずリストの自動生成
- 関連記事の自動表示

**実装:**

```typescript
// lib/internal-links.ts
export function generateInternalLinks(
  currentPage: PageData,
  allPages: PageData[]
): InternalLink[] {
  const links: InternalLink[] = [];

  // 同じチェーン店の他の目的ページ
  if (currentPage.type === "chain-purpose") {
    const sameChain = allPages.filter(
      (p) =>
        p.type === "chain-purpose" &&
        p.chain === currentPage.chain &&
        p.purpose !== currentPage.purpose
    );
    links.push(...sameChain.slice(0, 5));
  }

  // 同じ駅の他の条件ページ
  if (currentPage.type === "station-condition") {
    const sameStation = allPages.filter(
      (p) =>
        p.type === "station-condition" &&
        p.station === currentPage.station &&
        p.condition !== currentPage.condition
    );
    links.push(...sameStation.slice(0, 3));
  }

  // 関連キーワードのページ
  const relatedKeywords = findRelatedPages(currentPage.keywords, allPages);
  links.push(...relatedKeywords.slice(0, 3));

  return links;
}
```

### 7. パフォーマンス最適化機能

**最適化項目:**

- **画像最適化**: WebP 形式、遅延読み込み
- **コード分割**: 動的インポート
- **キャッシュ戦略**: ISR（Incremental Static Regeneration）
- **CDN**: 静的アセットの配信

**実装:**

```typescript
// next.config.js
module.exports = {
  images: {
    formats: ["image/avif", "image/webp"],
    domains: ["example.com"],
  },

  // ISR 設定
  async generateBuildId() {
    return "build-" + Date.now();
  },

  // 圧縮
  compress: true,

  // パフォーマンス最適化
  swcMinify: true,

  // 実験的機能
  experimental: {
    optimizeCss: true,
  },
};
```

## 技術スタック

### フロントエンド

**フレームワーク:**

- Next.js 14（App Router）
- TypeScript
- Tailwind CSS
- React Server Components

**理由:**

- SSG（Static Site Generation）で大量ページ生成
- ISR（Incremental Static Regeneration）で動的更新
- パフォーマンスが高い
- SEO に最適

### バックエンド

**データ処理:**

- Python（データ収集、前処理、スクレイピング）
- Node.js（Next.js API Routes）
- PostgreSQL / SQLite（データベース）

**API:**

- OpenAI API（コンテンツ生成）
- Claude API（代替）
- 位置情報 API（駅データ、店舗データ）

### インフラ

**ホスティング:**

- Vercel（推奨、無料枠あり）
- Netlify（代替）
- AWS S3 + CloudFront（大規模の場合）

**ドメイン:**

- 独自ドメイン（¥1,000/年程度）

**監視・分析:**

- Google Search Console（検索パフォーマンス）
- Google Analytics（アクセス解析）
- Plausible（プライバシー重視の分析）

## 実装フェーズ

### Phase 1: MVP（最小機能）

**期間:** 2-3 週間

**機能:**

- 主要チェーン 5 社（大戸屋、やよい軒、すき家、松屋、吉野家）の定番メニューのみ
- 基本的なページ生成（500-1,000 ページ程度）
- チェーン店 × 目的ページのみ
- シンプルなテンプレート
- メタタグの設定
- sitemap.xml の生成

**技術:**

- Next.js + TypeScript
- SQLite（データベース）
- テンプレートベースのコンテンツ生成
- 手動でメニューデータを入力

**データ収集:**

- 各チェーン店の公式サイトから栄養成分表を取得
- CSV で管理し、データベースにインポート

### Phase 2: SEO 最適化

**期間:** 2-3 週間

**機能:**

- 構造化データの実装（MenuItem, Restaurant, FAQ）
- 内部リンクの自動生成
- パンくずリスト
- 画像最適化（メニュー画像があれば）

### Phase 3: 駅 × 条件ページ追加

**期間:** 2-3 週間

**機能:**

- 駅データの取得（主要駅 100-200 駅）
- 店舗データの取得（各駅周辺のチェーン店）
- 駅 × 条件ページの生成
- 「迷ったらここに行け！」リストの実装

### Phase 4: AI コンテンツ生成

**期間:** 2-3 週間

**機能:**

- ChatGPT API 連携
- コンテンツ品質の向上
- 多様性の確保
- YMYL（健康情報）への配慮

### Phase 5: スケール・最適化

**期間:** 継続的

**機能:**

- チェーン店数の拡大（10 社 → 20 社 → 30 社）
- ページ数の拡大（1,000 → 5,000 → 10,000 ページ以上）
- パフォーマンス最適化
- 自動更新（月 1 回のデータ更新）

## 収益モデル

### 広告収入

**Google AdSense:**

- 月 1,000 PV あたり ¥500〜¥2,000
- クリック率: 1-3%
- 単価: ¥10〜¥100/クリック

**計算例:**

- 10,000 PV/日 = 300,000 PV/月
- 300,000 PV × ¥1,000 = 月 30 万円

### アフィリエイト

**手法:**

1. **ジム紹介**

   - チョコザップ、エニタイムフィットネスなどの入会 LP へ誘導
   - 「外食だけでなく、ジムで体を変えたい方へ」という訴求

2. **食品・サプリメント**

   - ベースフード（完全栄養食）
   - プロテイン（マイプロテイン、DNS など）
   - 宅配弁当（ナッシュ、Muscle Deli など）
   - 「外食が面倒な日はこれがおすすめ」という訴求

3. **Amazon アソシエイト**
   - プロテイン、サプリメント、健康食品

**計算例:**

- コンバージョン率: 1-5%
- 報酬: ¥1,000〜¥10,000/件
- 月 100 件 × ¥5,000 = 月 50 万円

### 目標収益

**短期（6-12 ヶ月）:**

- 月 5-10 万円（広告収入中心）

**中期（12-24 ヶ月）:**

- 月 20-30 万円（広告 + アフィリエイト）

**長期（24 ヶ月以降）:**

- 月 50 万円以上（複数サイト運営、または大規模化）

## 成功のポイント

### 1. ロングテールキーワードを狙う

**理由:**

- 競合が少ない
- 検索意図が明確
- コンバージョン率が高い

**実装:**

- 検索ボリューム 10-1,000/月のキーワード
- 「チェーン店名 × 目的」の組み合わせ
- 「駅名 × 条件」の組み合わせ

### 2. 大量のページを生成

**目標:**

- 10,000 ページ以上
- 組み合わせで自動生成
- インデックス数を増やす

**実装:**

- チェーン店 10 社 × 目的 5 種類 = 50 ページ
- 駅 200 駅 × 条件 3 種類 = 600 ページ
- メニュー 1,000 個 × 1 ページ = 1,000 ページ
- **合計: 約 1,650 ページ（Phase 1-3）**
- さらに拡大すれば 10,000 ページ以上も可能

### 3. ユーザー価値を提供

**要件:**

- 実際に役立つ情報（正確な PFC データ）
- 最新のデータ（定期的な更新）
- 使いやすい UI（絞り込み、ソート機能）

**実装:**

- 単なるキーワード詰め込みは NG
- ユーザーの検索意図に応える（「迷ったらここに行け！」）
- 定期的なデータ更新（月 1 回）

### 4. YMYL（健康情報）への配慮

**要件:**

- Google は健康情報に厳しい
- 「これを食べれば痩せる」と断言すると評価が下がる

**実装:**

- 「痩せる」とは書かず、「公式発表の栄養成分を表示する」
- 「タンパク質が多い順に並べる」という**「事実（データ）の提示」**に徹する
- 断言や過度な表現を避ける

### 5. 定期的に更新

**理由:**

- Google の品質ガイドライン遵守
- 自動生成コンテンツでも価値があることを示す
- データの鮮度を保つ

**実装:**

- ISR（Incremental Static Regeneration）
- 定期的なデータ更新（月 1 回、季節限定メニューの追加・削除）
- コンテンツの改善

## リスク管理

### Google の品質ガイドライン

**遵守事項:**

- 自動生成コンテンツでも価値があることを示す
- 単なるキーワード詰め込みは避ける
- ユーザー価値を提供する
- YMYL（健康情報）への配慮

**対策:**

- 高品質なコンテンツ生成（AI 活用）
- 実際のデータを使用（公式の栄養成分表）
- 定期的な更新
- 断言を避け、事実の提示に徹する

### ペナルティのリスク

**リスク:**

- 低品質なコンテンツはペナルティを受ける可能性
- スパムと判断される可能性
- 健康情報の誤った表現で評価が下がる可能性

**対策:**

- 品質チェック機能の実装
- 人間によるレビュー（初期は特に重要）
- 段階的な公開
- YMYL への配慮

### データ更新の負担

**リスク:**

- チェーン店は季節限定メニューが頻繁に出る
- メンテナンスが大変

**対策:**

- 最初は「グランドメニュー（定番）」だけに絞る
- 季節商品は無視するか、余裕が出てから対応
- 主要チェーン 5-10 社に絞ってスタート
- 手動またはスクレイピングで月 1 回更新する運用

### 時間がかかる

**リスク:**

- インデックスされるまで数ヶ月かかる場合がある
- 収益化まで時間がかかる

**対策:**

- 長期的な視点で取り組む
- 複数のサイトを並行して運営
- 早期にインデックス申請（Google Search Console）

### 競合の参入

**リスク:**

- 成功すると競合が増える可能性
- 検索順位が下がる可能性

**対策:**

- 差別化（独自スコア、UI/UX、データの正確性）
- 継続的な改善
- 複数の収入源を持つ

## コスト

### 初期費用

- **ドメイン**: ¥1,000/年
- **ホスティング**: 無料（Vercel 無料枠）〜¥1,000/月
- **合計**: ¥1,000〜¥13,000/年

### 運用費用

- **API 費用**: 月額数千円（OpenAI API、位置情報 API など）
- **ドメイン更新**: ¥1,000/年
- **合計**: 月額 ¥5,000 以下

### 開発時間

- **MVP**: 40-60 時間
- **フル機能**: 100-150 時間
- **継続的改善**: 月 10-20 時間

## 収益化のタイムライン

### 0-3 ヶ月

**活動:**

- サイト構築
- データ収集（主要チェーン 5 社の定番メニュー）
- コンテンツ生成（500-1,000 ページ）
- Google Search Console に登録
- インデックス申請

**収益:**

- ほぼゼロ（インデックス前）

### 3-6 ヶ月

**活動:**

- インデックス開始
- 検索流入が増える
- Google AdSense 申請
- コンテンツ改善
- 駅 × 条件ページの追加

**収益:**

- 月 1-5 万円（広告収入）

### 6-12 ヶ月

**活動:**

- 安定した検索流入
- 広告収入が本格化
- アフィリエイト開始（ジム、食品）
- ページ数の拡大（1,000 → 5,000 ページ）
- チェーン店数の拡大（5 社 → 10 社）

**収益:**

- 月 10-30 万円（広告 + アフィリエイト）

### 12 ヶ月以降

**活動:**

- 資産として継続的な収入
- 複数サイトの運営（または大規模化）
- 最適化・改善
- 自動更新の実装

**収益:**

- 月 30 万円以上（複数サイト、または大規模化）

## 実現可能性

### 技術的難易度

**評価:** 中

**必要なスキル:**

- Next.js / React（フロントエンド）
- TypeScript / JavaScript
- Python（データ収集、スクレイピング）
- SEO 知識
- データベース設計
- API 連携

### 時間

**初期構築:** 1-2 週間（MVP）
**フル機能:** 1-2 ヶ月
**継続的改善:** 月 10-20 時間

### 収益化までの期間

**評価:** 6-12 ヶ月

**理由:**

- インデックスされるまで時間がかかる
- 検索順位が上がるまで時間がかかる
- 継続的な改善が必要

### 成功確率

**評価:** 中〜高

**条件:**

- 正しく実装すれば確実に収益化できる
- 品質を重視する（YMYL への配慮）
- 長期的な視点で取り組む
- データの正確性を保つ

## 注意事項

### 法的リスク

- **著作権**: チェーン店の公式データを使用する際は、利用規約を確認
- **個人情報**: 個人情報保護法の遵守
- **広告規制**: 各広告ネットワークの規約確認
- **健康情報**: 医師法、薬機法に抵触しないよう注意

### 税務

- **副業収入**: 確定申告が必要な場合がある
- **事業所得**: 継続的に行う場合は事業所得の可能性

### セキュリティ

- **API キー**: 適切な管理（環境変数）
- **データ保護**: 個人情報の適切な扱い

## 参考リソース

- [プログラマティック SEO 自動生成システム](../ツール/プログラマティックSEO自動生成システム.md)
- [マネタイズロードマップ](../ロードマップ/マネタイズ.md)
- [確実に利益を出す方法](../ロードマップ/確実に利益を出す方法.md)
