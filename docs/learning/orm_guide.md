# ORM（Object-Relational Mapping）学習ガイド

## 1. ORMとは

### 1.1 概要

ORM（Object-Relational Mapping）は、データベースのテーブルとプログラムのオブジェクト（クラス）を対応付ける技術です。

```
従来のSQL:
  SQL文を直接書いてデータベースを操作

ORM:
  オブジェクト/メソッドでデータベースを操作
  → SQLを自動生成
```

### 1.2 メリット・デメリット

| メリット | デメリット |
|---------|-----------|
| SQLを書かなくてよい | 学習コストがある |
| 型安全（TypeScript） | 複雑なクエリは苦手 |
| マイグレーション管理 | パフォーマンス低下の可能性 |
| データベース切り替えが容易 | 抽象化による制御の喪失 |

### 1.3 このプロジェクトでの選択肢

```
TypeScript（Next.js）側:
  ├── Drizzle ORM（推奨）
  ├── Prisma
  └── better-sqlite3（生SQL）

Python側:
  ├── SQLAlchemy（推奨）
  ├── Peewee
  └── sqlite3（生SQL）
```

---

## 2. TypeScript: Drizzle ORM（推奨）

### 2.1 なぜDrizzleを推奨するか

```
Drizzle の特徴:
- SQLライクな構文（学習コストが低い）
- 型安全
- 軽量・高速
- SQLiteサポートが優秀
- マイグレーション機能あり
```

### 2.2 インストール

```bash
# Drizzle ORM と SQLite ドライバ
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3
```

### 2.3 スキーマ定義

```typescript
// lib/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// chains テーブル
export const chains = sqliteTable('chains', {
  chainId: text('chain_id').primaryKey(),
  chainName: text('chain_name').notNull(),
  chainNameEn: text('chain_name_en').notNull(),
  category: text('category').notNull(),
  officialUrl: text('official_url'),
  nutritionUrl: text('nutrition_url'),
  createdAt: text('created_at').default("datetime('now', 'localtime')"),
  updatedAt: text('updated_at').default("datetime('now', 'localtime')"),
});

// menus テーブル
export const menus = sqliteTable('menus', {
  menuId: text('menu_id').primaryKey(),
  chainId: text('chain_id').notNull().references(() => chains.chainId),
  menuName: text('menu_name').notNull(),
  category: text('category'),
  price: integer('price'),
  calories: real('calories'),
  protein: real('protein'),
  fat: real('fat'),
  carb: real('carb'),
  sodium: real('sodium'),
  fiber: real('fiber'),
  muscleScore: real('muscle_score'),
  dietScore: real('diet_score'),
  healthScore: real('health_score'),
  createdAt: text('created_at').default("datetime('now', 'localtime')"),
  updatedAt: text('updated_at').default("datetime('now', 'localtime')"),
});

// 型のエクスポート
export type Chain = typeof chains.$inferSelect;
export type NewChain = typeof chains.$inferInsert;
export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
```

### 2.4 データベース接続

```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// データベースファイルのパス
const sqlite = new Database('data/chain_restaurant.db');

// Drizzle インスタンスを作成
export const db = drizzle(sqlite, { schema });

// 型付きのスキーマをエクスポート
export { chains, menus } from './schema';
export type { Chain, NewChain, Menu, NewMenu } from './schema';
```

### 2.5 基本的なCRUD操作

#### SELECT（取得）

```typescript
import { db, menus, chains } from '@/lib/db';
import { eq, gt, and, desc, sql } from 'drizzle-orm';

// 全件取得
const allMenus = await db.select().from(menus);

// 条件付き取得
const matsuyaMenus = await db
  .select()
  .from(menus)
  .where(eq(menus.chainId, 'matsuya'));

// 複数条件
const highProteinMenus = await db
  .select()
  .from(menus)
  .where(
    and(
      gt(menus.protein, 20),
      gt(menus.calories, 0)
    )
  );

// ソートと件数制限
const topProteinMenus = await db
  .select()
  .from(menus)
  .orderBy(desc(menus.protein))
  .limit(10);

// 特定のカラムのみ取得
const menuNames = await db
  .select({
    name: menus.menuName,
    protein: menus.protein,
    calories: menus.calories,
  })
  .from(menus);

// JOINを使った取得
const menusWithChain = await db
  .select({
    menuName: menus.menuName,
    protein: menus.protein,
    chainName: chains.chainName,
  })
  .from(menus)
  .innerJoin(chains, eq(menus.chainId, chains.chainId));

// 1件取得
const menu = await db
  .select()
  .from(menus)
  .where(eq(menus.menuId, 'matsuya_gyudon'))
  .get(); // .get() で単一レコード取得
```

