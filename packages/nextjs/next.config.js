// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  swcMinify: false,
  env: {
    INFURA_PROJECT_ID: "XXX",
    INFURA_PROJECT_SECRET: "XXX",
    PINATA_API_KEY: "XXX",
    PINATA_API_SECRET: "XXX",
    NOTION_SECRET_INTEGRATION_TOKEN: "XXX",
    NOTION_DATABASE_ID: "XXX",
    NOTION_DATABASE_ID_USERS: "XXX",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "scobru.infura-ipfs.io",
        port: "",
        pathname: "/ipfs/**",
      },
    ],
  },
  webpack5: true,
  webpack: config => {
    config.resolve.fallback = { fs: false };

    return config;
  },
};

module.exports = nextConfig;
