# SQLite 基礎学習ガイド

## 1. SQLiteとは

### 1.1 概要

SQLiteは、サーバーレスで動作する軽量なリレーショナルデータベースです。

```
特徴:
- サーバー不要（ファイルベース）
- 設定不要（ゼロコンフィグ）
- 単一ファイルにデータベース全体を格納
- トランザクションをサポート（ACID準拠）
- 読み取り中心のワークロードに最適
```

### 1.2 PostgreSQLとの比較

| 項目 | SQLite | PostgreSQL |
|------|--------|------------|
| サーバー | 不要 | 必要 |
| 設定 | 不要 | 必要 |
| 同時書き込み | 制限あり | 高性能 |
| スケール | 小〜中規模 | 大規模 |
| 学習コスト | 低い | 中程度 |
| 本番運用 | MVP向け | 本番向け |

### 1.3 このプロジェクトでの使用

```
MVP段階: SQLite
  ↓
データ量10万件超 or 同時アクセス増加
  ↓
本番段階: PostgreSQL（Supabase/Neon）
```

---

## 2. SQLite のインストール

### 2.1 macOS

```bash
# Homebrewでインストール
brew install sqlite

# バージョン確認
sqlite3 --version
```

### 2.2 Node.js（better-sqlite3）

```bash
# プロジェクトにインストール
npm install better-sqlite3
npm install -D @types/better-sqlite3
```

### 2.3 Python

```python
# 標準ライブラリに含まれる（インストール不要）
import sqlite3
```

---

## 3. 基本操作

### 3.1 データベースの作成・接続

#### コマンドライン

```bash
# データベースファイルを作成/接続
sqlite3 chain_restaurant.db

# メモリ上のデータベース（テスト用）
sqlite3 :memory:
```

#### Python

```python
import sqlite3

# ファイルベースのデータベース
conn = sqlite3.connect('chain_restaurant.db')

# メモリ上のデータベース
conn = sqlite3.connect(':memory:')

# カーソルを取得
cursor = conn.cursor()
```

#### Node.js（better-sqlite3）

```typescript
import Database from 'better-sqlite3';

// ファイルベースのデータベース
const db = new Database('chain_restaurant.db');

// メモリ上のデータベース
const db = new Database(':memory:');
```

### 3.2 テーブルの作成（CREATE TABLE）

```sql
-- チェーン店テーブル
CREATE TABLE IF NOT EXISTS chains (
    chain_id TEXT PRIMARY KEY,
    chain_name TEXT NOT NULL,
    chain_name_en TEXT NOT NULL,
    category TEXT NOT NULL,
    official_url TEXT,
    nutrition_url TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- メニューテーブル
CREATE TABLE IF NOT EXISTS menus (
    menu_id TEXT PRIMARY KEY,
    chain_id TEXT NOT NULL,
    menu_name TEXT NOT NULL,
    category TEXT,
    price INTEGER,
    calories REAL,
    protein REAL,
    fat REAL,
    carb REAL,
    sodium REAL,
    fiber REAL,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (chain_id) REFERENCES chains(chain_id)
);
```

### 3.3 データの挿入（INSERT）

```sql
-- 単一レコードの挿入
INSERT INTO chains (chain_id, chain_name, chain_name_en, category, official_url)
VALUES ('matsuya', '松屋', 'Matsuya', '牛丼', 'https://www.matsuyafoods.co.jp/');

-- 複数レコードの挿入
INSERT INTO menus (menu_id, chain_id, menu_name, price, calories, protein, fat, carb)
VALUES
    ('matsuya_gyudon', 'matsuya', '牛めし', 380, 692, 18.2, 23.1, 104.5),
    ('matsuya_gyudon_l', 'matsuya', '牛めし 大盛', 530, 965, 25.4, 32.2, 145.8);
```

#### Python での挿入

