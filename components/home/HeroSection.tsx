"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { SiteStats } from "@/types";
import { formatNumber, formatPrice } from "@/lib/utils";
import { presets } from "@/lib/presets";
import { getCurrentPosition, formatDistance } from "@/lib/location";
import type { PresetId, SortBy, SearchResultMenu, SearchResponse, UserLocation } from "@/types/search";

interface HeroSectionProps {
  stats: SiteStats;
}

type SearchMode = "preset" | "pfc";
type LocationStatus = "idle" | "loading" | "success" | "denied" | "unavailable" | "error";

interface NearbyStore {
  chainId: string;
  chainName: string;
  storeName: string;
  address: string;
  distance: number;
  lat: number;
  lng: number;
  placeId: string;
  category: string;
}

export function HeroSection({ stats }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);
  const [searchMode, setSearchMode] = useState<SearchMode>("preset");
  const [selectedPresets, setSelectedPresets] = useState<PresetId[]>([]);
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [carb, setCarb] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("pfcMatch");
  const [results, setResults] = useState<SearchResultMenu[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // 位置情報関連のstate
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyStores, setNearbyStores] = useState<NearbyStore[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 現在地を取得して近くの店舗を検索
  const fetchNearbyStores = useCallback(async () => {
    setLocationStatus("loading");
    setIsLoadingStores(true);

    try {
      // ブラウザのGeolocation APIで現在地を取得
      const position = await getCurrentPosition();
      setUserLocation(position);
      setLocationStatus("success");

      // 近くの店舗を検索
      const response = await fetch(
        `/api/stores/nearby?lat=${position.lat}&lng=${position.lng}&radius=3000&limit=6`
      );
      const data = await response.json();

      if (data.success) {
        setNearbyStores(data.data);
      }
    } catch (error) {
      if (error instanceof GeolocationPositionError) {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationStatus("denied");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationStatus("unavailable");
        } else {
          setLocationStatus("error");
        }
      } else {
        setLocationStatus("error");
      }
      console.error("Location error:", error);
    } finally {
      setIsLoadingStores(false);
    }
  }, []);

  const executeSearch = useCallback(async (params: URLSearchParams) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`/api/menus/search?${params.toString()}`);
      const data: SearchResponse = await response.json();
      if (data.success) {
        setResults(data.data.slice(0, 6)); // トップ6件のみ表示
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handlePresetClick = (presetId: PresetId) => {
    // トグル方式: 選択済みなら解除、未選択なら追加
    const newSelectedPresets = selectedPresets.includes(presetId)
      ? selectedPresets.filter(id => id !== presetId)
      : [...selectedPresets, presetId];

    setSelectedPresets(newSelectedPresets);
    setSearchMode("preset");

    // 選択されたプリセットがある場合のみ検索
    if (newSelectedPresets.length > 0) {
      const params = new URLSearchParams();
      params.set("preset", newSelectedPresets.join(","));
      params.set("sortBy", sortBy);
      params.set("limit", "6");
      executeSearch(params);
    } else {
      // 全て解除された場合は結果をクリア
      setResults([]);
      setHasSearched(false);
    }
  };

  const handlePFCSearch = () => {
    const p = parseFloat(protein) || 0;
    const f = parseFloat(fat) || 0;
    const c = parseFloat(carb) || 0;
    if (p === 0 && f === 0 && c === 0) return;

    setSearchMode("pfc");
    setSelectedPresets([]);
    const params = new URLSearchParams();
    if (p > 0) params.set("protein", p.toString());
    if (f > 0) params.set("fat", f.toString());
    if (c > 0) params.set("carb", c.toString());
    params.set("sortBy", sortBy);
    params.set("limit", "6");
    executeSearch(params);
  };

  const floatingFood = [
    { icon: "🥗", delay: "0s", left: "10%", top: "20%", rotate: "12deg", size: "text-4xl" },
    { icon: "🍖", delay: "2s", left: "85%", top: "15%", rotate: "-12deg", size: "text-5xl" },
    { icon: "🥑", delay: "4s", left: "80%", top: "60%", rotate: "24deg", size: "text-3xl" },
    { icon: "🥦", delay: "1s", left: "5%", top: "70%", rotate: "-15deg", size: "text-4xl" },
    { icon: "🍤", delay: "3s", left: "15%", top: "10%", rotate: "45deg", size: "text-2xl" },
    { icon: "🥚", delay: "5s", left: "90%", top: "85%", rotate: "-30deg", size: "text-3xl" },
  ];

  const presetCards = [
    { id: "high_protein" as PresetId, icon: "🍗", label: "高タンパク", bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-800 dark:text-orange-200", hover: "hover:bg-orange-100 dark:hover:bg-orange-900/30" },
    { id: "low_fat" as PresetId, icon: "🥗", label: "低脂質", bg: "bg-yellow-50 dark:bg-yellow-900/20", text: "text-yellow-800 dark:text-yellow-200", hover: "hover:bg-yellow-100 dark:hover:bg-yellow-900/30" },
    { id: "low_carb" as PresetId, icon: "⚖️", label: "低糖質", bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-800 dark:text-blue-200", hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30" },
    { id: "balanced" as PresetId, icon: "🎯", label: "バランス", bg: "bg-green-50 dark:bg-green-900/20", text: "text-green-800 dark:text-green-200", hover: "hover:bg-green-100 dark:hover:bg-green-900/30" },
  ];

  return (
    <section className="relative overflow-hidden bg-[#faf9f6] dark:bg-[#1c1917] pt-12 pb-12 md:pt-16 md:pb-16">
      <div className="absolute inset-0 bg-noise pointer-events-none" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#fff7ed] dark:bg-[#431407] rounded-[40%_60%_70%_30%/40%_50%_60%_50%] blur-3xl opacity-60 animate-blob mix-blend-multiply dark:mix-blend-normal" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#f0fdf4] dark:bg-[#14532d] rounded-[30%_70%_70%_30%/30%_30%_70%_70%] blur-3xl opacity-60 animate-blob animation-delay-2000 mix-blend-multiply dark:mix-blend-normal" />

      {mounted && floatingFood.map((item, index) => (
        <div
          key={index}
          className={`absolute animate-float opacity-20 dark:opacity-10 select-none font-emoji ${item.size}`}
          style={{ left: item.left, top: item.top, transform: `rotate(${item.rotate})`, animationDelay: item.delay }}
        >
          {item.icon}
        </div>
      ))}

      <div className="container relative mx-auto px-4 z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-6xl font-bold font-rounded text-foreground leading-[1.1] tracking-tight mb-6">
              <span className="relative z-10">外食</span>を、もっと
              <br />
              <span className="relative inline-block text-primary">
                自由
                <svg className="absolute w-[120%] -left-[10%] -bottom-2 md:-bottom-4 h-4 md:h-6 text-yellow-300 -z-10 opacity-60" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0 10 Q 50 20 100 10" stroke="currentColor" strokeWidth="12" fill="none" />
                </svg>
              </span>
              に、
              <span className="relative inline-block ml-2 md:ml-4 text-accent">
                健康
                <svg className="absolute w-[120%] -left-[10%] -bottom-2 md:-bottom-4 h-4 md:h-6 text-orange-200 -z-10 opacity-60" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0 15 Q 50 5 100 15" stroke="currentColor" strokeWidth="12" fill="none" />
                </svg>
              </span>
              に。
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              チェーン店{formatNumber(stats.totalMenus)}件のメニューから、あなたの体づくりに最適な一皿を見つけます。
            </p>
          </div>

          {/* Search Box */}
          <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-6 mb-8 border border-zinc-100 dark:border-zinc-700">
            {/* Preset Buttons */}
            <div className="mb-6">
              <p className="text-sm font-medium text-foreground/70 mb-3">プリセットで検索</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {presetCards.map((preset) => {
                  const isSelected = selectedPresets.includes(preset.id);
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetClick(preset.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${preset.bg} ${preset.hover} ${
                        isSelected
                          ? "border-primary shadow-md"
                          : "border-transparent"
                      }`}
                    >
                      <span className="text-2xl">{preset.icon}</span>
                      <span className={`font-bold ${preset.text}`}>{preset.label}</span>
                      {isSelected && (
                        <span className="ml-auto text-primary">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              <span className="text-sm text-zinc-400">または</span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
            </div>

            {/* PFC Input */}
            <div>
              <p className="text-sm font-medium text-foreground/70 mb-3">PFC値で検索</p>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-foreground/50 mb-1">タンパク質</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                        placeholder="30"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">g</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground/50 mb-1">脂質</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                        placeholder="20"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">g</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-foreground/50 mb-1">炭水化物</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={carb}
                        onChange={(e) => setCarb(e.target.value)}
                        placeholder="50"
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">g</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handlePFCSearch}
                  disabled={isLoading || (!protein && !fat && !carb)}
                  className="px-6 py-2 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isLoading ? "検索中..." : "検索"}
                </button>
              </div>
            </div>

            {/* Sort Options */}
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-700">
              <div className="flex items-center gap-3 text-sm flex-wrap">
                <span className="text-foreground/50">並び替え:</span>
                {[
                  { value: "pfcMatch", label: "マッチ度" },
                  { value: "costPerformance", label: "コスパ" },
                  { value: "popularity", label: "人気" },
                  { value: "distance", label: "近く", requiresLocation: true },
                ].map((option) => {
                  const needsLocation = option.requiresLocation && !userLocation;
                  return (
                    <button
                      key={option.value}
                      onClick={async () => {
                        // 位置情報が必要だが未取得の場合、まず位置情報を取得
                        if (option.requiresLocation && !userLocation) {
                          setLocationStatus("loading");
                          try {
                            const position = await getCurrentPosition();
                            setUserLocation(position);
                            setLocationStatus("success");
                            setSortBy(option.value as SortBy);

                            // 近くの店舗を検索（初回のみ）
                            setIsLoadingStores(true);
                            const response = await fetch(
                              `/api/stores/nearby?lat=${position.lat}&lng=${position.lng}&radius=3000&limit=12`
                            );
                            const data = await response.json();
                            if (data.success) {
                              setNearbyStores(data.data);
                            }
                            setIsLoadingStores(false);
                          } catch (error) {
                            if (error instanceof GeolocationPositionError) {
                              if (error.code === error.PERMISSION_DENIED) {
                                setLocationStatus("denied");
                              } else {
                                setLocationStatus("error");
                              }
                            } else {
                              setLocationStatus("error");
                            }
                            console.error("Location error:", error);
                          }
                          return;
                        }

                        // 既に位置情報取得済み → ソート切り替えのみ（API呼び出しなし）
                        setSortBy(option.value as SortBy);

                        // distance以外のソートは通常の検索API
                        if (option.value !== "distance") {
                          if (selectedPresets.length > 0) {
                            const params = new URLSearchParams();
                            params.set("preset", selectedPresets.join(","));
                            params.set("sortBy", option.value);
                            params.set("limit", "6");
                            executeSearch(params);
                          } else if (protein || fat || carb) {
                            const params = new URLSearchParams();
                            if (protein) params.set("protein", protein);
                            if (fat) params.set("fat", fat);
                            if (carb) params.set("carb", carb);
                            params.set("sortBy", option.value);
                            params.set("limit", "6");
                            executeSearch(params);
                          }
                        }
                        // distance ソートはキャッシュ済みの nearbyStores を使用
                      }}
                      className={`px-3 py-1 rounded-full transition-colors ${
                        sortBy === option.value
                          ? "bg-primary text-white"
                          : "bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600"
                      }`}
                    >
                      {option.label}
                      {needsLocation && (
                        <span className="ml-1 text-xs">📍</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent" />
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {selectedPresets.length > 0
                    ? selectedPresets.map(id => presets[id].name).join(" + ")
                    : "PFC検索"}の結果
                </h2>
                <Link
                  href={`/search?${selectedPresets.length > 0 ? `preset=${selectedPresets.join(",")}` : `protein=${protein}&fat=${fat}&carb=${carb}`}&sortBy=${sortBy}`}
                  className="text-sm text-primary hover:underline"
                >
                  すべて見る →
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {(() => {
                  // 距離ソートの場合、nearbyStoresの距離順でソート
                  if (sortBy === "distance" && nearbyStores.length > 0) {
                    const chainDistanceMap = new Map<string, number>();
                    nearbyStores.forEach(store => {
                      // 各チェーンの最小距離を記録
                      const existing = chainDistanceMap.get(store.chainId);
                      if (existing === undefined || store.distance < existing) {
                        chainDistanceMap.set(store.chainId, store.distance);
                      }
                    });
                    return [...results]
                      .sort((a, b) => {
                        const distA = chainDistanceMap.get(a.chain.chainId) ?? Infinity;
                        const distB = chainDistanceMap.get(b.chain.chainId) ?? Infinity;
                        return distA - distB;
                      })
                      .slice(0, 6);
                  }
                  return results;
                })().map((result, index) => (
                  <Link
                    key={result.menu.menuId}
                    href={`/menu/${result.menu.menuId}`}
                    className={`bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700 hover:border-primary transition-all hover:shadow-md relative ${
                      index < 3 ? "ring-2 ring-offset-2 " + (
                        index === 0 ? "ring-yellow-400" :
                        index === 1 ? "ring-gray-400" :
                        "ring-amber-600"
                      ) : ""
                    }`}
                  >
                    {index < 3 && (
                      <div className={`absolute -top-2 -left-2 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shadow-md ${
                        index === 0 ? "bg-yellow-400 text-yellow-900" :
                        index === 1 ? "bg-gray-300 text-gray-700" :
                        "bg-amber-600 text-white"
                      }`}>
                        {index + 1}
                      </div>
                    )}
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground truncate">{result.menu.menuName}</h3>
                        <p className="text-xs text-primary">
                          {result.chain.chainName}
                          {sortBy === "distance" && nearbyStores.length > 0 && (() => {
                            const nearestStore = nearbyStores.find(s => s.chainId === result.chain.chainId);
                            return nearestStore ? (
                              <span className="ml-2 text-foreground/50">
                                📍{formatDistance(nearestStore.distance)}
                              </span>
                            ) : null;
                          })()}
                        </p>
                      </div>
                      {result.pfcMatchPercent !== undefined && (
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                          result.pfcMatchPercent >= 80 ? "bg-green-100 text-green-700" :
                          result.pfcMatchPercent >= 60 ? "bg-lime-100 text-lime-700" :
                          "bg-yellow-100 text-yellow-700"
                        }`}>
                          {result.pfcMatchPercent}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-foreground/60">
                      <span>P {result.menu.protein}g</span>
                      <span>F {result.menu.fat}g</span>
                      <span>C {result.menu.carb}g</span>
                      <span className="ml-auto">{result.menu.calories}kcal</span>
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      {result.costPerProtein && (
                        <span className="text-foreground/50">{result.costPerProtein}円/gP</span>
                      )}
                      {result.menu.price && (
                        <span className="font-bold text-primary">{formatPrice(result.menu.price)}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {!isLoading && hasSearched && results.length === 0 && (
            <div className="text-center py-8 text-foreground/60">
              該当するメニューがありません
            </div>
          )}

          {/* 近くのチェーン店一覧 */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <span>📍</span>
                <span>近くのチェーン店</span>
              </h2>
              <Link
                href="/chains"
                className="text-sm text-primary hover:underline"
              >
                すべて見る →
              </Link>
            </div>

            {/* 位置情報未取得時: 取得ボタンを表示 */}
            {locationStatus === "idle" && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-8 border border-zinc-100 dark:border-zinc-700 text-center">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="font-bold text-foreground mb-2">
                  現在地から近くの店舗を探す
                </h3>
                <p className="text-sm text-foreground/60 mb-4">
                  位置情報を許可すると、近くのチェーン店を距離順で表示します
                </p>
                <button
                  onClick={fetchNearbyStores}
                  className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  現在地を取得する
                </button>
              </div>
            )}

            {/* 位置情報取得中 */}
            {(locationStatus === "loading" || isLoadingStores) && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-8 border border-zinc-100 dark:border-zinc-700 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent mx-auto mb-4" />
                <p className="text-foreground/60">
                  {locationStatus === "loading" ? "現在地を取得中..." : "近くの店舗を検索中..."}
                </p>
              </div>
            )}

            {/* 位置情報拒否時 */}
            {locationStatus === "denied" && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-8 border border-zinc-100 dark:border-zinc-700 text-center">
                <div className="text-4xl mb-4">🚫</div>
                <h3 className="font-bold text-foreground mb-2">位置情報へのアクセスが拒否されました</h3>
                <p className="text-sm text-foreground/60 mb-4">
                  ブラウザの設定から位置情報へのアクセスを許可してください
                </p>
                <button
                  onClick={fetchNearbyStores}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-foreground font-medium rounded-lg transition-colors"
                >
                  再試行
                </button>
              </div>
            )}

            {/* 位置情報取得不可 */}
            {(locationStatus === "unavailable" || locationStatus === "error") && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-8 border border-zinc-100 dark:border-zinc-700 text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="font-bold text-foreground mb-2">位置情報を取得できませんでした</h3>
                <p className="text-sm text-foreground/60 mb-4">
                  GPSが有効になっているか確認してください
                </p>
                <button
                  onClick={fetchNearbyStores}
                  className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-600 text-foreground font-medium rounded-lg transition-colors"
                >
                  再試行
                </button>
              </div>
            )}

            {/* 店舗一覧表示 */}
            {locationStatus === "success" && !isLoadingStores && nearbyStores.length > 0 && (
              <div>
                {userLocation && (
                  <p className="text-xs text-foreground/50 mb-3">
                    現在地: 緯度 {userLocation.lat.toFixed(4)}, 経度 {userLocation.lng.toFixed(4)}
                  </p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {nearbyStores.map((store) => (
                    <Link
                      key={store.placeId}
                      href={`/chains/${store.chainId}`}
                      className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-100 dark:border-zinc-700 hover:border-primary transition-all hover:shadow-md group flex items-center gap-4"
                    >
                      <div className="text-3xl group-hover:scale-110 transition-transform flex-shrink-0">
                        {store.category === "teishoku" && "🍱"}
                        {store.category === "gyudon" && "🥩"}
                        {store.category === "fastfood" && "🍔"}
                        {store.category === "cafe" && "☕"}
                        {store.category === "famires" && "🍽️"}
                        {store.category === "ramen" && "🍜"}
                        {store.category === "curry" && "🍛"}
                        {store.category === "udon" && "🍜"}
                        {!["teishoku", "gyudon", "fastfood", "cafe", "famires", "ramen", "curry", "udon"].includes(store.category) && "🍴"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-foreground">{store.chainName}</h3>
                        <p className="text-sm text-foreground/70 truncate">{store.storeName}</p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <span className="text-sm font-medium text-primary">
                          {formatDistance(store.distance)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 店舗が見つからなかった場合 */}
            {locationStatus === "success" && !isLoadingStores && nearbyStores.length === 0 && (
              <div className="bg-white dark:bg-zinc-800 rounded-xl p-8 border border-zinc-100 dark:border-zinc-700 text-center">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-bold text-foreground mb-2">近くに店舗が見つかりませんでした</h3>
                <p className="text-sm text-foreground/60">
                  検索範囲を広げるか、別の場所でお試しください
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(var(--tw-rotate)); }
          50% { transform: translateY(-20px) rotate(var(--tw-rotate)); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
      `}</style>
    </section>
  );
}
