import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable Lightning CSS when using webpack; fall back to PostCSS
    useLightningcss: false,
  },
};

export default nextConfig;
