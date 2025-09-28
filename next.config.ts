import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase limit to 10MB for audio files
    },
  },
};

export default nextConfig;
