import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Disable Turbopack and Lightning CSS to avoid native binary issues on Vercel
    turbo: false,
    useLightningcss: false,
  },
};

export default nextConfig;
