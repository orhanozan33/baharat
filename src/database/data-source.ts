import 'reflect-metadata'
import { DataSource } from 'typeorm'

// Entity'leri import et - metadata yüklenmesi için gerekli
import { User } from './entities/User'
import { Admin } from './entities/Admin'
import { Dealer } from './entities/Dealer'
import { Category } from './entities/Category'
import { Product } from './entities/Product'
import { DealerProduct } from './entities/DealerProduct'
import { Order } from './entities/Order'
import { OrderItem } from './entities/OrderItem'
import { Invoice } from './entities/Invoice'
import { Payment } from './entities/Payment'
import { Check } from './entities/Check'
import { Settings } from './entities/Settings'

// Entity'leri array'e koy
const entities = [
  User,
  Admin,
  Dealer,
  Category,
  Product,
  DealerProduct,
  Order,
  OrderItem,
  Invoice,
  Payment,
  Check,
  Settings,
]

/**
 * TypeORM DataSource configuration for Supabase Postgres
 * Compatible with Vercel serverless environment
 * 
 * Requirements:
 * - DATABASE_URL must be set (Session Pooler format recommended)
 * - SSL enabled with rejectUnauthorized: false for Supabase
 * - Connection pooling optimized for serverless
 */
// Check if SSL is needed (Supabase requires SSL)
const databaseUrl = process.env.DATABASE_URL || ''
const needsSsl = 
  process.env.DB_SSL === 'true' ||
  databaseUrl.includes('supabase.co') ||
  databaseUrl.includes('sslmode=require') ||
  databaseUrl.includes('pooler.supabase.com')

// Build connection options
const connectionOptions: any = {
  type: 'postgres',
  url: databaseUrl,
  synchronize: false, // NEVER true in production
  logging: process.env.NODE_ENV === 'development',
  entities: entities,
  migrations: [],
  subscribers: [],
  // Connection pool settings optimized for serverless
  extra: {
    // Connection pool size (adjust based on your needs)
    max: 10, // Max connections per instance
    min: 2,  // Min connections to keep alive
    // Timeout settings
    connectionTimeoutMillis: 10000, // 10 seconds
    idleTimeoutMillis: 30000, // 30 seconds
    // IPv4 preference (helps avoid IPv6 timeout issues)
    family: 4,
  },
}

// Add SSL configuration for Supabase
if (needsSsl) {
  // SSL must be in extra.ssl for pg driver
  connectionOptions.extra.ssl = {
    rejectUnauthorized: false, // Required for Supabase self-signed certificates
  }
  // Also set NODE_TLS_REJECT_UNAUTHORIZED for Node.js TLS
  if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  }
  // Ensure sslmode is in connection string
  if (!databaseUrl.includes('sslmode=')) {
    connectionOptions.url = databaseUrl + (databaseUrl.includes('?') ? '&' : '?') + 'sslmode=require'
  }
}

export const AppDataSource = new DataSource(connectionOptions)