#### INSERT（挿入）

```typescript
import { db, chains, menus } from '@/lib/db';
import type { NewChain, NewMenu } from '@/lib/db';

// 単一レコード挿入
const newChain: NewChain = {
  chainId: 'yoshinoya',
  chainName: '吉野家',
  chainNameEn: 'Yoshinoya',
  category: '牛丼',
  officialUrl: 'https://www.yoshinoya.com/',
};

await db.insert(chains).values(newChain);

// 複数レコード挿入
const newMenus: NewMenu[] = [
  {
    menuId: 'yoshinoya_gyudon',
    chainId: 'yoshinoya',
    menuName: '牛丼',
    price: 468,
    calories: 635,
    protein: 20.2,
    fat: 20.4,
    carb: 89.0,
  },
  {
    menuId: 'yoshinoya_gyudon_l',
    chainId: 'yoshinoya',
    menuName: '牛丼 大盛',
    price: 619,
    calories: 846,
    protein: 27.3,
    fat: 25.3,
    carb: 120.4,
  },
];

await db.insert(menus).values(newMenus);

// UPSERT（存在すれば更新、なければ挿入）
await db
  .insert(menus)
  .values(newMenu)
  .onConflictDoUpdate({
    target: menus.menuId,
    set: {
      price: newMenu.price,
      calories: newMenu.calories,
      protein: newMenu.protein,
    },
  });
```

#### UPDATE（更新）

```typescript
import { db, menus } from '@/lib/db';
import { eq } from 'drizzle-orm';

// 単一レコード更新
await db
  .update(menus)
  .set({ price: 400 })
  .where(eq(menus.menuId, 'matsuya_gyudon'));

// 複数カラム更新
await db
  .update(menus)
  .set({
    price: 400,
    calories: 700,
    updatedAt: sql`datetime('now', 'localtime')`,
  })
  .where(eq(menus.menuId, 'matsuya_gyudon'));
```

#### DELETE（削除）

```typescript
import { db, menus } from '@/lib/db';
import { eq, lt } from 'drizzle-orm';

// 単一レコード削除
await db
  .delete(menus)
  .where(eq(menus.menuId, 'matsuya_gyudon'));

// 条件付き削除
await db
  .delete(menus)
  .where(lt(menus.calories, 100));
```

### 2.6 高度なクエリ

```typescript
import { db, menus, chains } from '@/lib/db';
import { eq, gt, and, or, like, sql, avg, count } from 'drizzle-orm';

// LIKE検索
const results = await db
  .select()
  .from(menus)
  .where(like(menus.menuName, '%カレー%'));

// OR条件
const results = await db
  .select()
  .from(menus)
  .where(
    or(
      eq(menus.chainId, 'matsuya'),
      eq(menus.chainId, 'yoshinoya')
    )
  );

// 集計クエリ
const stats = await db
  .select({
    chainId: menus.chainId,
    avgCalories: avg(menus.calories),
    avgProtein: avg(menus.protein),
    menuCount: count(),
  })
  .from(menus)
  .groupBy(menus.chainId);

// 生SQLの使用
const results = await db.all(sql`
  SELECT
    m.menu_name,
    m.protein,
    c.chain_name
  FROM menus m
  INNER JOIN chains c ON m.chain_id = c.chain_id
  WHERE m.protein > ${20}
  ORDER BY m.protein DESC
  LIMIT ${10}
`);
```

### 2.7 マイグレーション

```typescript
// drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './lib/db/schema.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './data/chain_restaurant.db',
  },
} satisfies Config;
```

