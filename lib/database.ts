// reflect-metadata EN ÜSTTE olmalı
import 'reflect-metadata'
import { DataSource } from 'typeorm'

// Entity'leri import et - metadata yüklenmesi için gerekli
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
void Settings // Metadata yüklenmesi için

// Entity'leri array'e koy - metadata yüklenmesi için
// Entity'lerin decorator'larının çalışması için burada referansları tutuyoruz
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

// DataSource'u doğrudan oluştur
// Next.js'de environment variable'lar runtime'da yüklenir
// DATABASE_URL kontrolü
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!')
  console.error('Please set DATABASE_URL in Vercel Environment Variables.')
  console.error('For Supabase: postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres')
  throw new Error('DATABASE_URL environment variable is required')
}

// Supabase Postgres genelde SSL ister
const needsSsl =
  process.env.DB_SSL === 'true' ||
  process.env.DATABASE_URL.includes('supabase.co') ||
  process.env.DATABASE_URL.includes('sslmode=require')

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false, // Performance için kapatıldı - migrations kullanın
  logging: false, // Performance için logging kapalı
  entities: entities, // Array olarak entity class'larını ver
  migrations: [],
  subscribers: [],
  extra: {
    max: 20, // Connection pool size artırıldı
    min: 5, // Minimum pool size
    connectionTimeoutMillis: 30000, // Timeout artırıldı
    idleTimeoutMillis: 30000,
    maxUses: 7500,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  },
  cache: false,
  // Metadata'yı zorla yükle
  entitySkipConstructor: false,
})

// Next.js için global connection singleton
declare global {
  var __typeorm_connection__: DataSource | undefined
}

let connection: DataSource | null = null

export async function getConnection(): Promise<DataSource> {
  // Development'ta hot reload'dan kaçınmak için global kullan
  if (process.env.NODE_ENV === 'development') {
    if (!global.__typeorm_connection__) {
      try {
        if (!AppDataSource.isInitialized) {
          await AppDataSource.initialize()
        }
        global.__typeorm_connection__ = AppDataSource
      } catch (error: any) {
        console.error('❌ TypeORM connection error:', error?.message)
        throw error
      }
    }
    
    // Connection'ın initialize olduğundan emin ol
    if (!global.__typeorm_connection__.isInitialized) {
      await global.__typeorm_connection__.initialize()
    }
    
    return global.__typeorm_connection__
  }

  // Production'da normal connection
  if (connection && connection.isInitialized) {
    return connection
  }

  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      connection = AppDataSource
    }
    return AppDataSource
  } catch (error: any) {
    console.error('❌ TypeORM connection error:', error?.message)
    throw error
  }
}
