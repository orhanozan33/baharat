import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { DataSource } from 'typeorm'
import { extractAuthToken, verifyToken } from '@/lib/auth'
import { UserRole } from '@/entities/enums/UserRole'

// Entity'leri import et
import { User } from '@/entities/User'
import { Admin } from '@/entities/Admin'
import { Dealer } from '@/entities/Dealer'
import { Category } from '@/entities/Category'
import { Product } from '@/entities/Product'
import { DealerProduct } from '@/entities/DealerProduct'
import { Order } from '@/entities/Order'
import { OrderItem } from '@/entities/OrderItem'
import { Invoice } from '@/entities/Invoice'
import { Payment } from '@/entities/Payment'
import { Check } from '@/entities/Check'
import { Settings } from '@/entities/Settings'

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
 * Database tablolarını oluşturan endpoint
 * Sadece ADMIN kullanıcılar erişebilir
 * İlk kurulum için kullanılır
 */
export async function POST(req: NextRequest) {
  try {
    // Admin kontrolü
    const token = extractAuthToken(req)
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'DATABASE_URL environment variable is not set' },
        { status: 500 }
      )
    }

    // Geçici DataSource oluştur (synchronize: true ile)
    const tempDataSource = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: true, // Tabloları oluştur
      logging: true, // Logging açık
      entities: entities,
      extra: {
        max: 5,
        min: 1,
        connectionTimeoutMillis: 30000,
      },
    })

    // Initialize ve synchronize
    await tempDataSource.initialize()
    console.log('✅ Database initialized, tables will be created...')
    
    // Synchronize işlemi initialize sırasında otomatik yapılır
    // Tabloların oluşturulduğunu kontrol et
    const queryRunner = tempDataSource.createQueryRunner()
    const tables = await queryRunner.getTables()
    const tableNames = tables.map(table => table.name)

    // Connection'ı kapat
    await tempDataSource.destroy()

    return NextResponse.json({
      success: true,
      message: 'Database tables created successfully',
      tables: tableNames.sort(),
      count: tableNames.length,
    })
  } catch (error: any) {
    console.error('❌ Database setup error:', error)
    return NextResponse.json(
      {
        error: 'Database setup failed',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}
