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
    INFURA_PROJECT_ID: "INFURA_KEY",
    INFURA_PROJECT_SECRET: "INFURA_SECRET",
    PINATA_API_KEY: "PINATA_KEY",
    PINATA_API_SECRET: "PINATA_SECRET",
    NOTION_SECRET_INTEGRATION_TOKEN: "NOTION_SECRET",
    NOTION_DATABASE_ID: "NOTION_DB_ID",

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
