import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configurações para Firebase
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
};

export default nextConfig;
