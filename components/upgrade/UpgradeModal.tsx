"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/Modal";

type TriggerType = "favorite_limit" | "location" | "general";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: TriggerType;
}

const triggerMessages: Record<
  TriggerType,
  { title: string; description: string; icon: string }
> = {
  favorite_limit: {
    title: "お気に入りの上限に達しました",
    description: "無料プランではお気に入りは2件までです。Plus会員になると無制限に保存できます。",
    icon: "heart",
  },
  location: {
    title: "現在地検索はPlus会員限定です",
    description: "Plus会員になると、現在地から近くのチェーン店を検索できます。",
    icon: "location",
  },
  general: {
    title: "Plus会員でもっと便利に",
    description: "Plus会員になると、すべての機能を制限なく利用できます。",
    icon: "star",
  },
};

const benefits = [
  { icon: "heart", text: "お気に入り無制限" },
  { icon: "location", text: "現在地検索" },
  { icon: "filter", text: "高度なフィルター" },
  { icon: "ad", text: "広告非表示" },
];

export function UpgradeModal({ isOpen, onClose, trigger }: UpgradeModalProps) {
  const message = triggerMessages[trigger];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
          {message.icon === "heart" && (
            <svg
              className="w-8 h-8 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
          {message.icon === "location" && (
            <svg
              className="w-8 h-8 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
          {message.icon === "star" && (
            <svg
              className="w-8 h-8 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-foreground mb-2">
          {message.title}
        </h3>

        {/* Description */}
        <p className="text-foreground/60 mb-6">{message.description}</p>

        {/* Benefits */}
        <div className="bg-stone-50 dark:bg-zinc-700/50 rounded-xl p-4 mb-6">
          <p className="text-sm font-medium text-foreground mb-3">
            Plus会員の特典
          </p>
          <div className="grid grid-cols-2 gap-2">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-foreground/70"
              >
                <svg
                  className="w-4 h-4 text-primary flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                {benefit.text}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <Link
            href="/pricing"
            className="w-full px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl transition-colors text-center"
            onClick={onClose}
          >
            Plus会員になる
          </Link>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 text-foreground/60 hover:text-foreground font-medium rounded-xl transition-colors"
          >
            あとで
          </button>
        </div>
      </div>
    </Modal>
  );
}
