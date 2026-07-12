import type { MenuSelect } from "@/lib/db/schema";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://chenmeshi.com";

// ============================
// ItemList（メニュー一覧ページ用）
// ============================
export function buildMenuItemListJsonLd(name: string, menus: MenuSelect[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    numberOfItems: menus.length,
    itemListElement: menus.map((menu, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${BASE_URL}/menu/${menu.menuId}`,
      item: {
        "@type": "MenuItem",
        name: menu.menuName,
        url: `${BASE_URL}/menu/${menu.menuId}`,
        offers: menu.price
          ? {
              "@type": "Offer",
              price: menu.price,
              priceCurrency: "JPY",
            }
          : undefined,
        nutrition: {
          "@type": "NutritionInformation",
          calories: `${menu.calories} cal`,
          proteinContent: `${menu.protein} g`,
          fatContent: `${menu.fat} g`,
          carbohydrateContent: `${menu.carb} g`,
        },
      },
    })),
  };
}

// ============================
// パンくずリスト
// ============================
export function buildBreadcrumbJsonLd(
  items: { name: string; path?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.path !== undefined ? `${BASE_URL}${item.path}` : undefined,
    })),
  };
}

// ============================
// サイト全体（ルートレイアウト用）
// ============================
export function buildWebSiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "チェンメシ",
    url: BASE_URL,
    description:
      "チェーン店のメニューをPFC（タンパク質・脂質・炭水化物）や価格で比較できるサービス",
    inLanguage: "ja",
  };
}
