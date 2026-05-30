import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Compile TypeScript from sibling directories outside frontend/
  transpilePackages: ["backend", "shared"],

  webpack: (config, { isServer }) => {
    // Resolve @/backend and @/shared to the sibling directories
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/backend": path.resolve(process.cwd(), "../backend"),
      "@/shared": path.resolve(process.cwd(), "../shared"),
    };

    // Ensure we look in both local and root node_modules for hoisted dependencies
    config.resolve.modules = [
      path.resolve(process.cwd(), "node_modules"),
      path.resolve(process.cwd(), "../node_modules"),
      "node_modules",
      ...(config.resolve.modules || []),
    ];

    // firebase-admin should be treated as an external on the server
    if (isServer) {
      config.externals.push('firebase-admin');
    }

    return config;
  },
};

export default nextConfig;
