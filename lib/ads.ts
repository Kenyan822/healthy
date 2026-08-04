/**
 * AdSense 広告ユニットのスロットID。
 *
 * AdSense管理画面で「広告ユニット」を作ると slot ID（10桁前後の数字）が発行される。
 * それを環境変数に入れる。未設定でも AdUnit 側が no-op になるので安全。
 *
 * 最小構成は1ユニットの使い回しでも可（同じIDを複数箇所に置ける）。
 * ページ種別で分けたい場合のみ個別に発行する。
 */
export const AD_SLOTS = {
  // メニュー詳細ページ本文内（最も流入が多い）
  menuDetail: process.env.NEXT_PUBLIC_ADSENSE_SLOT_MENU ?? "",
  // 店×絞り込みなどの一覧ページ本文内
  listing: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LISTING ?? "",
} as const;
