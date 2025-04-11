/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }];  // required to make canvas work
    return config;
  },
  reactStrictMode: true,
  // Remove experimental.serverActions as it's now available by default
  // Add proper server configuration
  server: {
    hostname: '0.0.0.0',
    port: 3000
  }
}

module.exports = nextConfig 