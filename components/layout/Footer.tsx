import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">H</span>
              </div>
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                ヘルシー検索
              </span>
            </Link>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              チェーン店のメニューをPFC（タンパク質・脂質・炭水化物）で検索できるサイトです。
            </p>
          </div>

          {/* チェーン店 */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              人気チェーン店
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/ootoya"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  大戸屋
                </Link>
              </li>
              <li>
                <Link
                  href="/sukiya"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  すき家
                </Link>
              </li>
              <li>
                <Link
                  href="/yayoiken"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  やよい軒
                </Link>
              </li>
              <li>
                <Link
                  href="/matsuya"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  松屋
                </Link>
              </li>
            </ul>
          </div>

          {/* 目的別 */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              目的別で探す
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/ranking/high-protein"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  高タンパク
                </Link>
              </li>
              <li>
                <Link
                  href="/ranking/low-calorie"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  低カロリー
                </Link>
              </li>
              <li>
                <Link
                  href="/ranking/low-carb"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  低糖質
                </Link>
              </li>
              <li>
                <Link
                  href="/ranking/cost-performance"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  タンパク質コスパ
                </Link>
              </li>
            </ul>
          </div>

          {/* サイト情報 */}
          <div>
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              サイト情報
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/chains"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  チェーン店一覧
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-zinc-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  お問い合わせ・情報提供
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-500">
            &copy; {new Date().getFullYear()} ヘルシー検索. All rights reserved.
          </p>
          <p className="text-center text-xs text-zinc-400 dark:text-zinc-600 mt-2">
            ※栄養成分値は各チェーン店の公式情報を元にしています。最新情報は公式サイトをご確認ください。
          </p>
        </div>
      </div>
    </footer>
  );
}
