# API設計書

## 1. 概要

本ドキュメントでは、チェーン店ヘルシー検索サイトのAPI設計を定義する。

### 1.1 API方針

- RESTful設計
- Next.js API Routes（App Router）で実装
- JSON形式でレスポンス
- ページネーション対応
- エラーハンドリング統一

### 1.2 ベースURL

```
開発環境: http://localhost:3000/api
本番環境: https://example.com/api
```

---

## 2. エンドポイント一覧

| メソッド | エンドポイント | 説明 |
|----------|---------------|------|
| GET | `/api/chains` | チェーン店一覧取得 |
| GET | `/api/chains/[chainId]` | チェーン店詳細取得 |
| GET | `/api/menus` | メニュー一覧取得 |
| GET | `/api/menus/[menuId]` | メニュー詳細取得 |
| GET | `/api/menus/ranking` | メニューランキング取得 |
| GET | `/api/stations` | 駅一覧取得 |
| GET | `/api/stations/[stationId]` | 駅詳細取得 |
| GET | `/api/stores` | 店舗一覧取得 |
| POST | `/api/combinations` | 組み合わせ提案取得 |
| GET | `/api/search` | 横断検索 |

---

## 3. 共通仕様

### 3.1 リクエストヘッダー

```
Content-Type: application/json
Accept: application/json
```

### 3.2 レスポンス形式

#### 成功時

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 100,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

