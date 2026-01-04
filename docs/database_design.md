# データベース設計書

## 1. 概要

本ドキュメントでは、チェーン店ヘルシー検索サイトのデータベース設計を定義する。

### 1.1 データベース選定

| フェーズ | DB | 理由 |
|---------|-----|------|
| MVP〜中規模 | SQLite | セットアップ不要、ファイルベース |
| 大規模 | PostgreSQL | 同時接続対応、スケーラビリティ |

### 1.2 データベースファイル

```
data/
├── chain_restaurant.db    # メインDB
└── seed/
    ├── chains.csv         # チェーン店マスタ
    ├── menus.csv          # メニューデータ
    ├── stations.csv       # 駅データ
    └── stores.csv         # 店舗データ
```

---

## 2. ER図

```
┌──────────────────┐
│     chains       │
├──────────────────┤
│ chain_id (PK)    │
│ chain_name       │
│ chain_name_en    │
│ category         │
│ official_url     │
│ nutrition_url    │
│ logo_url         │
│ created_at       │
│ updated_at       │
└────────┬─────────┘
         │
         │ 1:N
         ▼
┌──────────────────┐       ┌──────────────────┐
│     menus        │       │    stations      │
├──────────────────┤       ├──────────────────┤
│ menu_id (PK)     │       │ station_id (PK)  │
│ chain_id (FK)    │       │ station_name     │
│ menu_name        │       │ station_name_kana│
│ price            │       │ station_line     │
│ calories         │       │ prefecture       │
│ protein          │       │ city             │
│ fat              │       │ latitude         │
│ carb             │       │ longitude        │
│ fiber            │       │ created_at       │
│ sodium           │       └────────┬─────────┘
│ muscle_score     │                │
│ keto_score       │                │
│ health_score     │                │
│ category         │       ┌────────┴─────────┐
│ is_seasonal      │       │     stores       │
│ image_url        │       ├──────────────────┤
│ description      │       │ store_id (PK)    │
│ created_at       │       │ chain_id (FK)    │◄──┐
│ updated_at       │       │ store_name       │   │
└──────────────────┘       │ station_id (FK)  │   │
                           │ distance         │   │
                           │ address          │   │
                           │ phone            │   │
                           │ business_hours   │   │
                           │ has_wifi         │   │
                           │ has_power        │   │
                           │ latitude         │   │
                           │ longitude        │   │
                           │ created_at       │   │
                           │ updated_at       │   │
                           └──────────────────┘   │
                                                  │
         ┌────────────────────────────────────────┘
         │
┌────────┴─────────┐
│     chains       │
└──────────────────┘
```

---

## 3. テーブル定義

### 3.1 chains（チェーン店マスタ）

チェーン店の基本情報を管理する。

```sql
CREATE TABLE chains (
    chain_id           TEXT PRIMARY KEY,
    chain_name         TEXT NOT NULL,
    chain_name_en      TEXT NOT NULL,
    chain_name_kana    TEXT,
    category           TEXT NOT NULL,
    subcategory        TEXT,
    official_url       TEXT,
    nutrition_data_url TEXT,
    logo_url           TEXT,
    description        TEXT,
    founded_year       INTEGER,
    store_count        INTEGER,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### カラム詳細

| カラム名 | 型 | NULL | 説明 | 例 |
|----------|-----|------|------|-----|
| chain_id | TEXT | NO | 一意識別子（slug形式） | `ootoya` |
| chain_name | TEXT | NO | チェーン店名（日本語） | `大戸屋` |
| chain_name_en | TEXT | NO | チェーン店名（英語/slug） | `ootoya` |
| chain_name_kana | TEXT | YES | チェーン店名（カナ） | `オオトヤ` |
| category | TEXT | NO | カテゴリ | `teishoku`, `gyudon`, `fastfood` |
| subcategory | TEXT | YES | サブカテゴリ | `japanese`, `western` |
| official_url | TEXT | YES | 公式サイトURL | `https://www.ootoya.com/` |
| nutrition_data_url | TEXT | YES | 栄養成分ページURL | |
| logo_url | TEXT | YES | ロゴ画像URL | |
| description | TEXT | YES | 説明文 | |
| founded_year | INTEGER | YES | 創業年 | `1958` |
| store_count | INTEGER | YES | 店舗数 | `350` |