```bash
# マイグレーションファイル生成
npx drizzle-kit generate:sqlite

# マイグレーション実行
npx drizzle-kit push:sqlite

# スタジオ（GUI）起動
npx drizzle-kit studio
```

---

## 3. TypeScript: Prisma（代替案）

### 3.1 Prismaの特徴

```
Prisma の特徴:
- 直感的なスキーマ定義言語
- 強力な型生成
- GUI（Prisma Studio）
- ドキュメントが充実

デメリット:
- SQLiteでの制限がある
- バンドルサイズが大きい
- Edge Runtimeで動作しない
```

### 3.2 インストール

```bash
npm install prisma @prisma/client
npx prisma init
```

### 3.3 スキーマ定義

```prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite"
  url      = "file:../data/chain_restaurant.db"
}

generator client {
  provider = "prisma-client-js"
}

model Chain {
  chainId     String   @id @map("chain_id")
  chainName   String   @map("chain_name")
  chainNameEn String   @map("chain_name_en")
  category    String
  officialUrl String?  @map("official_url")
  nutritionUrl String? @map("nutrition_url")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  menus       Menu[]

  @@map("chains")
}

model Menu {
  menuId      String   @id @map("menu_id")
  chainId     String   @map("chain_id")
  menuName    String   @map("menu_name")
  category    String?
  price       Int?
  calories    Float?
  protein     Float?
  fat         Float?
  carb        Float?
  sodium      Float?
  fiber       Float?
  muscleScore Float?   @map("muscle_score")
  dietScore   Float?   @map("diet_score")
  healthScore Float?   @map("health_score")
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")
  chain       Chain    @relation(fields: [chainId], references: [chainId])

  @@map("menus")
}
```

### 3.4 基本的な操作

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// SELECT
const allMenus = await prisma.menu.findMany();

const highProteinMenus = await prisma.menu.findMany({
  where: {
    protein: { gt: 20 },
    calories: { lt: 800 },
  },
  orderBy: { protein: 'desc' },
  take: 10,
});

// JOINを含む取得
const menusWithChain = await prisma.menu.findMany({
  include: { chain: true },
});

// INSERT
await prisma.chain.create({
  data: {
    chainId: 'sukiya',
    chainName: 'すき家',
    chainNameEn: 'Sukiya',
    category: '牛丼',
  },
});

// UPDATE
await prisma.menu.update({
  where: { menuId: 'matsuya_gyudon' },
  data: { price: 400 },
});

// DELETE
await prisma.menu.delete({
  where: { menuId: 'matsuya_gyudon' },
});
```

---

## 4. Python: SQLAlchemy（推奨）

### 4.1 SQLAlchemyの特徴

```
SQLAlchemy の特徴:
- Pythonで最も人気のあるORM
- 2つのスタイル（Core と ORM）
- 柔軟性が高い
- あらゆるデータベースに対応
```

### 4.2 インストール

```bash
pip install sqlalchemy
```

### 4.3 スキーマ定義（ORM スタイル）

```python
# python/models/database.py
from sqlalchemy import create_engine, Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime

Base = declarative_base()

class Chain(Base):
    __tablename__ = 'chains'

    chain_id = Column(String, primary_key=True)
    chain_name = Column(String, nullable=False)
    chain_name_en = Column(String, nullable=False)
    category = Column(String, nullable=False)
    official_url = Column(String)
    nutrition_url = Column(String)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # リレーション
    menus = relationship('Menu', back_populates='chain')

    def __repr__(self):
        return f"<Chain(chain_id='{self.chain_id}', chain_name='{self.chain_name}')>"


class Menu(Base):
    __tablename__ = 'menus'

    menu_id = Column(String, primary_key=True)
    chain_id = Column(String, ForeignKey('chains.chain_id'), nullable=False)
    menu_name = Column(String, nullable=False)
    category = Column(String)
    price = Column(Integer)
    calories = Column(Float)
    protein = Column(Float)
    fat = Column(Float)
    carb = Column(Float)
    sodium = Column(Float)
    fiber = Column(Float)
    muscle_score = Column(Float)
    diet_score = Column(Float)
    health_score = Column(Float)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    # リレーション
    chain = relationship('Chain', back_populates='menus')

    def __repr__(self):
        return f"<Menu(menu_id='{self.menu_id}', menu_name='{self.menu_name}')>"