```python
import sqlite3

conn = sqlite3.connect('chain_restaurant.db')
cursor = conn.cursor()

# 単一レコード
cursor.execute('''
    INSERT INTO chains (chain_id, chain_name, chain_name_en, category)
    VALUES (?, ?, ?, ?)
''', ('matsuya', '松屋', 'Matsuya', '牛丼'))

# 複数レコード
menus = [
    ('matsuya_gyudon', 'matsuya', '牛めし', 380, 692, 18.2, 23.1, 104.5),
    ('matsuya_gyudon_l', 'matsuya', '牛めし 大盛', 530, 965, 25.4, 32.2, 145.8),
]
cursor.executemany('''
    INSERT INTO menus (menu_id, chain_id, menu_name, price, calories, protein, fat, carb)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
''', menus)

# コミット（必須）
conn.commit()
conn.close()
```

### 3.4 データの取得（SELECT）

```sql
-- 全件取得
SELECT * FROM menus;

-- 条件付き取得
SELECT menu_name, calories, protein
FROM menus
WHERE chain_id = 'matsuya'
  AND calories < 500;

-- 並び替え
SELECT * FROM menus ORDER BY protein DESC;

-- 件数制限
SELECT * FROM menus LIMIT 10;

-- カウント
SELECT COUNT(*) FROM menus WHERE chain_id = 'matsuya';
```

#### Python での取得

```python
import sqlite3

conn = sqlite3.connect('chain_restaurant.db')
cursor = conn.cursor()

# 全件取得
cursor.execute('SELECT * FROM menus')
rows = cursor.fetchall()

for row in rows:
    print(row)

# 条件付き取得（パラメータバインディング）
cursor.execute('''
    SELECT menu_name, calories, protein
    FROM menus
    WHERE chain_id = ? AND calories < ?
''', ('matsuya', 500))

# 1件だけ取得
row = cursor.fetchone()

# 辞書形式で取得
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
cursor.execute('SELECT * FROM menus WHERE menu_id = ?', ('matsuya_gyudon',))
row = cursor.fetchone()

# row['menu_name'] のようにアクセス可能
print(dict(row))

conn.close()
```

### 3.5 データの更新（UPDATE）

```sql
-- 単一レコードの更新
UPDATE menus
SET price = 400, updated_at = datetime('now', 'localtime')
WHERE menu_id = 'matsuya_gyudon';

-- 複数レコードの更新
UPDATE menus
SET category = 'メイン'
WHERE chain_id = 'matsuya';
```

### 3.6 データの削除（DELETE）

```sql
-- 単一レコードの削除
DELETE FROM menus WHERE menu_id = 'matsuya_gyudon';

-- 条件付き削除
DELETE FROM menus WHERE chain_id = 'matsuya' AND calories > 1000;

-- 全件削除（注意！）
DELETE FROM menus;
```

---

## 4. 高度なクエリ

### 4.1 JOIN（テーブル結合）

```sql
-- INNER JOIN: 両方のテーブルに存在するデータのみ
SELECT
    m.menu_name,
    m.calories,
    m.protein,
    c.chain_name,
    c.category
FROM menus m
INNER JOIN chains c ON m.chain_id = c.chain_id
WHERE m.protein > 20;

-- LEFT JOIN: 左テーブルの全データ + 右テーブルの一致データ
SELECT
    c.chain_name,
    COUNT(m.menu_id) as menu_count
FROM chains c
LEFT JOIN menus m ON c.chain_id = m.chain_id
GROUP BY c.chain_id;
```

### 4.2 集計関数（GROUP BY）

```sql
-- チェーン店ごとの平均カロリー
SELECT
    chain_id,
    AVG(calories) as avg_calories,
    AVG(protein) as avg_protein,
    COUNT(*) as menu_count
FROM menus
GROUP BY chain_id;

-- カテゴリごとのメニュー数
SELECT
    category,
    COUNT(*) as count
FROM menus
GROUP BY category
ORDER BY count DESC;
```

### 4.3 サブクエリ

