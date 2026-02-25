import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable Lightning CSS when using webpack to avoid native binary issues on Vercel
    useLightningcss: false,
  },
};

export default nextConfig;
