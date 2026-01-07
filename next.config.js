/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Package import optimizations
    optimizePackageImports: [
      '@hookform/resolvers',
      'react-hook-form',
      'next-intl',
      'typeorm',
    ],
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Development optimizations
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
    }
    return config
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Image optimization
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  // TypeORM için server-side external packages (Next.js 14.2+ için)
  // Note: serverExternalPackages Next.js 14.2'de experimental olabilir
  
  // Production optimizations
  swcMinify: true,
  reactStrictMode: false, // Performance için strict mode kapalı (development'ta yavaşlatabilir)
  
  // Development optimizations
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
