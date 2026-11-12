/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimisticClientCache: true,
    serverActions: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
