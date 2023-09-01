module.exports = {
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
  serverRuntimeConfig: {
    // Will only be available on the server side
    wsPort: 3001, // you can set any unused port number
  },
};
