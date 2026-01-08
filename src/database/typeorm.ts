import { DataSource } from 'typeorm'
import { AppDataSource } from './data-source'

// Global connection cache for Vercel serverless
// Prevents multiple initializations in the same execution context
declare global {
  var __typeorm_connection__: DataSource | undefined
}

/**
 * Safe database connection helper for Vercel serverless environment
 * 
 * Features:
 * - Prevents multiple initializations
 * - Handles connection reuse in serverless functions
 * - Proper error handling
 * - Works with Vercel's execution model
 * 
 * @returns Promise<DataSource> - Initialized TypeORM DataSource
 * @throws Error if DATABASE_URL is not set or connection fails
 */
export async function connectDB(): Promise<DataSource> {
  // Check if DATABASE_URL is set
  if (!process.env.DATABASE_URL) {
    throw new Error(
      'DATABASE_URL environment variable is not set. ' +
      'Please set it in your Vercel environment variables.'
    )
  }

  // In development, use global to prevent multiple connections during hot reload
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

  // In production (Vercel), check if already initialized
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

// Export AppDataSource for direct access (use with caution)
export { AppDataSource }

