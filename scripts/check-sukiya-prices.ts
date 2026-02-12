import Database from "better-sqlite3";

const db = new Database("data/chain_restaurant.db");

// 価格NULLのすき家メニューを取得
const nullPriceMenus = db.prepare(`
  SELECT m.menu_id, m.menu_name, m.category, m.price
  FROM menus m
  WHERE m.chain_id = 'sukiya'
  AND m.price IS NULL
  ORDER BY m.category, m.menu_name
`).all() as { menu_id: string; menu_name: string; category: string; price: number | null }[];

console.log("=== 価格NULLのすき家メニュー ===");
console.log("件数:", nullPriceMenus.length);
console.log("");

// カテゴリ別に表示
const byCategory: Record<string, typeof nullPriceMenus> = {};
for (const m of nullPriceMenus) {
  const cat = m.category || "不明";
  if (!byCategory[cat]) byCategory[cat] = [];
  byCategory[cat].push(m);
}

for (const [cat, items] of Object.entries(byCategory)) {
  console.log(`【${cat}】(${items.length}件)`);
  for (const item of items) {
    console.log(`  - ${item.menu_name}`);
  }
  console.log("");
}

// 全体統計
const total = db.prepare(`
  SELECT COUNT(*) as total,
         SUM(CASE WHEN price IS NOT NULL THEN 1 ELSE 0 END) as with_price,
         SUM(CASE WHEN price IS NULL THEN 1 ELSE 0 END) as without_price
  FROM menus m
  WHERE m.chain_id = 'sukiya'
`).get() as { total: number; with_price: number; without_price: number };

console.log("=== 全体統計 ===");
console.log(`全メニュー: ${total.total}件`);
console.log(`価格あり: ${total.with_price}件 (${Math.round(total.with_price / total.total * 100)}%)`);
console.log(`価格なし: ${total.without_price}件 (${Math.round(total.without_price / total.total * 100)}%)`);

db.close();