# データベース接続
def get_engine(db_path: str = 'data/chain_restaurant.db'):
    return create_engine(f'sqlite:///{db_path}', echo=False)


def get_session(engine):
    Session = sessionmaker(bind=engine)
    return Session()


def init_db(engine):
    Base.metadata.create_all(engine)
```

### 4.4 基本的なCRUD操作

```python
# python/scripts/orm_examples.py
from models.database import Chain, Menu, get_engine, get_session, init_db

# エンジンとセッションの作成
engine = get_engine('data/chain_restaurant.db')
init_db(engine)
session = get_session(engine)

# ========== INSERT ==========

# 単一レコード挿入
new_chain = Chain(
    chain_id='matsuya',
    chain_name='松屋',
    chain_name_en='Matsuya',
    category='牛丼',
    official_url='https://www.matsuyafoods.co.jp/'
)
session.add(new_chain)
session.commit()

# 複数レコード挿入
new_menus = [
    Menu(
        menu_id='matsuya_gyudon',
        chain_id='matsuya',
        menu_name='牛めし',
        price=380,
        calories=692,
        protein=18.2,
        fat=23.1,
        carb=104.5
    ),
    Menu(
        menu_id='matsuya_gyudon_l',
        chain_id='matsuya',
        menu_name='牛めし 大盛',
        price=530,
        calories=965,
        protein=25.4,
        fat=32.2,
        carb=145.8
    ),
]
session.add_all(new_menus)
session.commit()


# ========== SELECT ==========

# 全件取得
all_menus = session.query(Menu).all()
for menu in all_menus:
    print(f"{menu.menu_name}: {menu.protein}g")

# 条件付き取得
matsuya_menus = session.query(Menu).filter(Menu.chain_id == 'matsuya').all()

# 複数条件
high_protein_menus = session.query(Menu).filter(
    Menu.protein > 20,
    Menu.calories < 800
).all()

# OR条件
from sqlalchemy import or_
results = session.query(Menu).filter(
    or_(
        Menu.chain_id == 'matsuya',
        Menu.chain_id == 'yoshinoya'
    )
).all()

# ソートと件数制限
top_menus = session.query(Menu).order_by(Menu.protein.desc()).limit(10).all()

# 1件取得
menu = session.query(Menu).filter(Menu.menu_id == 'matsuya_gyudon').first()

# JOINを使った取得
results = session.query(Menu, Chain).join(Chain).filter(Menu.protein > 20).all()
for menu, chain in results:
    print(f"{chain.chain_name} - {menu.menu_name}: {menu.protein}g")

# 特定のカラムのみ取得
results = session.query(Menu.menu_name, Menu.protein).filter(Menu.chain_id == 'matsuya').all()


# ========== UPDATE ==========

# 単一レコード更新
menu = session.query(Menu).filter(Menu.menu_id == 'matsuya_gyudon').first()
if menu:
    menu.price = 400
    session.commit()

# 一括更新
session.query(Menu).filter(Menu.chain_id == 'matsuya').update({'category': 'メイン'})
session.commit()


# ========== DELETE ==========

# 単一レコード削除
menu = session.query(Menu).filter(Menu.menu_id == 'matsuya_gyudon').first()
if menu:
    session.delete(menu)
    session.commit()

# 条件付き一括削除
session.query(Menu).filter(Menu.calories > 1500).delete()
session.commit()


# セッションを閉じる
session.close()
```

### 4.5 高度なクエリ

```python
from sqlalchemy import func, and_, or_, desc

# 集計クエリ
stats = session.query(
    Menu.chain_id,
    func.avg(Menu.calories).label('avg_calories'),
    func.avg(Menu.protein).label('avg_protein'),
    func.count().label('menu_count')
).group_by(Menu.chain_id).all()

for stat in stats:
    print(f"{stat.chain_id}: avg_cal={stat.avg_calories:.1f}, count={stat.menu_count}")