```sql
-- 平均以上のタンパク質を持つメニュー
SELECT menu_name, protein
FROM menus
WHERE protein > (SELECT AVG(protein) FROM menus);

-- 最もメニュー数が多いチェーン店のメニュー
SELECT * FROM menus
WHERE chain_id = (
    SELECT chain_id
    FROM menus
    GROUP BY chain_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
);
```

### 4.4 インデックス

```sql
-- インデックスの作成（検索高速化）
CREATE INDEX idx_menus_chain_id ON menus(chain_id);
CREATE INDEX idx_menus_calories ON menus(calories);
CREATE INDEX idx_menus_protein ON menus(protein);

-- 複合インデックス
CREATE INDEX idx_menus_chain_calories ON menus(chain_id, calories);

-- インデックスの確認
.indexes menus

-- インデックスの削除
DROP INDEX idx_menus_chain_id;
```

---

## 5. SQLite 固有の機能

### 5.1 日時の扱い

SQLiteには専用の日時型がないため、TEXTで保存します。

```sql
-- 現在日時の取得
SELECT datetime('now');                    -- UTC
SELECT datetime('now', 'localtime');       -- ローカル時間

-- 日時の計算
SELECT datetime('now', '+7 days');         -- 7日後
SELECT datetime('now', '-1 month');        -- 1ヶ月前

-- 日時のフォーマット
SELECT strftime('%Y-%m-%d', 'now');        -- 2024-01-15
SELECT strftime('%H:%M:%S', 'now');        -- 14:30:00

-- 日時での検索
SELECT * FROM menus
WHERE date(created_at) = date('now');
```

### 5.2 JSON サポート

SQLite 3.38以降でJSONをサポートしています。

```sql
-- JSON データの挿入
INSERT INTO menus (menu_id, chain_id, menu_name, extra_data)
VALUES ('test', 'matsuya', 'テスト', '{"allergens": ["小麦", "卵"], "spicy": true}');

-- JSON 値の抽出
SELECT
    menu_name,
    json_extract(extra_data, '$.allergens') as allergens,
    json_extract(extra_data, '$.spicy') as spicy
FROM menus;

-- JSON 配列の展開
SELECT
    menu_name,
    value as allergen
FROM menus, json_each(json_extract(extra_data, '$.allergens'));
```

### 5.3 UPSERT（INSERT OR REPLACE）

```sql
-- 存在すれば更新、なければ挿入
INSERT OR REPLACE INTO menus (menu_id, chain_id, menu_name, price, calories, protein, fat, carb)
VALUES ('matsuya_gyudon', 'matsuya', '牛めし', 400, 692, 18.2, 23.1, 104.5);

-- ON CONFLICT（より細かい制御）
INSERT INTO menus (menu_id, chain_id, menu_name, price)
VALUES ('matsuya_gyudon', 'matsuya', '牛めし', 400)
ON CONFLICT(menu_id) DO UPDATE SET
    price = excluded.price,
    updated_at = datetime('now', 'localtime');
```

### 5.4 トランザクション

```sql
-- トランザクション開始
BEGIN TRANSACTION;

-- 複数の操作
INSERT INTO chains VALUES (...);
INSERT INTO menus VALUES (...);
UPDATE menus SET ...;

-- コミット（確定）
COMMIT;

-- またはロールバック（取り消し）
ROLLBACK;
```

#### Python でのトランザクション

```python
import sqlite3

conn = sqlite3.connect('chain_restaurant.db')
cursor = conn.cursor()

try:
    cursor.execute('BEGIN TRANSACTION')

    cursor.execute('INSERT INTO chains VALUES (...)')
    cursor.execute('INSERT INTO menus VALUES (...)')

    conn.commit()
    print('Success')
except Exception as e:
    conn.rollback()
    print(f'Error: {e}')
finally:
    conn.close()
```

---

## 6. コマンドラインツール

### 6.1 基本コマンド

