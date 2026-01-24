import Link from "next/link";

export default function ContactCompletePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-lg mx-auto text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-[#90be6d]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-[#90be6d]"
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
        </div>

        <h1 className="text-2xl font-bold text-[#433422] mb-4">
          送信が完了しました
        </h1>

        <p className="text-[#433422]/70 mb-8">
          お問い合わせ・情報提供ありがとうございます。
          <br />
          確認メールをお送りしましたのでご確認ください。
          <br />
          内容を確認の上、必要に応じてご連絡いたします。
        </p>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full bg-[#90be6d] text-white py-3 rounded-lg font-medium hover:bg-[#90be6d]/90 transition-colors"
          >
            トップページへ
          </Link>

          <Link
            href="/contact"
            className="block w-full border border-[#433422]/20 text-[#433422] py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            別のお問い合わせをする
          </Link>
        </div>
      </div>
    </div>
  );
}
