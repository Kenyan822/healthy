"use client";

import { useRouter } from "next/navigation";

type Props = {
  storeId: string;
};

export function NutritionFilters({ storeId }: Props) {
  const router = useRouter();

  const handleSelect = (value: string) => {
    if (value) {
      router.push(`/${storeId}/${value}`);
    }
  };

  return (
    <div className="flex flex-wrap gap-3">
      {/* タンパク質 */}
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-red-500/10 flex items-center justify-center text-xs font-bold text-red-600">
          P
        </span>
        <select
          className="px-3 py-2 bg-card-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          defaultValue=""
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="" disabled>
            タンパク質
          </option>
          <option value="protein-over-20g">20g以上</option>
          <option value="protein-over-30g">30g以上</option>
          <option value="protein-over-40g">40g以上</option>
          <option value="protein-over-50g">50g以上</option>
          <option value="protein-over-60g">60g以上</option>
        </select>
      </div>

      {/* 脂質 */}
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-yellow-500/10 flex items-center justify-center text-xs font-bold text-yellow-600">
          F
        </span>
        <select
          className="px-3 py-2 bg-card-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          defaultValue=""
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="" disabled>
            脂質
          </option>
          <option value="fat-under-10g">10g以下</option>
          <option value="fat-under-20g">20g以下</option>
          <option value="fat-under-30g">30g以下</option>
          <option value="fat-under-40g">40g以下</option>
        </select>
      </div>

      {/* 糖質 */}
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-xs font-bold text-blue-600">
          C
        </span>
        <select
          className="px-3 py-2 bg-card-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          defaultValue=""
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="" disabled>
            糖質
          </option>
          <option value="carb-under-20g">20g以下</option>
          <option value="carb-under-30g">30g以下</option>
          <option value="carb-under-40g">40g以下</option>
          <option value="carb-under-50g">50g以下</option>
          <option value="carb-under-60g">60g以下</option>
          <option value="carb-under-80g">80g以下</option>
          <option value="carb-under-100g">100g以下</option>
        </select>
      </div>

      {/* 価格 */}
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center text-xs font-bold text-green-600">
          ¥
        </span>
        <select
          className="px-3 py-2 bg-card-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          defaultValue=""
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="" disabled>
            価格
          </option>
          <option value="under-400yen">400円以下</option>
          <option value="under-500yen">500円以下</option>
          <option value="under-600yen">600円以下</option>
          <option value="under-700yen">700円以下</option>
          <option value="under-800yen">800円以下</option>
          <option value="under-900yen">900円以下</option>
          <option value="under-1000yen">1000円以下</option>
          <option value="under-1200yen">1200円以下</option>
          <option value="under-1500yen">1500円以下</option>
        </select>
      </div>

      {/* 時間帯 */}
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center text-xs font-bold text-purple-600">
          時
        </span>
        <select
          className="px-3 py-2 bg-card-bg border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          defaultValue=""
          onChange={(e) => handleSelect(e.target.value)}
        >
          <option value="" disabled>
            時間帯
          </option>
          <option value="breakfast">朝食メニュー</option>
          <option value="lunch">ランチメニュー</option>
        </select>
      </div>
    </div>
  );
}