#### カテゴリ一覧

```sql
-- category の値
'teishoku'    -- 定食（大戸屋、やよい軒）
'gyudon'      -- 牛丼（すき家、吉野家、松屋）
'fastfood'    -- ファストフード（マクドナルド、モス）
'cafe'        -- カフェ（スタバ、ドトール）
'famires'     -- ファミレス（ガスト、サイゼリヤ）
'ramen'       -- ラーメン（日高屋、一蘭）
'curry'       -- カレー（CoCo壱）
'udon'        -- うどん・そば（丸亀製麺）
'other'       -- その他
```

#### インデックス

```sql
CREATE INDEX idx_chains_category ON chains(category);
CREATE INDEX idx_chains_name ON chains(chain_name);
CREATE INDEX idx_chains_name_en ON chains(chain_name_en);
```

---

### 3.2 menus（メニュー）

各チェーン店のメニュー情報と栄養成分を管理する。

```sql
CREATE TABLE menus (
    menu_id       TEXT PRIMARY KEY,
    chain_id      TEXT NOT NULL,
    menu_name     TEXT NOT NULL,
    menu_name_kana TEXT,
    price         INTEGER,
    calories      INTEGER,
    protein       REAL,
    fat           REAL,
    carb          REAL,
    fiber         REAL,
    sodium        REAL,
    sugar         REAL,
    muscle_score  REAL,
    keto_score    REAL,
    health_score  REAL,
    category      TEXT,
    subcategory   TEXT,
    is_seasonal   BOOLEAN DEFAULT 0,
    is_limited    BOOLEAN DEFAULT 0,
    available_from DATE,
    available_to   DATE,
    image_url     TEXT,
    description   TEXT,
    allergens     TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chain_id) REFERENCES chains(chain_id)
);
```

#### カラム詳細

| カラム名 | 型 | NULL | 説明 | 例 |
|----------|-----|------|------|-----|
| menu_id | TEXT | NO | 一意識別子 | `ootoya-chicken-kaasan` |
| chain_id | TEXT | NO | チェーン店ID（FK） | `ootoya` |
| menu_name | TEXT | NO | メニュー名 | `チキンかあさん煮定食` |
| price | INTEGER | YES | 価格（税込） | `890` |
| calories | INTEGER | YES | カロリー（kcal） | `750` |
| protein | REAL | YES | タンパク質（g） | `35.2` |
| fat | REAL | YES | 脂質（g） | `28.5` |
| carb | REAL | YES | 炭水化物（g） | `85.0` |
| fiber | REAL | YES | 食物繊維（g） | `3.2` |
| sodium | REAL | YES | 食塩相当量（g） | `4.5` |
| sugar | REAL | YES | 糖質（g） | `81.8` |
| muscle_score | REAL | YES | マッスルスコア | `0.047` |
| keto_score | REAL | YES | ケトスコア | `-70.0` |
| health_score | REAL | YES | ヘルシースコア | `15.5` |
| category | TEXT | YES | カテゴリ | `teishoku`, `don`, `side` |
| is_seasonal | BOOLEAN | NO | 季節限定フラグ | `0` |
| is_limited | BOOLEAN | NO | 期間限定フラグ | `0` |
| allergens | TEXT | YES | アレルゲン（カンマ区切り） | `卵,乳,小麦` |

#### スコア計算式

```sql
-- マッスルスコア: タンパク質効率（高いほど良い）
muscle_score = protein / calories * 1000

-- ケトスコア: 糖質制限向け（高いほど良い）
keto_score = CASE
    WHEN carb <= 50 THEN 100 - (carb * 2)
    ELSE 0
END

-- ヘルシースコア: 総合評価
health_score = (protein * 2) - (fat * 1.5) - (carb * 0.5)
```

#### インデックス

```sql
-- 検索用インデックス
CREATE INDEX idx_menus_chain_id ON menus(chain_id);
CREATE INDEX idx_menus_category ON menus(category);

-- ソート用インデックス
CREATE INDEX idx_menus_muscle_score ON menus(muscle_score DESC);
CREATE INDEX idx_menus_keto_score ON menus(keto_score DESC);
CREATE INDEX idx_menus_health_score ON menus(health_score DESC);
CREATE INDEX idx_menus_protein ON menus(protein DESC);
CREATE INDEX idx_menus_carb ON menus(carb ASC);
CREATE INDEX idx_menus_fat ON menus(fat ASC);
CREATE INDEX idx_menus_calories ON menus(calories ASC);

-- 複合インデックス
CREATE INDEX idx_menus_chain_muscle ON menus(chain_id, muscle_score DESC);
CREATE INDEX idx_menus_chain_keto ON menus(chain_id, keto_score DESC);
```

