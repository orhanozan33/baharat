// Database connection health check endpoint
// This endpoint helps diagnose database connection issues
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if DATABASE_URL is set
    const hasDatabaseUrl = !!process.env.DATABASE_URL
    
    if (!hasDatabaseUrl) {
      return NextResponse.json({
        status: 'error',
        message: 'DATABASE_URL environment variable is not set',
        details: {
          hasDatabaseUrl: false,
          environment: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
        },
        fix: 'Add DATABASE_URL to Vercel Environment Variables and redeploy',
      }, { status: 500 })
    }

    // Check if DATABASE_URL contains localhost (wrong)
    const databaseUrl = process.env.DATABASE_URL!
    // We know it's defined here because we checked above
    const isLocalhost = databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')
    const isSupabase = databaseUrl.includes('supabase.co')
    
    if (isLocalhost) {
      return NextResponse.json({
        status: 'error',
        message: 'DATABASE_URL points to localhost (127.0.0.1). This is wrong for Vercel!',
        details: {
          hasDatabaseUrl: true,
          isLocalhost: true,
          isSupabase: false,
          databaseUrlPreview: databaseUrl.substring(0, 20) + '...',
          environment: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
        },
        fix: 'Update DATABASE_URL to point to Supabase (db.wznkjgmhtcxkmwxhfkxi.supabase.co) and redeploy',
      }, { status: 500 })
    }

    // Try to connect to database
    try {
      const { AppDataSource } = await import('@/lib/database')
      
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
      }

      // Simple query to test connection
      const queryRunner = AppDataSource.createQueryRunner()
      await queryRunner.connect()
      await queryRunner.query('SELECT 1')
      await queryRunner.release()

      return NextResponse.json({
        status: 'success',
        message: 'Database connection successful',
        details: {
          hasDatabaseUrl: true,
          isLocalhost: false,
          isSupabase: isSupabase,
          databaseUrlPreview: databaseUrl.substring(0, 30) + '...',
          isInitialized: AppDataSource.isInitialized,
          environment: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
        },
      })
    } catch (dbError: any) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        details: {
          hasDatabaseUrl: true,
          isLocalhost: false,
          isSupabase: isSupabase,
          databaseUrlPreview: databaseUrl.substring(0, 30) + '...',
          error: dbError.message,
          environment: process.env.NODE_ENV,
          vercelEnv: process.env.VERCEL_ENV,
        },
        fix: 'Check DATABASE_URL format and ensure Supabase database is accessible',
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
    }, { status: 500 })
  }
}

