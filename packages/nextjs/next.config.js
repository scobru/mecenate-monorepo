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
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      url: require.resolve("url/"),
      fs: false,
    };

    return config;
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    wsPort: 3001, // you can set any unused port number
  },
  async headers() {
    return [
      {
        source: "/", // this applies to all routes
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "http://localhost:3000/",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
};