/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true,
  },
  experimental: {
    serverComponentsExternalPackages: ['firebase', '@firebase/auth', 'undici'],
  },
}

module.exports = nextConfig
