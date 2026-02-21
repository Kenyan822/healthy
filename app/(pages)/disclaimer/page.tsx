import Link from "next/link";

export default function DisclaimerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <nav className="text-sm text-[#433422]/60 mb-6">
          <Link href="/" className="hover:text-[#90be6d]">
            ホーム
          </Link>
          <span className="mx-2">/</span>
          <span>免責事項</span>
        </nav>

        <h1 className="text-2xl font-bold text-[#433422] mb-2">免責事項</h1>
        <p className="text-[#433422]/70 mb-8">最終更新日: 2026年2月21日</p>

        <div className="bg-white rounded-xl shadow-sm border border-[#433422]/10 p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-[#433422] mb-3">
              1. 栄養成分情報の正確性について
            </h2>
            <p className="text-[#433422]/70 text-sm leading-relaxed">
              チェンメシ（以下「当サイト」）に掲載している栄養成分情報（カロリー、タンパク質、脂質、炭水化物等）は、各チェーン店の公式ウェブサイトまたは公式発表資料を参照して作成しています。ただし、メニューの変更、季節限定商品の入れ替え、提供地域による差異等により、掲載情報が最新の情報と異なる場合があります。最新の栄養成分値については、各チェーン店の公式サイトまたは店頭でご確認ください。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#433422] mb-3">
              2. 価格情報について
            </h2>
            <p className="text-[#433422]/70 text-sm leading-relaxed">
              掲載している価格情報は、各チェーン店の公式サイトからの取得および手動入力により作成しています。価格は地域・店舗・時期によって異なる場合があり、税込価格・税抜価格の表示が異なる場合があります。実際の価格については各店舗または公式サイトをご確認ください。当サイトに掲載された価格情報の誤りによって生じた損害について、当サイトは責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#433422] mb-3">
              3. 医療・栄養アドバイスについて
            </h2>
            <p className="text-[#433422]/70 text-sm leading-relaxed">
              当サイトは、情報提供を目的としたサービスであり、医療的アドバイスや栄養指導を提供するものではありません。健康管理、疾病の治療、ダイエット、筋肉増強等を目的とした食事計画については、医師・管理栄養士等の専門家にご相談ください。当サイトの情報を参考にした食事選択によって生じた健康上の問題について、当サイトは一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#433422] mb-3">
              4. 外部リンクについて
            </h2>
            <p className="text-[#433422]/70 text-sm leading-relaxed">
              当サイトには各チェーン店の公式サイトへのリンクが含まれます。リンク先のサイトの内容・プライバシーポリシー・利用規約については、各サイトの運営者が責任を負うものとし、当サイトは一切の責任を負いません。リンク先サイトの情報や取引から生じた損害について、当サイトは責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#433422] mb-3">
              5. サービスの中断・変更について
            </h2>
            <p className="text-[#433422]/70 text-sm leading-relaxed">
              当サイトは、システムメンテナンス、障害、その他の理由により、予告なくサービスを停止・変更する場合があります。サービスの停止・変更によって生じた損害について、当サイトは責任を負いません。また、掲載情報は予告なく変更・削除される場合があります。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#433422] mb-3">
              6. 著作権について
            </h2>
            <p className="text-[#433422]/70 text-sm leading-relaxed">
              当サイトのコンテンツ（テキスト、デザイン、ロゴ等）の著作権は当サイト運営者に帰属します。無断転載・複製・改変はお断りします。各チェーン店の商標・ロゴ・メニュー名等の権利は、各社に帰属します。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#433422] mb-3">
              7. 免責の範囲
            </h2>
            <p className="text-[#433422]/70 text-sm leading-relaxed">
              当サイトの利用によって生じた直接的・間接的・偶発的・結果的損害について、当サイト運営者は一切の責任を負いません。本免責事項は予告なく変更される場合があります。重要な変更がある場合は、当サイト上でお知らせします。
            </p>
          </section>
        </div>

        <p className="mt-6 text-sm text-[#433422]/60 text-center">
          ご不明な点は
          <Link
            href="/contact"
            className="text-[#90be6d] hover:underline mx-1"
          >
            お問い合わせ
          </Link>
          からご連絡ください。
        </p>
      </div>
    </div>
  );
}
