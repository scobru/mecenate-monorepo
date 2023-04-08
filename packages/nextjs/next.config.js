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
    INFURA_PROJECT_ID: "2FMUdMfqb8YwcclqJQhPHYlUHx5",
    INFURA_PROJECT_SECRET: "076b6e972ec77f21521ac05108a2c645",
    PINATA_API_KEY: "e704c1f2da2b94ae9289",
    PINATA_API_SECRET: "e81da55f889d6bd30d15b33015a92793fb6857d7aaa79f95a4c51efc4df5036f",
    NOTION_SECRET_INTEGRATION_TOKEN: "secret_TIdnZg9uKMdA5IkiOfcUrqXIOcj6wYnt6KlURqAP4wk",
    NOTION_DATABASE_ID: "0996e29e4c794fda9fc0471698032b94",
    NOTION_DATABASE_ID_USERS: "207fefc32cc34ba29f5c4cc1ebf9023c",
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
