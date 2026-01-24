"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CATEGORIES = [
  { value: "general", label: "一般的な質問" },
  { value: "bug", label: "不具合報告" },
  { value: "feature", label: "機能要望" },
  { value: "new_menu", label: "新メニュー情報" },
  { value: "correction", label: "価格・栄養情報の訂正" },
  { value: "other", label: "その他" },
] as const;

const INFO_CATEGORIES = ["new_menu", "correction"];

type Chain = {
  chainId: string;
  chainName: string;
};

export default function ContactPage() {
  const router = useRouter();
  const [chains, setChains] = useState<Chain[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    subject: "",
    message: "",
    chainId: "",
    menuName: "",
    sourceUrl: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // チェーン店リストを取得
  useEffect(() => {
    fetch("/api/chains")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setChains(data.data);
        }
      })
      .catch(console.error);
  }, []);

  const isInfoCategory = INFO_CATEGORIES.includes(formData.category);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = "メールアドレスを入力してください";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "有効なメールアドレスを入力してください";
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "件名を入力してください";
    }

    if (!formData.message.trim()) {
      newErrors.message = "内容を入力してください";
    } else if (formData.message.length < 10) {
      newErrors.message = "内容は10文字以上で入力してください";
    }

    // 新メニュー情報の場合、チェーン店は必須
    if (formData.category === "new_menu" && !formData.chainId) {
      newErrors.chainId = "新メニュー情報の場合、チェーン店の選択は必須です";
    }

    // sourceUrlのバリデーション
    if (formData.sourceUrl.trim()) {
      try {
        new URL(formData.sourceUrl);
      } catch {
        newErrors.sourceUrl = "有効なURLを入力してください";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!validate()) return;

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name || null,
        email: formData.email,
        category: formData.category,
        subject: formData.subject,
        message: formData.message,
        chainId: formData.chainId || null,
        menuName: formData.menuName || null,
        sourceUrl: formData.sourceUrl || null,
      };

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "送信に失敗しました");
      }

      router.push("/contact/complete");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "送信に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#433422]/60 mb-6">
          <Link href="/" className="hover:text-[#90be6d]">
            ホーム
          </Link>
          <span className="mx-2">/</span>
          <span>お問い合わせ・情報提供</span>
        </nav>

        <h1 className="text-2xl font-bold text-[#433422] mb-2">
          お問い合わせ・情報提供
        </h1>
        <p className="text-[#433422]/70 mb-8">
          サイトに関するご質問やメニュー情報の提供を受け付けています。
        </p>

        <div className="bg-white rounded-xl shadow-sm border border-[#433422]/10 p-6 md:p-8">
          {submitError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm mb-6">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-[#433422] mb-1"
              >
                お名前（任意）
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#433422]/20 rounded-lg focus:ring-2 focus:ring-[#90be6d] focus:border-transparent outline-none transition-all"
                placeholder="山田 太郎"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#433422] mb-1"
              >
                メールアドレス <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-all
                  ${errors.email ? "border-red-500" : "border-[#433422]/20"}
                  focus:ring-2 focus:ring-[#90be6d] focus:border-transparent`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-[#433422] mb-1"
              >
                カテゴリ <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-[#433422]/20 rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#90be6d] focus:border-transparent bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-[#433422]/60">
                {isInfoCategory
                  ? "メニュー情報の提供ありがとうございます。"
                  : "お問い合わせ内容に合ったカテゴリを選択してください。"}
              </p>
            </div>

            {/* 情報提供系カテゴリの場合の追加フィールド */}
            {isInfoCategory && (
              <>
                {/* Chain Selection */}
                <div>
                  <label
                    htmlFor="chainId"
                    className="block text-sm font-medium text-[#433422] mb-1"
                  >
                    チェーン店
                    {formData.category === "new_menu" && (
                      <span className="text-red-500"> *</span>
                    )}
                  </label>
                  <select
                    id="chainId"
                    name="chainId"
                    value={formData.chainId}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg outline-none transition-all focus:ring-2 focus:ring-[#90be6d] focus:border-transparent bg-white
                      ${errors.chainId ? "border-red-500" : "border-[#433422]/20"}`}
                  >
                    <option value="">選択してください</option>
                    {chains.map((chain) => (
                      <option key={chain.chainId} value={chain.chainId}>
                        {chain.chainName}
                      </option>
                    ))}
                  </select>
                  {errors.chainId && (
                    <p className="mt-1 text-sm text-red-500">{errors.chainId}</p>
                  )}
                </div>

                {/* Menu Name (for correction) */}
                {formData.category === "correction" && (
                  <div>
                    <label
                      htmlFor="menuName"
                      className="block text-sm font-medium text-[#433422] mb-1"
                    >
                      メニュー名（任意）
                    </label>
                    <input
                      id="menuName"
                      name="menuName"
                      type="text"
                      value={formData.menuName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#433422]/20 rounded-lg focus:ring-2 focus:ring-[#90be6d] focus:border-transparent outline-none transition-all"
                      placeholder="例: チキン南蛮定食"
                    />
                  </div>
                )}

                {/* Source URL */}
                <div>
                  <label
                    htmlFor="sourceUrl"
                    className="block text-sm font-medium text-[#433422] mb-1"
                  >
                    情報源URL（任意）
                  </label>
                  <input
                    id="sourceUrl"
                    name="sourceUrl"
                    type="url"
                    value={formData.sourceUrl}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg outline-none transition-all
                      ${errors.sourceUrl ? "border-red-500" : "border-[#433422]/20"}
                      focus:ring-2 focus:ring-[#90be6d] focus:border-transparent`}
                    placeholder="https://example.com/menu"
                  />
                  {errors.sourceUrl && (
                    <p className="mt-1 text-sm text-red-500">{errors.sourceUrl}</p>
                  )}
                  <p className="mt-1 text-xs text-[#433422]/60">
                    公式サイトやプレスリリースのURLがあればご記入ください。
                  </p>
                </div>
              </>
            )}

            {/* Subject */}
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-[#433422] mb-1"
              >
                件名 <span className="text-red-500">*</span>
              </label>
              <input
                id="subject"
                name="subject"
                type="text"
                value={formData.subject}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-all
                  ${errors.subject ? "border-red-500" : "border-[#433422]/20"}
                  focus:ring-2 focus:ring-[#90be6d] focus:border-transparent`}
                placeholder={
                  isInfoCategory
                    ? "例: 大戸屋の新メニューについて"
                    : "件名を入力してください"
                }
              />
              {errors.subject && (
                <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
              )}
            </div>

            {/* Message */}
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-[#433422] mb-1"
              >
                内容 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className={`w-full px-4 py-3 border rounded-lg outline-none transition-all resize-y
                  ${errors.message ? "border-red-500" : "border-[#433422]/20"}
                  focus:ring-2 focus:ring-[#90be6d] focus:border-transparent`}
                placeholder={
                  isInfoCategory
                    ? "メニュー名、価格、栄養成分など、お持ちの情報をご記入ください。"
                    : "お問い合わせ内容をご記入ください。"
                }
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#90be6d] text-white py-3 rounded-lg font-medium hover:bg-[#90be6d]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "送信中..." : "送信する"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-sm text-[#433422]/60 text-center">
          お送りいただいた内容は確認の上、必要に応じてご連絡いたします。
        </p>
      </div>
    </div>
  );
}
