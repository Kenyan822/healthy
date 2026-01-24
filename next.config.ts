import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
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
    ];
  },
};

export default nextConfig;