---

### 3.3 stations（駅マスタ）

駅情報を管理する。

```sql
CREATE TABLE stations (
    station_id       TEXT PRIMARY KEY,
    station_name     TEXT NOT NULL,
    station_name_kana TEXT,
    station_line     TEXT,
    line_code        TEXT,
    prefecture       TEXT,
    city             TEXT,
    address          TEXT,
    latitude         REAL,
    longitude        REAL,
    is_major         BOOLEAN DEFAULT 0,
    daily_passengers INTEGER,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### カラム詳細

| カラム名 | 型 | NULL | 説明 | 例 |
|----------|-----|------|------|-----|
| station_id | TEXT | NO | 一意識別子 | `shibuya-jr` |
| station_name | TEXT | NO | 駅名 | `渋谷` |
| station_name_kana | TEXT | YES | 駅名（カナ） | `シブヤ` |
| station_line | TEXT | YES | 路線名 | `JR山手線` |
| line_code | TEXT | YES | 路線コード | `yamanote` |
| prefecture | TEXT | YES | 都道府県 | `東京都` |
| city | TEXT | YES | 市区町村 | `渋谷区` |
| latitude | REAL | YES | 緯度 | `35.658034` |
| longitude | REAL | YES | 経度 | `139.701636` |
| is_major | BOOLEAN | NO | 主要駅フラグ | `1` |
| daily_passengers | INTEGER | YES | 1日平均乗降客数 | `2280000` |

#### インデックス

```sql
CREATE INDEX idx_stations_name ON stations(station_name);
CREATE INDEX idx_stations_line ON stations(station_line);
CREATE INDEX idx_stations_prefecture ON stations(prefecture);
CREATE INDEX idx_stations_location ON stations(latitude, longitude);
CREATE INDEX idx_stations_major ON stations(is_major);
```

---

### 3.4 stores（店舗）

各チェーン店の店舗情報を管理する。

```sql
CREATE TABLE stores (
    store_id       TEXT PRIMARY KEY,
    chain_id       TEXT NOT NULL,
    store_name     TEXT NOT NULL,
    station_id     TEXT,
    station_name   TEXT,
    distance       INTEGER,
    address        TEXT,
    phone          TEXT,
    business_hours TEXT,
    regular_holiday TEXT,
    has_wifi       BOOLEAN DEFAULT 0,
    has_power      BOOLEAN DEFAULT 0,
    has_parking    BOOLEAN DEFAULT 0,
    seat_count     INTEGER,
    latitude       REAL,
    longitude      REAL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chain_id) REFERENCES chains(chain_id),
    FOREIGN KEY (station_id) REFERENCES stations(station_id)
);
```

#### カラム詳細

| カラム名 | 型 | NULL | 説明 | 例 |
|----------|-----|------|------|-----|
| store_id | TEXT | NO | 一意識別子 | `ootoya-shibuya-center` |
| chain_id | TEXT | NO | チェーン店ID（FK） | `ootoya` |
| store_name | TEXT | NO | 店舗名 | `大戸屋 渋谷センター街店` |
| station_id | TEXT | YES | 最寄駅ID（FK） | `shibuya-jr` |
| station_name | TEXT | YES | 最寄駅名（冗長化） | `渋谷` |
| distance | INTEGER | YES | 駅からの距離（分） | `3` |
| address | TEXT | YES | 住所 | `東京都渋谷区宇田川町...` |
| phone | TEXT | YES | 電話番号 | `03-1234-5678` |
| business_hours | TEXT | YES | 営業時間 | `11:00-23:00` |
| has_wifi | BOOLEAN | NO | Wi-Fi有無 | `1` |
| has_power | BOOLEAN | NO | 電源有無 | `0` |

#### インデックス

```sql
CREATE INDEX idx_stores_chain_id ON stores(chain_id);
CREATE INDEX idx_stores_station_id ON stores(station_id);
CREATE INDEX idx_stores_station_name ON stores(station_name);
CREATE INDEX idx_stores_location ON stores(latitude, longitude);

