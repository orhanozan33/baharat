// reflect-metadata MUST be imported FIRST
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { getAppDataSource } from './data-source'

// ============================================
// ENTITY IMPORTS - Force metadata loading
// ============================================
// Import all entities to ensure metadata is loaded
// These side-effect imports are CRITICAL
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

// Force metadata loading by referencing entities
void User
void Admin
void Dealer
void Category
void Product
void DealerProduct
void Order
void OrderItem
void Invoice
void Payment
void Check
void Settings

// ============================================
// GLOBAL CONNECTION CACHE
// ============================================
// Prevents multiple initializations in serverless
declare global {
  var __typeorm_connection__: DataSource | undefined
}

/**
 * Safe database connection helper for Vercel/serverless
 * 
 * Features:
 * - Prevents multiple initializations
 * - Handles connection reuse in serverless functions
 * - Proper error handling
 * - Works with Next.js App Router
 * 
 * @returns Promise<DataSource> - Initialized TypeORM DataSource
 * @throws Error if DATABASE_URL is not set or connection fails
 */
export async function connectDB(): Promise<DataSource> {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please set it in your environment variables.'
    )
  }

  const AppDataSource = getAppDataSource()

  // Development: Use global cache to prevent multiple connections during hot reload
  if (process.env.NODE_ENV === 'development') {
    if (!global.__typeorm_connection__) {
      try {
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize()
          console.log('✅ Database connected (development)')
        }
        global.__typeorm_connection__ = AppDataSource
      } catch (error: any) {
        console.error('❌ Database connection error:', error.message)
        throw error
      }
    }
    return global.__typeorm_connection__
  }

  // Production (Vercel): Check if already initialized
  if (AppDataSource.isInitialized) {
    return AppDataSource
  }

  // Initialize connection
  try {
    await AppDataSource.initialize()
    console.log('✅ Database connected (production)')
    return AppDataSource
  } catch (error: any) {
    console.error('❌ Database connection error:', error.message)
    throw error
  }
}

/**
 * Get the initialized DataSource
 * Automatically connects if not already connected
 */
export async function getDB(): Promise<DataSource> {
  return await connectDB()
}

// Export for direct access
export { getAppDataSource }
