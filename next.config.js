/** @type {import('next').NextConfig} */
const path = require('path')

const nextConfig = {
  compress: true,
  poweredByHeader: false,
  output: 'standalone',
  
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
    optimizePackageImports: [
      '@hookform/resolvers',
      'react-hook-form',
      'next-intl',
    ],
    serverComponentsExternalPackages: [
      'typeorm',
      'pg',
      'reflect-metadata',
      'bcryptjs',
      'jsonwebtoken',
    ],
  },
  
  webpack: (config, { isServer, webpack }) => {
    // Server-side: TypeORM external
    if (isServer) {
      config.externals = config.externals || []
      if (Array.isArray(config.externals)) {
        config.externals.push({
          'typeorm': 'commonjs typeorm',
          'pg': 'commonjs pg',
          'reflect-metadata': 'commonjs reflect-metadata',
        })
      }
    }
    
    // Fallback for optional dependencies
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
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
      '@prisma/client': false,
    }
    
    // Alias to redirect Prisma imports to stub
    const prismaStubPath = path.resolve(__dirname, 'lib/prisma.ts')
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      '@/lib/prisma': prismaStubPath,
      '@prisma/client': prismaStubPath,
    }
    
    // Use NormalModuleReplacementPlugin to replace Prisma imports
    config.plugins = config.plugins || []
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /^@prisma\/client$/,
        prismaStubPath
      ),
      new webpack.NormalModuleReplacementPlugin(
        /^@\/lib\/prisma$/,
        prismaStubPath
      )
    )
    
    return config
  },
  
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: '**' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  swcMinify: true,
  reactStrictMode: false,
}

module.exports = nextConfig