-- 複合インデックス
CREATE INDEX idx_stores_station_chain ON stores(station_name, chain_id);
```

---

## 4. よく使うクエリ

### 4.1 チェーン店×目的のメニュー取得

```sql
-- 大戸屋の高タンパクメニュートップ10
SELECT
    m.menu_id,
    m.menu_name,
    m.price,
    m.calories,
    m.protein,
    m.fat,
    m.carb,
    m.muscle_score,
    c.chain_name
FROM menus m
JOIN chains c ON m.chain_id = c.chain_id
WHERE m.chain_id = 'ootoya'
  AND m.is_seasonal = 0
ORDER BY m.muscle_score DESC
LIMIT 10;
```

### 4.2 低糖質メニュー検索

```sql
-- 糖質30g以下のメニュー
SELECT
    m.menu_id,
    m.menu_name,
    m.carb,
    m.keto_score,
    c.chain_name
FROM menus m
JOIN chains c ON m.chain_id = c.chain_id
WHERE m.carb <= 30
ORDER BY m.keto_score DESC
LIMIT 20;
```

### 4.3 駅周辺のチェーン店

```sql
-- 渋谷駅周辺のチェーン店（徒歩5分以内）
SELECT
    s.store_id,
    s.store_name,
    s.distance,
    c.chain_name,
    c.category
FROM stores s
JOIN chains c ON s.chain_id = c.chain_id
WHERE s.station_name = '渋谷'
  AND s.distance <= 5
ORDER BY s.distance ASC;
```

### 4.4 駅×条件の店舗とおすすめメニュー

```sql
-- 渋谷駅周辺の高タンパクおすすめ
SELECT
    s.store_name,
    s.distance,
    c.chain_name,
    m.menu_name,
    m.protein,
    m.muscle_score
FROM stores s
JOIN chains c ON s.chain_id = c.chain_id
JOIN (
    SELECT chain_id, menu_name, protein, muscle_score,
           ROW_NUMBER() OVER (PARTITION BY chain_id ORDER BY muscle_score DESC) as rn
    FROM menus
    WHERE is_seasonal = 0
) m ON c.chain_id = m.chain_id AND m.rn = 1
WHERE s.station_name = '渋谷'
  AND s.distance <= 5
ORDER BY m.muscle_score DESC;
```

### 4.5 組み合わせ検索（タンパク質30g達成）

```sql
-- タンパク質25-35gのメニュー
SELECT
    m.menu_id,
    m.menu_name,
    m.protein,
    m.calories,
    m.price,
    c.chain_name
FROM menus m
JOIN chains c ON m.chain_id = c.chain_id
WHERE m.protein BETWEEN 25 AND 35
  AND m.is_seasonal = 0
ORDER BY m.muscle_score DESC
LIMIT 20;
```

---

## 5. データ投入

### 5.1 初期データ（CSV形式）

#### chains.csv

```csv
chain_id,chain_name,chain_name_en,category,official_url
ootoya,大戸屋,ootoya,teishoku,https://www.ootoya.com/
yayoiken,やよい軒,yayoiken,teishoku,https://www.yayoiken.com/
sukiya,すき家,sukiya,gyudon,https://www.sukiya.jp/
matsuya,松屋,matsuya,gyudon,https://www.matsuyafoods.co.jp/
yoshinoya,吉野家,yoshinoya,gyudon,https://www.yoshinoya.com/
```

#### menus.csv

```csv
menu_id,chain_id,menu_name,price,calories,protein,fat,carb,category
ootoya-chicken-kaasan,ootoya,チキンかあさん煮定食,890,750,35.2,28.5,85.0,teishoku
ootoya-saba-miso,ootoya,さばの味噌煮定食,890,680,28.5,32.0,65.0,teishoku
sukiya-gyudon-nami,sukiya,牛丼（並盛）,400,733,22.9,25.0,104.1,don
sukiya-gyudon-light,sukiya,牛丼ライト,480,425,19.5,16.3,49.2,don
```

### 5.2 データ投入スクリプト

```python
# scripts/seed_data.py

import sqlite3
import csv
from pathlib import Path

