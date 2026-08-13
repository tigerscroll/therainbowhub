import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    globalNotFound: true,
  },
  output: "export",
  images: {
    unoptimized: true,
  },
  trailingSlash: false,
};

export default nextConfig;
