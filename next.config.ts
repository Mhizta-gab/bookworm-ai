import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverActions: {
    bodySize: 100 * 1024 * 1024, // 100 MB - allows larger PDF and image uploads
  },
};

export default nextConfig;
