import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Compile TypeScript from sibling directories outside frontend/
  transpilePackages: ["backend", "shared"],

  // Empty turbopack config to silence warnings when using --webpack flag
  turbopack: {},

  webpack: (config) => {
    // Resolve @/backend and @/shared to the sibling directories
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/backend": path.resolve(process.cwd(), "../backend"),
      "@/shared": path.resolve(process.cwd(), "../shared"),
    };
    return config;
  },
};

export default nextConfig;