# サブクエリ
from sqlalchemy.orm import aliased

avg_protein = session.query(func.avg(Menu.protein)).scalar()
high_protein_menus = session.query(Menu).filter(Menu.protein > avg_protein).all()

# LIKE検索
results = session.query(Menu).filter(Menu.menu_name.like('%カレー%')).all()

# IN句
chain_ids = ['matsuya', 'yoshinoya', 'sukiya']
results = session.query(Menu).filter(Menu.chain_id.in_(chain_ids)).all()

# EXISTS
from sqlalchemy import exists
has_menus = session.query(
    exists().where(Menu.chain_id == 'matsuya')
).scalar()
```

### 4.6 トランザクション

```python
from sqlalchemy.exc import SQLAlchemyError

try:
    # トランザクション開始
    new_chain = Chain(chain_id='test', chain_name='テスト', ...)
    session.add(new_chain)

    new_menu = Menu(menu_id='test_menu', chain_id='test', ...)
    session.add(new_menu)

    # コミット
    session.commit()
except SQLAlchemyError as e:
    # ロールバック
    session.rollback()
    print(f"Error: {e}")
finally:
    session.close()
```

### 4.7 コンテキストマネージャー

```python
from contextlib import contextmanager

@contextmanager
def get_db_session():
    engine = get_engine('data/chain_restaurant.db')
    session = get_session(engine)
    try:
        yield session
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
    finally:
        session.close()

# 使用例
with get_db_session() as session:
    menus = session.query(Menu).filter(Menu.protein > 20).all()
    for menu in menus:
        print(menu.menu_name)
```

---

## 5. Python: Peewee（軽量代替案）

### 5.1 Peeweeの特徴

```
Peewee の特徴:
- 軽量・シンプル
- Django ORMに似た構文
- SQLiteに最適
- 学習コストが低い
```

### 5.2 インストールと使用

```bash
pip install peewee
```

```python
# python/models/peewee_models.py
from peewee import *
from datetime import datetime

db = SqliteDatabase('data/chain_restaurant.db')

class BaseModel(Model):
    class Meta:
        database = db

class Chain(BaseModel):
    chain_id = CharField(primary_key=True)
    chain_name = CharField()
    chain_name_en = CharField()
    category = CharField()
    official_url = CharField(null=True)
    nutrition_url = CharField(null=True)
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        table_name = 'chains'

class Menu(BaseModel):
    menu_id = CharField(primary_key=True)
    chain = ForeignKeyField(Chain, backref='menus', column_name='chain_id')
    menu_name = CharField()
    category = CharField(null=True)
    price = IntegerField(null=True)
    calories = FloatField(null=True)
    protein = FloatField(null=True)
    fat = FloatField(null=True)
    carb = FloatField(null=True)
    muscle_score = FloatField(null=True)
    diet_score = FloatField(null=True)
    health_score = FloatField(null=True)
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)

    class Meta:
        table_name = 'menus'

# テーブル作成
db.connect()
db.create_tables([Chain, Menu])
```

### 5.3 基本操作

```python
# INSERT
Chain.create(
    chain_id='matsuya',
    chain_name='松屋',
    chain_name_en='Matsuya',
    category='牛丼'
)

# SELECT
all_menus = Menu.select()
matsuya_menus = Menu.select().where(Menu.chain == 'matsuya')
high_protein = Menu.select().where(Menu.protein > 20).order_by(Menu.protein.desc())

# JOIN
query = (Menu
    .select(Menu, Chain)
    .join(Chain)
    .where(Menu.protein > 20))

# UPDATE
Menu.update(price=400).where(Menu.menu_id == 'matsuya_gyudon').execute()

# DELETE
Menu.delete().where(Menu.menu_id == 'matsuya_gyudon').execute()
```

---

## 6. このプロジェクトでの推奨構成

### 6.1 推奨

```
Next.js（フロントエンド）:
  → Drizzle ORM
  → SQLite（better-sqlite3）

Python（バッチ処理）:
  → SQLAlchemy または 生sqlite3
  → データ収集・前処理に使用
