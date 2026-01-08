import 'reflect-metadata'
import { DataSource } from 'typeorm'

// ============================================
// ENTITY IMPORTS - Explicit imports (NO globs)
// ============================================
// These imports are CRITICAL for metadata loading
// TypeORM reads metadata from these imports
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

// ============================================
// ENTITY ARRAY - Explicit registration
// ============================================
// All entities must be explicitly listed here
// DO NOT use glob patterns (e.g., __dirname + '/entities/*.ts')
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

// ============================================
// BUILD CONNECTION OPTIONS
// ============================================
function buildConnectionOptions() {
  const dbUrl = process.env.DATABASE_URL || ''
  
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const baseOptions: any = {
    type: 'postgres',
    synchronize: process.env.NODE_ENV === 'development',
    logging: process.env.NODE_ENV === 'development',
    entities: entities, // Explicit entity array
    migrations: [],
    subscribers: [],
    extra: {
      max: 10,
      min: 2,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      family: 4, // Force IPv4
    },
  }

  // Parse DATABASE_URL
  try {
    const urlStr = dbUrl.replace(/^postgresql:/, 'postgres:')
    const url = new URL(urlStr)
    
    baseOptions.host = url.hostname
    baseOptions.port = parseInt(url.port || '5432')
    baseOptions.username = decodeURIComponent(url.username || 'postgres')
    baseOptions.password = decodeURIComponent(url.password || '')
    baseOptions.database = url.pathname.replace(/^\//, '') || 'postgres'
    
    if (!baseOptions.password || typeof baseOptions.password !== 'string') {
      throw new Error('Password is not a valid string')
    }
  } catch (error) {
    console.warn('Failed to parse DATABASE_URL, using as-is:', error)
    baseOptions.url = dbUrl
  }

  // Add SSL for Supabase
  const needsSsl = 
    process.env.DB_SSL === 'true' ||
    dbUrl.includes('supabase.co') ||
    dbUrl.includes('sslmode=require') ||
    dbUrl.includes('pooler.supabase.com')
  
  if (needsSsl) {
    baseOptions.extra.ssl = {
      rejectUnauthorized: false,
    }
  }
  
  return baseOptions
}

// ============================================
// LAZY DATA SOURCE INITIALIZATION
// ============================================
let _appDataSource: DataSource | null = null

export function getAppDataSource(): DataSource {
  if (!_appDataSource) {
    const connectionOptions = buildConnectionOptions()
    _appDataSource = new DataSource(connectionOptions)
  }
  return _appDataSource
}
