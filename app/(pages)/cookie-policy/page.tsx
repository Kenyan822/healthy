import Link from "next/link";

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <nav className="text-sm text-[#433422]/60 mb-6">
          <Link href="/" className="hover:text-[#90be6d]">
            ホーム
          </Link>
          <span className="mx-2">/</span>
          <span>クッキーポリシー</span>
        </nav>

        <h1 className="text-2xl font-bold text-[#433422] mb-2">
          クッキーポリシー
        </h1>
        <p className="text-[#433422]/70 mb-8">最終更新日: 2026年2月21日</p>

        <div className="bg-white rounded-xl shadow-sm border border-[#433422]/10 p-6 md:p-8 space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-[#433422] mb-3">
              Cookieとは
            </h2>
            <p className="text-[#433422]/70 text-sm leading-relaxed">
              Cookieとは、ウェブサイトがお使いのブラウザに保存する小さなテキストファイルです。サービスの利便性向上、利用状況の分析、認証状態の維持などに使用されます。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#433422] mb-4">
              使用するCookieの種類
            </h2>

            <div className="space-y-4">
              <div className="border border-[#433422]/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-[#433422]/10 text-[#433422] rounded-full">
                    必須
                  </span>
                  <h3 className="text-sm font-semibold text-[#433422]">
                    認証Cookie（NextAuth）
                  </h3>
                </div>
                <p className="text-xs text-[#433422]/60 leading-relaxed">
                  ログイン状態を維持するために使用します。セッションCookieのため、ブラウザを閉じると削除されます。このCookieはサービスの基本機能に必要であり、無効にするとログイン機能が使用できません。
                </p>
                <div className="mt-2 text-xs text-[#433422]/50">
                  Cookie名: next-auth.session-token / 提供者: チェンメシ /
                  有効期間: セッション
                </div>
              </div>

              <div className="border border-[#433422]/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                    分析
                  </span>
                  <h3 className="text-sm font-semibold text-[#433422]">
                    Google Analytics（GA4）
                  </h3>
                </div>
                <p className="text-xs text-[#433422]/60 leading-relaxed">
                  サイトの利用状況を分析し、サービス改善に役立てるために使用します。訪問者数、閲覧ページ、利用デバイス等の統計情報を収集します。個人を特定する情報は収集しません。
                </p>
                <div className="mt-2 text-xs text-[#433422]/50">
                  Cookie名: _ga, _ga_* / 提供者: Google LLC / 有効期間: 最大2年
                </div>
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#90be6d] hover:underline mt-1 block"
                >
                  Googleのプライバシーポリシー
                </a>
              </div>

              <div className="border border-[#433422]/10 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                    機能
                  </span>
                  <h3 className="text-sm font-semibold text-[#433422]">
                    Stripe（決済）
                  </h3>
                </div>
                <p className="text-xs text-[#433422]/60 leading-relaxed">
                  Plus会員への決済処理時に使用されます。不正利用防止およびセキュリティのために使用します。Plusプランをご利用の場合にのみ使用されます。
                </p>
                <div className="mt-2 text-xs text-[#433422]/50">
                  提供者: Stripe, Inc. / 有効期間: セッション〜1年
                </div>
                <a
                  href="https://stripe.com/jp/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#90be6d] hover:underline mt-1 block"
                >
                  Stripeのプライバシーポリシー
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#433422] mb-3">
              Cookieの管理方法
            </h2>
            <p className="text-[#433422]/70 text-sm leading-relaxed mb-3">
              当サイト初回訪問時に表示されるバナーから、分析Cookieの使用を許可または拒否できます。設定はいつでも変更可能です。
            </p>
            <p className="text-[#433422]/70 text-sm leading-relaxed mb-3">
              また、ブラウザの設定からCookieを無効にしたり、削除したりすることができます。ただし、必須Cookieを無効にするとサービスの一部機能が使用できなくなる場合があります。
            </p>
            <p className="text-[#433422]/70 text-sm leading-relaxed">
              Google Analyticsによるデータ収集を拒否するには、
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#90be6d] hover:underline mx-0.5"
              >
                Google Analytics オプトアウトアドオン
              </a>
              をご利用いただくことも可能です。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[#433422] mb-3">
              本ポリシーの変更
            </h2>
            <p className="text-[#433422]/70 text-sm leading-relaxed">
              本クッキーポリシーは予告なく変更される場合があります。重要な変更がある場合は当サイト上でお知らせします。
            </p>
          </section>
        </div>

        <p className="mt-6 text-sm text-[#433422]/60 text-center">
          ご質問は
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
