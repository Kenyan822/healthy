import Link from "next/link";

const LEGAL_OMISSION_NOTE =
  "特定商取引法第11条但書に基づき省略。消費者からの請求があった場合、遅滞なく開示いたします。";

const items = [
  { label: "販売業者", value: "チェンメシ運営事務局" },
  { label: "代表者", value: LEGAL_OMISSION_NOTE },
  { label: "所在地", value: LEGAL_OMISSION_NOTE },
  { label: "電話番号", value: LEGAL_OMISSION_NOTE },
  {
    label: "お問い合わせ",
    value: "お問い合わせフォームよりご連絡ください",
    isLink: true,
  },
  { label: "販売価格", value: "Plusプラン: 月額480円（税込）" },
  {
    label: "支払い方法",
    value:
      "クレジットカード（Stripe経由）\nVisa / Mastercard / American Express / JCB 等",
  },
  {
    label: "支払い時期",
    value: "お申し込み時に即時決済。以降、毎月同日に自動更新されます。",
  },
  {
    label: "サービス提供時期",
    value: "決済完了後、即時にPlusプランの全機能をご利用いただけます。",
  },
  {
    label: "返品・キャンセル",
    value:
      "デジタルサービスの性質上、返金は原則承っておりません。\n解約はいつでも可能で、解約後は当月末日までPlusプランの機能をご利用いただけます。",
  },
  {
    label: "動作環境",
    value:
      "最新版の Chrome / Firefox / Safari / Edge（スマートフォン含む）",
  },
];

export default function TokushohoPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <nav className="text-sm text-[#433422]/60 mb-6">
          <Link href="/" className="hover:text-[#90be6d]">
            ホーム
          </Link>
          <span className="mx-2">/</span>
          <span>特定商取引法に基づく表記</span>
        </nav>

        <h1 className="text-2xl font-bold text-[#433422] mb-2">
          特定商取引法に基づく表記
        </h1>
        <p className="text-[#433422]/70 mb-8">最終更新日: 2026年2月21日</p>

        <div className="bg-white rounded-xl shadow-sm border border-[#433422]/10 overflow-hidden">
          <table className="w-full">
            <tbody>
              {items.map((item, index) => (
                <tr
                  key={index}
                  className={`border-b border-[#433422]/10 last:border-b-0 ${
                    index % 2 === 0 ? "bg-white" : "bg-[#faf9f6]/50"
                  }`}
                >
                  <th className="text-left px-6 py-4 text-sm font-semibold text-[#433422] w-36 md:w-44 align-top whitespace-nowrap">
                    {item.label}
                  </th>
                  <td className="px-6 py-4 text-sm text-[#433422]/70 leading-relaxed">
                    {item.isLink ? (
                      <Link
                        href="/contact"
                        className="text-[#90be6d] hover:underline"
                      >
                        お問い合わせフォーム
                      </Link>
                    ) : (
                      item.value.split("\n").map((line, i, arr) => (
                        <span key={i}>
                          {line}
                          {i < arr.length - 1 && <br />}
                        </span>
                      ))
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 bg-white rounded-xl shadow-sm border border-[#433422]/10 p-6">
          <h2 className="text-base font-semibold text-[#433422] mb-2">
            お問い合わせ
          </h2>
          <p className="text-sm text-[#433422]/70">
            特定商取引法に関するお問い合わせや、販売業者情報の開示請求は
            <Link
              href="/contact"
              className="text-[#90be6d] hover:underline mx-1"
            >
              お問い合わせフォーム
            </Link>
            よりご連絡ください。
          </p>
        </div>
      </div>
    </div>
  );
}
