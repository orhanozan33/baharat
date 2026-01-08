import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/src/database/typeorm'
import { AppDataSource } from '@/src/database/typeorm'

/**
 * Test API route to verify database connection
 * 
 * GET /api/test-db
 * 
 * Returns:
 * - Connection status
 * - Database information
 * - Query test result
 */
export async function GET(request: NextRequest) {
  try {
    // Test 1: Connect to database
    const dataSource = await connectDB()
    
    // Test 2: Verify connection is active
    if (!dataSource.isInitialized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Database connection is not initialized',
        },
        { status: 500 }
      )
    }

    // Test 3: Run a simple query to verify connection works
    const queryRunner = dataSource.createQueryRunner()
    let queryResult
    
    try {
      // Simple query to test connection
      queryResult = await queryRunner.query('SELECT NOW() as current_time, version() as postgres_version')
    } finally {
      await queryRunner.release()
    }

    // Test 4: Get connection info
    const connectionInfo = {
      isInitialized: dataSource.isInitialized,
      driver: {
        database: dataSource.driver.database,
        host: dataSource.driver.options?.host || 'N/A',
        port: dataSource.driver.options?.port || 'N/A',
      },
    }

    // Success response
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      connection: connectionInfo,
      query: {
        currentTime: queryResult[0]?.current_time,
        postgresVersion: queryResult[0]?.postgres_version?.substring(0, 50) + '...',
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPreview: process.env.DATABASE_URL
          ? process.env.DATABASE_URL.substring(0, 30) + '...'
          : 'Not set',
      },
    })
  } catch (error: any) {
    console.error('Database test error:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
        details: {
          name: error.name,
          code: error.code,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          databaseUrlPreview: process.env.DATABASE_URL
            ? process.env.DATABASE_URL.substring(0, 30) + '...'
            : 'Not set',
        },
      },
      { status: 500 }
    )
  }
}