```bash
# データベースに接続
sqlite3 chain_restaurant.db

# SQLite内でのコマンド
.help          # ヘルプ表示
.tables        # テーブル一覧
.schema        # スキーマ表示
.schema menus  # 特定テーブルのスキーマ
.indexes       # インデックス一覧
.quit          # 終了
```

### 6.2 出力フォーマット

```bash
# 出力モードの変更
.mode column   # カラム形式
.mode line     # 行形式
.mode csv      # CSV形式
.mode json     # JSON形式
.mode table    # テーブル形式（見やすい）

# ヘッダー表示
.headers on

# 例
.mode table
.headers on
SELECT * FROM menus LIMIT 5;
```

### 6.3 ファイル入出力

```bash
# SQLファイルの実行
.read schema.sql

# 結果をファイルに出力
.output result.txt
SELECT * FROM menus;
.output stdout  # 標準出力に戻す

# CSVエクスポート
.mode csv
.headers on
.output menus.csv
SELECT * FROM menus;

# CSVインポート
.mode csv
.import menus.csv menus
```

---

## 7. パフォーマンス最適化

### 7.1 インデックス戦略

```sql
-- 検索によく使うカラムにインデックス
CREATE INDEX idx_menus_chain_id ON menus(chain_id);

-- 複合インデックス（検索条件の順番に注意）
CREATE INDEX idx_menus_search ON menus(chain_id, calories, protein);

-- EXPLAIN で実行計画を確認
EXPLAIN QUERY PLAN
SELECT * FROM menus WHERE chain_id = 'matsuya' AND calories < 500;
```

### 7.2 クエリ最適化

```sql
-- 悪い例: SELECT *
SELECT * FROM menus WHERE chain_id = 'matsuya';

-- 良い例: 必要なカラムのみ
SELECT menu_id, menu_name, calories, protein
FROM menus
WHERE chain_id = 'matsuya';

-- LIMIT を活用
SELECT * FROM menus
WHERE chain_id = 'matsuya'
ORDER BY protein DESC
LIMIT 10;
```

### 7.3 WALモード

Write-Ahead Logging（WAL）モードで読み取りパフォーマンスが向上します。

```sql
-- WALモードを有効化
PRAGMA journal_mode = WAL;

-- 確認
PRAGMA journal_mode;
```

```python
# Python での WAL モード設定
conn = sqlite3.connect('chain_restaurant.db')
conn.execute('PRAGMA journal_mode = WAL')
```

---

## 8. バックアップと復元

### 8.1 バックアップ

```bash
# ファイルコピー（最も簡単）
cp chain_restaurant.db chain_restaurant_backup.db

# SQLダンプ
sqlite3 chain_restaurant.db .dump > backup.sql

# コマンドラインからバックアップ
sqlite3 chain_restaurant.db ".backup 'backup.db'"
```

### 8.2 復元

```bash
# SQLダンプから復元
sqlite3 new_database.db < backup.sql

# Pythonでの復元
python -c "
import sqlite3
source = sqlite3.connect('chain_restaurant.db')
dest = sqlite3.connect('backup.db')
source.backup(dest)
"
```

---

## 9. このプロジェクトでの実践例

### 9.1 データベース初期化スクリプト

