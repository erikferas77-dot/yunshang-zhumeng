import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  distDir: "dist",
  assetPrefix: ".",
  trailingSlash: true,
};

export default nextConfig;
