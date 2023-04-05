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
    PINATA_API_KEY: "dad6ed453a132d8b9f34",
    PINATA_API_SECRET: "698a5222b379fb4a9be1347f2862998e5334d5b01985bcbc0d8fa3ddac951747",
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
