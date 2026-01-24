"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UpgradeModal } from "@/components/upgrade/UpgradeModal";

interface FavoriteButtonProps {
  menuId: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function FavoriteButton({
  menuId,
  className = "",
  size = "md",
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const buttonSizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5",
  };

  useEffect(() => {
    if (session?.user) {
      fetch(`/api/favorites/${menuId}`)
        .then((res) => res.json())
        .then((data) => setIsFavorite(data.isFavorite))
        .catch(() => {});
    }
  }, [session, menuId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session) {
      router.push(
        `/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      );
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        await fetch(`/api/favorites/${menuId}`, { method: "DELETE" });
        setIsFavorite(false);
      } else {
        const res = await fetch(`/api/favorites/${menuId}`, { method: "POST" });
        if (!res.ok) {
          if (res.status === 403) {
            setShowUpgradeModal(true);
            return;
          }
          console.error("Failed to add favorite");
          return;
        }
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Favorite error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={`${buttonSizeClasses[size]} rounded-full transition-all ${
          isFavorite
            ? "bg-red-100 text-red-500 hover:bg-red-200"
            : "bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-gray-200"
        } disabled:opacity-50 ${className}`}
        aria-label={isFavorite ? "お気に入り解除" : "お気に入り登録"}
      >
        <svg
          className={sizeClasses[size]}
          fill={isFavorite ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </button>

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger="favorite_limit"
      />
    </>
  );
}
