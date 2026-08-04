/**
 * ads.txt を動的に配信する。
 * AdSenseのパブリッシャーIDを環境変数から読み、未設定なら空を返す。
 * 審査通過後に NEXT_PUBLIC_ADSENSE_CLIENT（ca-pub-XXXX）を入れれば自動で有効化される。
 */
export const dynamic = "force-static";

export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const pub = client?.replace(/^ca-/, ""); // ads.txt は "pub-XXXX" 形式
  const body = pub
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : "";
  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
