"use strict";

module.exports = {
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'scobru.infura-ipfs.io',
      port: '',
      pathname: '/ipfs/**'
    }]
  },
  webpack5: true,
  webpack: function webpack(config) {
    config.resolve.fallback = {
      fs: false
    };
    return config;
  }
};