```

### 6.2 理由

```
Drizzle ORM:
- SQLライクで学習しやすい
- 型安全
- SQLiteとの相性が良い
- 軽量

SQLAlchemy（Python）:
- 業界標準
- 柔軟性が高い
- ドキュメントが豊富
```

### 6.3 ディレクトリ構成

```
healthy/
├── lib/
│   └── db/
│       ├── index.ts       # Drizzle 接続
│       ├── schema.ts      # スキーマ定義
│       └── queries.ts     # 共通クエリ関数
├── python/
│   ├── models/
│   │   └── database.py    # SQLAlchemy モデル
│   └── scripts/
│       └── scraper.py     # スクレイピング（ORM使用）
└── data/
    └── chain_restaurant.db
```

---

## 7. 実践例：メニュー検索API

### 7.1 Drizzle（Next.js API Routes）

```typescript
// app/api/menus/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, menus, chains } from '@/lib/db';
import { eq, gt, and, desc, like } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const chainId = searchParams.get('chainId');
  const minProtein = searchParams.get('minProtein');
  const maxCalories = searchParams.get('maxCalories');
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '20');

  // クエリ条件を動的に構築
  const conditions = [];

  if (chainId) {
    conditions.push(eq(menus.chainId, chainId));
  }

  if (minProtein) {
    conditions.push(gt(menus.protein, parseFloat(minProtein)));
  }

  if (maxCalories) {
    conditions.push(gt(parseFloat(maxCalories), menus.calories));
  }

  if (search) {
    conditions.push(like(menus.menuName, `%${search}%`));
  }

  try {
    const results = await db
      .select({
        menuId: menus.menuId,
        menuName: menus.menuName,
        price: menus.price,
        calories: menus.calories,
        protein: menus.protein,
        fat: menus.fat,
        carb: menus.carb,
        muscleScore: menus.muscleScore,
        chainName: chains.chainName,
      })
      .from(menus)
      .innerJoin(chains, eq(menus.chainId, chains.chainId))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(menus.protein))
      .limit(limit);

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Database error' },
      { status: 500 }
    );
  }
}
```

### 7.2 SQLAlchemy（Python バッチ処理）

```python
# python/scripts/update_scores.py
from models.database import Menu, get_engine, get_session

def calculate_muscle_score(menu: Menu) -> float:
    """筋トレスコアを計算"""
    if not menu.protein or not menu.calories:
        return 0.0

    # タンパク質/カロリー比率をベースに計算
    protein_ratio = (menu.protein * 4) / menu.calories * 100  # タンパク質カロリー比率
    base_score = min(protein_ratio * 2, 100)

    # ボーナス: 高タンパク
    if menu.protein >= 30:
        base_score += 10
    elif menu.protein >= 20:
        base_score += 5

    return min(base_score, 100)


def update_all_scores():
    engine = get_engine('data/chain_restaurant.db')
    session = get_session(engine)

    try:
        menus = session.query(Menu).all()

        for menu in menus:
            menu.muscle_score = calculate_muscle_score(menu)

        session.commit()
        print(f"Updated {len(menus)} menus")
    except Exception as e:
        session.rollback()
        print(f"Error: {e}")
    finally:
        session.close()


if __name__ == '__main__':
    update_all_scores()
```

---

## 8. まとめ

### 8.1 選択ガイド

| 用途 | 推奨ORM | 理由 |
|------|---------|------|
| Next.js API | Drizzle | 軽量、型安全、SQLite対応 |
| Python バッチ | SQLAlchemy | 業界標準、柔軟性 |
| 軽量Python | Peewee | シンプル、学習コスト低 |
| 複雑なクエリ | 生SQL | 最大の柔軟性 |

### 8.2 学習の順序

```
1. まず生SQLを理解する（sqlite_basics.md）
2. Drizzle ORM を学ぶ（TypeScript）
3. 必要に応じてSQLAlchemyを学ぶ（Python）
```

### 8.3 注意点

- ORMは便利だが、生成されるSQLを理解しておく
- 複雑なクエリは生SQLの方が効率的な場合がある
- パフォーマンスが重要な場合はEXPLAINで実行計画を確認
