import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverRuntimeConfig: {
    port: 5556,
  },
};

export default nextConfig;
