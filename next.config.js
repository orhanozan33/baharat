/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  compress: true,
  poweredByHeader: false,
  
  // Vercel optimizations
  output: 'standalone', // Vercel için standalone output
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    // Package import optimizations (TypeORM hariç - external olarak işaretlendi)
    optimizePackageImports: [
      '@hookform/resolvers',
      'react-hook-form',
      'next-intl',
    ],
    // TypeORM için server components external packages
    // Bu paketler server-side only olmalı ve webpack bundle'ına dahil edilmemeli
    serverComponentsExternalPackages: [
      'typeorm',
      'pg',
      'reflect-metadata',
      'bcryptjs',
      'jsonwebtoken',
    ],
  },
  
  // Webpack optimizations for Vercel
  webpack: (config, { dev, isServer }) => {
    // Server-side only: TypeORM ve database paketleri
    if (isServer) {
      // TypeORM için external packages
      config.externals = config.externals || []
      config.externals.push({
        'typeorm': 'commonjs typeorm',
        'pg': 'commonjs pg',
        'reflect-metadata': 'commonjs reflect-metadata',
      })
    }
    
    // Client-side optimizations
    if (dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
    }
    
    // Ignore optional TypeORM dependencies (browser/client-side)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'react-native-sqlite-storage': false,
      '@sap/hana-client/extension/Stream': false,
      'mysql': false,
      'mysql2': false,
      'better-sqlite3': false,
      'sql.js': false,
      'sqlite3': false,
      'ioredis': false,
      'redis': false,
      'mongodb': false,
      'oracledb': false,
    }
    
    // Alias for Prisma (stub) - ignore @prisma/client
    config.resolve.alias = {
      ...config.resolve.alias,
    }
    
    // Ignore @prisma/client imports
    if (!config.resolve.fallback) {
      config.resolve.fallback = {}
    }
    config.resolve.fallback['@prisma/client'] = false
    
    // Ignore TypeORM driver files that aren't needed
    config.resolve.alias = {
      ...config.resolve.alias,
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
  
  // Production optimizations
  swcMinify: true,
  reactStrictMode: false, // Performance için strict mode kapalı
  
  // Development optimizations
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Vercel-specific optimizations
  env: {
    // Environment variables will be available at build time
  },
}

module.exports = nextConfig
