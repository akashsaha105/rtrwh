import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    webpack: (config, { isServer }) => {
    if (!isServer) {
      // Shim Node modules that are not available in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        dgram: false,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

};

export default nextConfig;
