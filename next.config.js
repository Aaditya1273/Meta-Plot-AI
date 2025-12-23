/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable Turbopack configuration for Next.js 16
  turbopack: {},

  // Keep webpack config for fallback compatibility
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    return config;
  },
};

module.exports = nextConfig;