#### エラー時

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "指定されたリソースが見つかりません",
    "details": {}
  }
}
```

### 3.3 エラーコード一覧

| コード | HTTPステータス | 説明 |
|--------|---------------|------|
| `BAD_REQUEST` | 400 | リクエストパラメータが不正 |
| `NOT_FOUND` | 404 | リソースが見つからない |
| `INTERNAL_ERROR` | 500 | サーバー内部エラー |
| `VALIDATION_ERROR` | 422 | バリデーションエラー |

### 3.4 ページネーション

```
?limit=20       # 取得件数（デフォルト: 20, 最大: 100）
?offset=0       # オフセット（デフォルト: 0）
```

---

## 4. チェーン店API

### 4.1 GET /api/chains

チェーン店一覧を取得する。

#### リクエスト

```
GET /api/chains?category=teishoku&limit=10
```

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| category | string | No | カテゴリでフィルタ | `teishoku`, `gyudon` |
| limit | number | No | 取得件数（デフォルト: 20） | `10` |
| offset | number | No | オフセット | `0` |

#### レスポンス

```json
{
  "success": true,
  "data": [
    {
      "chain_id": "ootoya",
      "chain_name": "大戸屋",
      "chain_name_en": "ootoya",
      "category": "teishoku",
      "official_url": "https://www.ootoya.com/",
      "logo_url": "/images/chains/ootoya.png",
      "menu_count": 45,
      "store_count": 350
    },
    {
      "chain_id": "yayoiken",
      "chain_name": "やよい軒",
      "chain_name_en": "yayoiken",
      "category": "teishoku",
      "official_url": "https://www.yayoiken.com/",
      "logo_url": "/images/chains/yayoiken.png",
      "menu_count": 38,
      "store_count": 380
    }
  ],
  "meta": {
    "total": 30,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### 実装

```typescript
// app/api/chains/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get('category');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  const db = await getDatabase();

  let query = `
    SELECT
      c.*,
      COUNT(DISTINCT m.menu_id) as menu_count,
      COUNT(DISTINCT s.store_id) as store_count
    FROM chains c
    LEFT JOIN menus m ON c.chain_id = m.chain_id
    LEFT JOIN stores s ON c.chain_id = s.chain_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (category) {
    query += ' AND c.category = ?';
    params.push(category);
  }

  query += ' GROUP BY c.chain_id ORDER BY c.chain_name';
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const chains = await db.all(query, params);

  // 総件数取得
  const countResult = await db.get(
    'SELECT COUNT(*) as total FROM chains' +
    (category ? ' WHERE category = ?' : ''),
    category ? [category] : []
  );

  return NextResponse.json({
    success: true,
    data: chains,
    meta: {
      total: countResult.total,
      limit,
      offset,
      hasMore: offset + chains.length < countResult.total
    }
  });
}
```

---

### 4.2 GET /api/chains/[chainId]

チェーン店の詳細情報を取得する。

#### リクエスト

```
GET /api/chains/ootoya
```

#### レスポンス

```json
{
  "success": true,
  "data": {
    "chain_id": "ootoya",
    "chain_name": "大戸屋",
    "chain_name_en": "ootoya",
    "category": "teishoku",
    "official_url": "https://www.ootoya.com/",
    "nutrition_data_url": "https://www.ootoya.com/menu/nutrition/",
    "logo_url": "/images/chains/ootoya.png",
    "description": "手作りにこだわった定食チェーン",
    "founded_year": 1958,
    "store_count": 350,
    "menu_count": 45,
    "top_menus": [
      {
        "menu_id": "ootoya-chicken-kaasan",
        "menu_name": "チキンかあさん煮定食",
        "muscle_score": 0.047
      }
    ],
    "categories": ["teishoku", "don", "side"]
  }
}
```

#### 実装

```typescript
// app/api/chains/[chainId]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { chainId: string } }
) {
  const { chainId } = params;
  const db = await getDatabase();

  // チェーン店基本情報
  const chain = await db.get(
    'SELECT * FROM chains WHERE chain_id = ?',
    [chainId]
  );

  if (!chain) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: '指定されたチェーン店が見つかりません'
      }
    }, { status: 404 });
  }

  // メニュー数
  const menuCount = await db.get(
    'SELECT COUNT(*) as count FROM menus WHERE chain_id = ?',
    [chainId]
  );

  // トップメニュー
  const topMenus = await db.all(
    `SELECT menu_id, menu_name, muscle_score
     FROM menus
     WHERE chain_id = ? AND is_seasonal = 0
     ORDER BY muscle_score DESC
     LIMIT 5`,
    [chainId]
  );

  // カテゴリ一覧
  const categories = await db.all(
    `SELECT DISTINCT category FROM menus WHERE chain_id = ?`,
    [chainId]
  );

  return NextResponse.json({
    success: true,
    data: {
      ...chain,
      menu_count: menuCount.count,
      top_menus: topMenus,
      categories: categories.map(c => c.category)
    }
  });
}
```

---

## 5. メニューAPI

### 5.1 GET /api/menus

メニュー一覧を取得する。

#### リクエスト

```
GET /api/menus?chain_id=ootoya&min_protein=20&sort_by=muscle_score&limit=10
```

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| chain_id | string | No | チェーン店ID | `ootoya` |
| category | string | No | カテゴリ | `teishoku` |
| min_protein | number | No | 最小タンパク質(g) | `20` |
| max_protein | number | No | 最大タンパク質(g) | `50` |
| min_carb | number | No | 最小炭水化物(g) | `0` |
| max_carb | number | No | 最大炭水化物(g) | `30` |
| min_fat | number | No | 最小脂質(g) | `0` |
| max_fat | number | No | 最大脂質(g) | `20` |
| max_calories | number | No | 最大カロリー | `500` |
| max_price | number | No | 最大価格 | `1000` |
| is_seasonal | boolean | No | 季節限定フラグ | `false` |
| sort_by | string | No | ソート項目 | `muscle_score`, `protein`, `carb` |
| sort_order | string | No | ソート順 | `asc`, `desc` |
| limit | number | No | 取得件数 | `20` |
| offset | number | No | オフセット | `0` |

#### レスポンス

```json
{
  "success": true,
  "data": [
    {
      "menu_id": "ootoya-chicken-kaasan",
      "chain_id": "ootoya",
      "chain_name": "大戸屋",
      "menu_name": "チキンかあさん煮定食",
      "price": 890,
      "calories": 750,
      "protein": 35.2,
      "fat": 28.5,
      "carb": 85.0,
      "muscle_score": 0.047,
      "keto_score": 0,
      "health_score": 15.5,
      "category": "teishoku",
      "is_seasonal": false
    }
  ],
  "meta": {
    "total": 250,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

#### 実装

```typescript
// app/api/menus/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // パラメータ取得
  const chainId = searchParams.get('chain_id');
  const category = searchParams.get('category');
  const minProtein = searchParams.get('min_protein');
  const maxProtein = searchParams.get('max_protein');
  const minCarb = searchParams.get('min_carb');
  const maxCarb = searchParams.get('max_carb');
  const minFat = searchParams.get('min_fat');
  const maxFat = searchParams.get('max_fat');
  const maxCalories = searchParams.get('max_calories');
  const maxPrice = searchParams.get('max_price');
  const isSeasonal = searchParams.get('is_seasonal');
  const sortBy = searchParams.get('sort_by') || 'muscle_score';
  const sortOrder = searchParams.get('sort_order') || 'desc';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  // 許可されたソートカラム
  const allowedSortColumns = [
    'muscle_score', 'keto_score', 'health_score',
    'protein', 'fat', 'carb', 'calories', 'price'
  ];

  if (!allowedSortColumns.includes(sortBy)) {
    return NextResponse.json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '不正なソート項目です'
      }
    }, { status: 422 });
  }

  const db = await getDatabase();

  let query = `
    SELECT m.*, c.chain_name
    FROM menus m
    JOIN chains c ON m.chain_id = c.chain_id
    WHERE 1=1
  `;
  const params: any[] = [];

  // フィルタ条件
  if (chainId) {
    query += ' AND m.chain_id = ?';
    params.push(chainId);
  }
  if (category) {
    query += ' AND m.category = ?';
    params.push(category);
  }
  if (minProtein) {
    query += ' AND m.protein >= ?';
    params.push(parseFloat(minProtein));
  }
  if (maxProtein) {
    query += ' AND m.protein <= ?';
    params.push(parseFloat(maxProtein));
  }
  if (minCarb) {
    query += ' AND m.carb >= ?';
    params.push(parseFloat(minCarb));
  }
  if (maxCarb) {
    query += ' AND m.carb <= ?';
    params.push(parseFloat(maxCarb));
  }
  if (minFat) {
    query += ' AND m.fat >= ?';
    params.push(parseFloat(minFat));
  }
  if (maxFat) {
    query += ' AND m.fat <= ?';
    params.push(parseFloat(maxFat));
  }
  if (maxCalories) {
    query += ' AND m.calories <= ?';
    params.push(parseInt(maxCalories));
  }
  if (maxPrice) {
    query += ' AND m.price <= ?';
    params.push(parseInt(maxPrice));
  }
  if (isSeasonal !== null) {
    query += ' AND m.is_seasonal = ?';
    params.push(isSeasonal === 'true' ? 1 : 0);
  }

  // ソート
  const order = sortOrder === 'asc' ? 'ASC' : 'DESC';
  query += ` ORDER BY m.${sortBy} ${order}`;

  // ページネーション
  query += ' LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const menus = await db.all(query, params);

  // 総件数（同じフィルタ条件で）
  let countQuery = `
    SELECT COUNT(*) as total
    FROM menus m
    WHERE 1=1
  `;
  const countParams = params.slice(0, -2); // limit, offset除外

  // 同じフィルタ条件を適用（簡略化のため省略）

  return NextResponse.json({
    success: true,
    data: menus,
    meta: {
      total: menus.length, // 実際は別クエリで取得
      limit,
      offset,
      hasMore: menus.length === limit
    }
  });
}
```

---

### 5.2 GET /api/menus/[menuId]

メニュー詳細を取得する。

#### リクエスト

```
GET /api/menus/ootoya-chicken-kaasan
```

#### レスポンス

```json
{
  "success": true,
  "data": {
    "menu_id": "ootoya-chicken-kaasan",
    "chain_id": "ootoya",
    "chain_name": "大戸屋",
    "menu_name": "チキンかあさん煮定食",
    "price": 890,
    "calories": 750,
    "protein": 35.2,
    "fat": 28.5,
    "carb": 85.0,
    "fiber": 3.2,
    "sodium": 4.5,
    "muscle_score": 0.047,
    "keto_score": 0,
    "health_score": 15.5,
    "category": "teishoku",
    "is_seasonal": false,
    "image_url": "/images/menus/ootoya-chicken-kaasan.jpg",
    "description": "やわらかいチキンに甘辛いタレをかけた定食",
    "allergens": ["卵", "乳", "小麦"],
    "similar_menus": [
      {
        "menu_id": "yayoiken-chicken-nanban",
        "menu_name": "チキン南蛮定食",
        "chain_name": "やよい軒",
        "protein": 32.0,
        "muscle_score": 0.044
      }
    ],
    "same_chain_menus": [
      {
        "menu_id": "ootoya-saba-miso",
        "menu_name": "さばの味噌煮定食",
        "protein": 28.5,
        "muscle_score": 0.042
      }
    ]
  }
}
```

---

### 5.3 GET /api/menus/ranking

目的別ランキングを取得する。

#### リクエスト

```
GET /api/menus/ranking?purpose=high_protein&chain_id=ootoya&limit=10
```

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 | 例 |
|-----------|-----|------|------|-----|
| purpose | string | Yes | 目的 | `high_protein`, `low_carb`, `low_fat`, `healthy` |
| chain_id | string | No | チェーン店ID | `ootoya` |
| limit | number | No | 取得件数 | `10` |

#### レスポンス

```json
{
  "success": true,
  "data": {
    "purpose": "high_protein",
    "purpose_label": "高タンパク",
    "ranking": [
      {
        "rank": 1,
        "menu_id": "ootoya-chicken-kaasan",
        "menu_name": "チキンかあさん煮定食",
        "chain_name": "大戸屋",
        "protein": 35.2,
        "calories": 750,
        "muscle_score": 0.047
      },
      {
        "rank": 2,
        "menu_id": "ootoya-saba-shio",
        "menu_name": "さばの塩焼き定食",
        "chain_name": "大戸屋",
        "protein": 30.5,
        "calories": 620,
        "muscle_score": 0.049
      }
    ]
  }
}
```

---

## 6. 駅・店舗API

### 6.1 GET /api/stations

駅一覧を取得する。

#### リクエスト

```
GET /api/stations?prefecture=東京都&line=山手線&is_major=true
```

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| prefecture | string | No | 都道府県 |
| line | string | No | 路線名 |
| is_major | boolean | No | 主要駅のみ |
| q | string | No | 駅名検索 |

#### レスポンス

```json
{
  "success": true,
  "data": [
    {
      "station_id": "shibuya-jr",
      "station_name": "渋谷",
      "station_line": "JR山手線",
      "prefecture": "東京都",
      "city": "渋谷区",
      "is_major": true,
      "store_count": 15
    }
  ]
}
```

---

### 6.2 GET /api/stores

店舗一覧を取得する。

#### リクエスト

```
GET /api/stores?station_name=渋谷&chain_id=ootoya&max_distance=5
```

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| station_name | string | No | 最寄駅名 |
| station_id | string | No | 駅ID |
| chain_id | string | No | チェーン店ID |
| max_distance | number | No | 最大距離（分） |

#### レスポンス

```json
{
  "success": true,
  "data": [
    {
      "store_id": "ootoya-shibuya-center",
      "chain_id": "ootoya",
      "chain_name": "大戸屋",
      "store_name": "大戸屋 渋谷センター街店",
      "station_name": "渋谷",
      "distance": 3,
      "address": "東京都渋谷区宇田川町...",
      "business_hours": "11:00-23:00",
      "has_wifi": true,
      "recommended_menu": {
        "menu_id": "ootoya-chicken-kaasan",
        "menu_name": "チキンかあさん煮定食",
        "muscle_score": 0.047
      }
    }
  ]
}
```

---

## 7. 組み合わせAPI

### 7.1 POST /api/combinations

栄養素目標を達成するメニュー組み合わせを取得する。

#### リクエスト

```
POST /api/combinations
Content-Type: application/json

{
  "target_protein": 30,
  "max_carb": 50,
  "max_calories": 800,
  "max_price": 1500,
  "max_items": 3,
  "chain_ids": ["ootoya", "sukiya"]
}
```

#### リクエストボディ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| target_protein | number | No | 目標タンパク質(g) |
| target_fat | number | No | 目標脂質(g) |
| target_carb | number | No | 目標炭水化物(g) |
| max_protein | number | No | 最大タンパク質(g) |
| max_fat | number | No | 最大脂質(g) |
| max_carb | number | No | 最大炭水化物(g) |
| max_calories | number | No | 最大カロリー |
| max_price | number | No | 最大価格 |
| max_items | number | No | 最大メニュー数（デフォルト: 3） |
| chain_ids | string[] | No | 対象チェーン店ID |

#### レスポンス

```json
{
  "success": true,
  "data": {
    "criteria": {
      "target_protein": 30,
      "max_carb": 50,
      "max_calories": 800
    },
    "combinations": [
      {
        "rank": 1,
        "score": 95.5,
        "menus": [
          {
            "menu_id": "sukiya-gyudon-light",
            "menu_name": "牛丼ライト",
            "chain_name": "すき家",
            "protein": 19.5,
            "fat": 16.3,
            "carb": 49.2,
            "calories": 425,
            "price": 480
          }
        ],
        "totals": {
          "protein": 19.5,
          "fat": 16.3,
          "carb": 49.2,
          "calories": 425,
          "price": 480
        },
        "achievement": {
          "protein_rate": 65.0,
          "carb_under_limit": true,
          "calories_under_limit": true
        }
      },
      {
        "rank": 2,
        "score": 92.0,
        "menus": [
          {
            "menu_id": "ootoya-saba-shio",
            "menu_name": "さばの塩焼き定食",
            "chain_name": "大戸屋",
            "protein": 30.5,
            "fat": 18.0,
            "carb": 65.0,
            "calories": 620,
            "price": 850
          }
        ],
        "totals": {
          "protein": 30.5,
          "fat": 18.0,
          "carb": 65.0,
          "calories": 620,
          "price": 850
        }
      }
    ]
  }
}
```

#### 実装

```typescript
// app/api/combinations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';
import { MenuCombinationGenerator } from '@/lib/menu-combination';

export async function POST(request: NextRequest) {
  const body = await request.json();

  const {
    target_protein,
    target_fat,
    target_carb,
    max_protein,
    max_fat,
    max_carb,
    max_calories,
    max_price,
    max_items = 3,
    chain_ids
  } = body;

  const db = await getDatabase();

  // メニュー取得
  let query = `
    SELECT m.*, c.chain_name
    FROM menus m
    JOIN chains c ON m.chain_id = c.chain_id
    WHERE m.is_seasonal = 0
  `;
  const params: any[] = [];

  if (chain_ids && chain_ids.length > 0) {
    query += ` AND m.chain_id IN (${chain_ids.map(() => '?').join(',')})`;
    params.push(...chain_ids);
  }

  const menus = await db.all(query, params);

  // 組み合わせ生成
  const generator = new MenuCombinationGenerator();
  const combinations = generator.generateCombinations(menus, {
    target_protein,
    target_fat,
    target_carb,
    max_protein,
    max_fat,
    max_carb,
    max_calories,
    max_price,
    max_items
  });

  return NextResponse.json({
    success: true,
    data: {
      criteria: {
        target_protein,
        max_carb,
        max_calories,
        max_price
      },
      combinations: combinations.map((combo, index) => ({
        rank: index + 1,
        score: combo.score,
        menus: combo.menus,
        totals: {
          protein: combo.total_protein,
          fat: combo.total_fat,
          carb: combo.total_carb,
          calories: combo.total_calories,
          price: combo.total_price
        }
      }))
    }
  });
}
```

---

## 8. 検索API

### 8.1 GET /api/search

横断検索を行う。

#### リクエスト

```
GET /api/search?q=高タンパク&type=menu
```

#### クエリパラメータ

| パラメータ | 型 | 必須 | 説明 |
|-----------|-----|------|------|
| q | string | Yes | 検索クエリ |
| type | string | No | 検索対象（`all`, `menu`, `chain`, `station`） |
| limit | number | No | 取得件数 |

#### レスポンス

```json
{
  "success": true,
  "data": {
    "query": "高タンパク",
    "results": {
      "menus": [
        {
          "menu_id": "ootoya-chicken-kaasan",
          "menu_name": "チキンかあさん煮定食",
          "chain_name": "大戸屋",
          "protein": 35.2
        }
      ],
      "chains": [],
      "stations": []
    },
    "total": 15
  }
}
```

---

## 9. 型定義

### 9.1 共通型

```typescript
// types/api.ts

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}
```

### 9.2 エンティティ型

```typescript
// types/entities.ts

export interface Chain {
  chain_id: string;
  chain_name: string;
  chain_name_en: string;
  category: string;
  official_url?: string;
  logo_url?: string;
  menu_count?: number;
  store_count?: number;
}

export interface Menu {
  menu_id: string;
  chain_id: string;
  chain_name?: string;
  menu_name: string;
  price: number;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  muscle_score: number;
  keto_score: number;
  health_score: number;
  category: string;
  is_seasonal: boolean;
  image_url?: string;
}

export interface Station {
  station_id: string;
  station_name: string;
  station_line?: string;
  prefecture?: string;
  city?: string;
  is_major: boolean;
  store_count?: number;
}

export interface Store {
  store_id: string;
  chain_id: string;
  chain_name?: string;
  store_name: string;
  station_name?: string;
  distance?: number;
  address?: string;
  business_hours?: string;
  has_wifi: boolean;
}

export interface MenuCombination {
  menus: Menu[];
  total_protein: number;
  total_fat: number;
  total_carb: number;
  total_calories: number;
  total_price: number;
  score: number;
}
```

---

## 10. APIクライアント

### 10.1 フロントエンド用クライアント

```typescript
// lib/api-client.ts

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API Error');
  }

  return response.json();
}

export const apiClient = {
  // チェーン店
  getChains: (params?: { category?: string; limit?: number }) =>
    fetchApi<ApiResponse<Chain[]>>(`/chains?${new URLSearchParams(params as any)}`),

  getChain: (chainId: string) =>
    fetchApi<ApiResponse<Chain>>(`/chains/${chainId}`),

  // メニュー
  getMenus: (params?: {
    chain_id?: string;
    min_protein?: number;
    max_carb?: number;
    sort_by?: string;
  }) =>
    fetchApi<ApiResponse<Menu[]>>(`/menus?${new URLSearchParams(params as any)}`),

  getMenu: (menuId: string) =>
    fetchApi<ApiResponse<Menu>>(`/menus/${menuId}`),

  getMenuRanking: (params: { purpose: string; chain_id?: string }) =>
    fetchApi<ApiResponse<any>>(`/menus/ranking?${new URLSearchParams(params)}`),

  // 組み合わせ
  getCombinations: (criteria: CombinationCriteria) =>
    fetchApi<ApiResponse<any>>('/combinations', {
      method: 'POST',
      body: JSON.stringify(criteria),
    }),

  // 検索
  search: (q: string, type?: string) =>
    fetchApi<ApiResponse<any>>(`/search?q=${encodeURIComponent(q)}&type=${type || 'all'}`),
};
```

### 10.2 使用例

```typescript
// コンポーネントでの使用例
import { apiClient } from '@/lib/api-client';

async function ChainPage({ chainId }: { chainId: string }) {
  const { data: chain } = await apiClient.getChain(chainId);

  const { data: menus } = await apiClient.getMenus({
    chain_id: chainId,
    sort_by: 'muscle_score',
  });

  return (
    <div>
      <h1>{chain.chain_name}</h1>
      {menus.map(menu => (
        <MenuCard key={menu.menu_id} menu={menu} />
      ))}
    </div>
  );
}
```
