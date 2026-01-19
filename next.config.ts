import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 旧URL → 新URL リダイレクト
      {
        source: "/chains/:chainId",
        destination: "/:chainId",
        permanent: true,
      },
      {
        source: "/purpose/:purposeId",
        destination: "/ranking/:purposeId",
        permanent: true,
      },
      {
        source: "/menu/:menuId",
        destination: "/:menuId", // メニュー詳細は /[store]/[menuSlug] に移行
        permanent: false, // メニュースラッグが確定するまで一時リダイレクト
      },
    ];
  },
};

export default nextConfig;
