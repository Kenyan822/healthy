"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Favorite {
  id: number;
  menuId: string;
  menuName: string;
  calories: number;
  protein: number;
  fat: number;
  carb: number;
  price: number | null;
  chainId: string;
  chainName: string;
  createdAt: string;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetchFavorites();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites);
        setCount(data.count);
      }
    } catch (error) {
      console.error("Failed to fetch favorites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (menuId: string) => {
    try {
      const res = await fetch(`/api/favorites/${menuId}`, { method: "DELETE" });
      if (res.ok) {
        setFavorites(favorites.filter((f) => f.menuId !== menuId));
        setCount(count - 1);
      }
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-32 bg-gray-200 rounded" />
          <div className="h-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-[#433422] mb-4">
          お気に入り
        </h1>
        <p className="text-[#433422]/70 mb-8">
          お気に入り機能を使うにはログインが必要です
        </p>
        <Link
          href="/auth/signin"
          className="inline-block bg-[#90be6d] text-white px-6 py-3 rounded-lg font-medium hover:bg-[#90be6d]/90 transition-colors"
        >
          ログインする
        </Link>
      </div>
    );
  }

  const plan = (session?.user as { plan?: string })?.plan || "free";
  const maxFavorites = plan === "free" ? 2 : "無制限";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#433422]">お気に入り</h1>
        <span className="text-sm text-[#433422]/70">
          {count} / {maxFavorites}
        </span>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-[#433422]/70 mb-4">
            お気に入りに登録したメニューがありません
          </p>
          <Link
            href="/search"
            className="text-[#90be6d] hover:underline font-medium"
          >
            メニューを検索する
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-white rounded-lg shadow-sm p-4 flex items-center justify-between"
            >
              <Link
                href={`/menu/${favorite.menuId}`}
                className="flex-1"
              >
                <p className="text-xs text-[#433422]/60 mb-1">
                  {favorite.chainName}
                </p>
                <h3 className="font-medium text-primary mb-2 hover:underline">
                  {favorite.menuName}
                </h3>
                <div className="flex gap-4 text-sm text-[#433422]/70">
                  <span>{favorite.calories}kcal</span>
                  <span>P: {favorite.protein}g</span>
                  <span>F: {favorite.fat}g</span>
                  <span>C: {favorite.carb}g</span>
                  {favorite.price && <span>¥{favorite.price}</span>}
                </div>
              </Link>
              <button
                onClick={() => handleRemove(favorite.menuId)}
                className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                aria-label="お気に入りから削除"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {plan === "free" && count >= 2 && (
        <div className="mt-6 p-4 bg-primary/10 rounded-xl text-center">
          <p className="text-sm text-foreground mb-3">
            無料プランではお気に入りは2件までです
          </p>
          <Link
            href="/pricing"
            className="inline-block px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
          >
            Plusにアップグレード
          </Link>
        </div>
      )}
    </div>
  );
}