```python
# python/scripts/init_db.py
import sqlite3

def init_database(db_path: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # WALモードを有効化
    cursor.execute('PRAGMA journal_mode = WAL')

    # テーブル作成
    cursor.executescript('''
        CREATE TABLE IF NOT EXISTS chains (
            chain_id TEXT PRIMARY KEY,
            chain_name TEXT NOT NULL,
            chain_name_en TEXT NOT NULL,
            category TEXT NOT NULL,
            official_url TEXT,
            nutrition_url TEXT,
            created_at TEXT DEFAULT (datetime('now', 'localtime')),
            updated_at TEXT DEFAULT (datetime('now', 'localtime'))
        );

        CREATE TABLE IF NOT EXISTS menus (
            menu_id TEXT PRIMARY KEY,
            chain_id TEXT NOT NULL,
            menu_name TEXT NOT NULL,
            category TEXT,
            price INTEGER,
            calories REAL,
            protein REAL,
            fat REAL,
            carb REAL,
            sodium REAL,
            fiber REAL,
            muscle_score REAL,
            diet_score REAL,
            health_score REAL,
            created_at TEXT DEFAULT (datetime('now', 'localtime')),
            updated_at TEXT DEFAULT (datetime('now', 'localtime')),
            FOREIGN KEY (chain_id) REFERENCES chains(chain_id)
        );

        -- インデックス作成
        CREATE INDEX IF NOT EXISTS idx_menus_chain_id ON menus(chain_id);
        CREATE INDEX IF NOT EXISTS idx_menus_protein ON menus(protein);
        CREATE INDEX IF NOT EXISTS idx_menus_calories ON menus(calories);
        CREATE INDEX IF NOT EXISTS idx_menus_muscle_score ON menus(muscle_score);
    ''')

    conn.commit()
    conn.close()
    print(f'Database initialized: {db_path}')

if __name__ == '__main__':
    init_database('data/chain_restaurant.db')
```

### 9.2 メニュー検索クエリ例

```python
# python/scripts/search_menus.py
import sqlite3
from typing import List, Dict, Any

def get_high_protein_menus(
    db_path: str,
    chain_id: str = None,
    min_protein: float = 20,
    max_calories: float = 800,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """高タンパク低カロリーメニューを検索"""

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    query = '''
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
        INNER JOIN chains c ON m.chain_id = c.chain_id
        WHERE m.protein >= ?
          AND m.calories <= ?
    '''
    params = [min_protein, max_calories]

    if chain_id:
        query += ' AND m.chain_id = ?'
        params.append(chain_id)

    query += ' ORDER BY m.protein DESC LIMIT ?'
    params.append(limit)

    cursor.execute(query, params)
    results = [dict(row) for row in cursor.fetchall()]

    conn.close()
    return results

# 使用例
if __name__ == '__main__':
    menus = get_high_protein_menus(
        'data/chain_restaurant.db',
        min_protein=25,
        max_calories=600,
        limit=5
    )
    for menu in menus:
        print(f"{menu['chain_name']} - {menu['menu_name']}: {menu['protein']}g")
```

---

## 10. よくあるエラーと対処法

### 10.1 database is locked

```python
# 原因: 別のプロセスがデータベースを使用中

# 対処法1: タイムアウトを設定
conn = sqlite3.connect('chain_restaurant.db', timeout=30)

# 対処法2: WALモードを使用
conn.execute('PRAGMA journal_mode = WAL')
```

### 10.2 no such table

```python
# 原因: テーブルが存在しない

# 対処法: テーブル存在確認
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", ('menus',))
if cursor.fetchone() is None:
    # テーブルを作成
    pass
```

### 10.3 UNIQUE constraint failed

```python
# 原因: PRIMARY KEY または UNIQUE 制約違反

# 対処法: INSERT OR REPLACE を使用
cursor.execute('''
    INSERT OR REPLACE INTO menus (menu_id, chain_id, menu_name, ...)
    VALUES (?, ?, ?, ...)
''', values)
```

---

## 11. まとめ

### 11.1 SQLite を選ぶべき場面

- MVP・プロトタイプ開発
- 読み取り中心のワークロード
- 単一サーバーでの運用
- セットアップ時間を最小化したい場合

### 11.2 PostgreSQL に移行すべき場面

- データ量が10万レコードを超える
- 同時書き込みが多い
- 複数サーバーからのアクセス
- 高度な検索機能が必要（全文検索など）

### 11.3 このプロジェクトでの推奨

```
Phase 1-2: SQLite
  - MVP開発
  - データ収集・検証

Phase 3以降: PostgreSQL（必要に応じて）
  - ユーザー数増加
  - リアルタイム更新が必要な場合
```
