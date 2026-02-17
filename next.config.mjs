/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ External images config (next/image fix)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "primary.jwwb.nl",
        pathname: "/**",
      },
    ],
  },

  // ✅ Turbopack + canvas alias (react-pdf fix)
  experimental: {
    turbo: {
      resolveAlias: {
        canvas: "./empty-module.js",
      },
    },
  },

  // ✅ Webpack fallbacks (react-pdf / browser safety)
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