def seed_database(db_path: str, seed_dir: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # chains テーブル
    with open(f'{seed_dir}/chains.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            cursor.execute('''
                INSERT OR REPLACE INTO chains
                (chain_id, chain_name, chain_name_en, category, official_url)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                row['chain_id'],
                row['chain_name'],
                row['chain_name_en'],
                row['category'],
                row['official_url']
            ))

    # menus テーブル（スコア計算付き）
    with open(f'{seed_dir}/menus.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            protein = float(row['protein'])
            fat = float(row['fat'])
            carb = float(row['carb'])
            calories = int(row['calories'])

            # スコア計算
            muscle_score = (protein / calories * 1000) if calories > 0 else 0
            keto_score = max(0, 100 - (carb * 2)) if carb <= 50 else 0
            health_score = (protein * 2) - (fat * 1.5) - (carb * 0.5)

            cursor.execute('''
                INSERT OR REPLACE INTO menus
                (menu_id, chain_id, menu_name, price, calories,
                 protein, fat, carb, muscle_score, keto_score, health_score, category)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                row['menu_id'],
                row['chain_id'],
                row['menu_name'],
                int(row['price']),
                calories,
                protein,
                fat,
                carb,
                round(muscle_score, 3),
                round(keto_score, 1),
                round(health_score, 1),
                row['category']
            ))

    conn.commit()
    conn.close()
    print('Data seeded successfully!')

if __name__ == '__main__':
    seed_database('data/chain_restaurant.db', 'data/seed')
```

---

## 6. マイグレーション

### 6.1 スキーマ作成

```sql
-- sql/001_create_tables.sql

-- chains テーブル
CREATE TABLE IF NOT EXISTS chains (
    chain_id           TEXT PRIMARY KEY,
    chain_name         TEXT NOT NULL,
    chain_name_en      TEXT NOT NULL,
    chain_name_kana    TEXT,
    category           TEXT NOT NULL,
    subcategory        TEXT,
    official_url       TEXT,
    nutrition_data_url TEXT,
    logo_url           TEXT,
    description        TEXT,
    founded_year       INTEGER,
    store_count        INTEGER,
    created_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- menus テーブル
CREATE TABLE IF NOT EXISTS menus (
    menu_id       TEXT PRIMARY KEY,
    chain_id      TEXT NOT NULL,
    menu_name     TEXT NOT NULL,
    menu_name_kana TEXT,
    price         INTEGER,
    calories      INTEGER,
    protein       REAL,
    fat           REAL,
    carb          REAL,
    fiber         REAL,
    sodium        REAL,
    sugar         REAL,
    muscle_score  REAL,
    keto_score    REAL,
    health_score  REAL,
    category      TEXT,
    subcategory   TEXT,
    is_seasonal   BOOLEAN DEFAULT 0,
    is_limited    BOOLEAN DEFAULT 0,
    available_from DATE,
    available_to   DATE,
    image_url     TEXT,
    description   TEXT,
    allergens     TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chain_id) REFERENCES chains(chain_id)
);

-- stations テーブル
CREATE TABLE IF NOT EXISTS stations (
    station_id       TEXT PRIMARY KEY,
    station_name     TEXT NOT NULL,
    station_name_kana TEXT,
    station_line     TEXT,
    line_code        TEXT,
    prefecture       TEXT,
    city             TEXT,
    address          TEXT,
    latitude         REAL,
    longitude        REAL,
    is_major         BOOLEAN DEFAULT 0,
    daily_passengers INTEGER,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- stores テーブル
CREATE TABLE IF NOT EXISTS stores (
    store_id       TEXT PRIMARY KEY,
    chain_id       TEXT NOT NULL,
    store_name     TEXT NOT NULL,
    station_id     TEXT,
    station_name   TEXT,
    distance       INTEGER,
    address        TEXT,
    phone          TEXT,
    business_hours TEXT,
    regular_holiday TEXT,
    has_wifi       BOOLEAN DEFAULT 0,
    has_power      BOOLEAN DEFAULT 0,
    has_parking    BOOLEAN DEFAULT 0,
    seat_count     INTEGER,
    latitude       REAL,
    longitude      REAL,
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chain_id) REFERENCES chains(chain_id),
    FOREIGN KEY (station_id) REFERENCES stations(station_id)
);
```

### 6.2 インデックス作成

```sql
-- sql/002_create_indexes.sql

-- chains
CREATE INDEX IF NOT EXISTS idx_chains_category ON chains(category);
CREATE INDEX IF NOT EXISTS idx_chains_name ON chains(chain_name);
CREATE INDEX IF NOT EXISTS idx_chains_name_en ON chains(chain_name_en);

-- menus
CREATE INDEX IF NOT EXISTS idx_menus_chain_id ON menus(chain_id);
CREATE INDEX IF NOT EXISTS idx_menus_category ON menus(category);
CREATE INDEX IF NOT EXISTS idx_menus_muscle_score ON menus(muscle_score DESC);
CREATE INDEX IF NOT EXISTS idx_menus_keto_score ON menus(keto_score DESC);
CREATE INDEX IF NOT EXISTS idx_menus_health_score ON menus(health_score DESC);
CREATE INDEX IF NOT EXISTS idx_menus_protein ON menus(protein DESC);
CREATE INDEX IF NOT EXISTS idx_menus_carb ON menus(carb ASC);
CREATE INDEX IF NOT EXISTS idx_menus_chain_muscle ON menus(chain_id, muscle_score DESC);

-- stations
CREATE INDEX IF NOT EXISTS idx_stations_name ON stations(station_name);
CREATE INDEX IF NOT EXISTS idx_stations_line ON stations(station_line);
CREATE INDEX IF NOT EXISTS idx_stations_prefecture ON stations(prefecture);
CREATE INDEX IF NOT EXISTS idx_stations_major ON stations(is_major);

-- stores
CREATE INDEX IF NOT EXISTS idx_stores_chain_id ON stores(chain_id);
CREATE INDEX IF NOT EXISTS idx_stores_station_id ON stores(station_id);
CREATE INDEX IF NOT EXISTS idx_stores_station_name ON stores(station_name);
CREATE INDEX IF NOT EXISTS idx_stores_station_chain ON stores(station_name, chain_id);
```

---

## 7. PostgreSQL移行

大規模化時のPostgreSQL移行手順。

### 7.1 型の変更点

| SQLite | PostgreSQL |
|--------|------------|
| TEXT | VARCHAR / TEXT |
| INTEGER | INTEGER / BIGINT |
| REAL | NUMERIC / DOUBLE PRECISION |
| BOOLEAN (0/1) | BOOLEAN |
| DATETIME | TIMESTAMP WITH TIME ZONE |

### 7.2 移行スクリプト

```python
# scripts/migrate_to_postgres.py

import sqlite3
import psycopg2
from psycopg2.extras import execute_values

def migrate_to_postgres(sqlite_path: str, pg_connection_string: str):
    # SQLite接続
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row

    # PostgreSQL接続
    pg_conn = psycopg2.connect(pg_connection_string)
    pg_cursor = pg_conn.cursor()

    # chains移行
    chains = sqlite_conn.execute('SELECT * FROM chains').fetchall()
    execute_values(
        pg_cursor,
        '''INSERT INTO chains (chain_id, chain_name, chain_name_en, category, ...)
           VALUES %s ON CONFLICT (chain_id) DO NOTHING''',
        [tuple(row) for row in chains]
    )

    # menus移行
    menus = sqlite_conn.execute('SELECT * FROM menus').fetchall()
    execute_values(
        pg_cursor,
        '''INSERT INTO menus (menu_id, chain_id, menu_name, ...)
           VALUES %s ON CONFLICT (menu_id) DO NOTHING''',
        [tuple(row) for row in menus]
    )

    pg_conn.commit()
    pg_conn.close()
    sqlite_conn.close()

    print('Migration completed!')
```

---

## 8. バックアップ・リストア

### 8.1 SQLiteバックアップ

```bash
# バックアップ
cp data/chain_restaurant.db data/backup/chain_restaurant_$(date +%Y%m%d).db

# 圧縮バックアップ
sqlite3 data/chain_restaurant.db ".backup data/backup/chain_restaurant_$(date +%Y%m%d).db"
gzip data/backup/chain_restaurant_$(date +%Y%m%d).db
```

### 8.2 リストア

```bash
# 解凍
gunzip data/backup/chain_restaurant_20240101.db.gz

# リストア
cp data/backup/chain_restaurant_20240101.db data/chain_restaurant.db
```
