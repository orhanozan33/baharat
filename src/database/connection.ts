// reflect-metadata EN ÜSTTE olmalı
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

// DataSource'u lazy initialize et
// Next.js'de environment variable'lar runtime'da yüklenir
let _appDataSource: DataSource | null = null

function getDataSource(): DataSource {
  if (_appDataSource) {
    return _appDataSource
  }

  // DATABASE_URL kontrolü - runtime'da yapılmalı
  const databaseUrl = process.env.DATABASE_URL
  
  if (!databaseUrl) {
    const error = '❌ DATABASE_URL environment variable is not set!'
    console.error(error)
    console.error('Please set DATABASE_URL in Vercel Environment Variables.')
    console.error('Current environment:', process.env.NODE_ENV)
    console.error('Vercel env:', process.env.VERCEL_ENV)
    throw new Error(error + ' Please check Vercel Environment Variables and redeploy.')
  }

  // Localhost kontrolü
  if (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')) {
    const error = '❌ DATABASE_URL points to localhost. This will not work on Vercel!'
    console.error(error)
    console.error('DATABASE_URL should point to Supabase, not localhost.')
    console.error('Current DATABASE_URL preview:', databaseUrl.substring(0, 50) + '...')
    throw new Error(error + ' Update DATABASE_URL to Supabase connection string and redeploy.')
  }

  // Supabase Postgres genelde SSL ister
  const needsSsl =
    process.env.DB_SSL === 'true' ||
    databaseUrl.includes('supabase.co') ||
    databaseUrl.includes('sslmode=require')

  console.log('✅ Initializing database connection...')
  console.log('Database URL preview:', databaseUrl.substring(0, 40) + '...')
  console.log('SSL required:', needsSsl)
  console.log('Environment:', process.env.NODE_ENV, process.env.VERCEL_ENV)

  _appDataSource = new DataSource({
    type: 'postgres',
    url: databaseUrl,
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

  return _appDataSource
}

// Export getter - her kullanımda kontrol edilir
export const AppDataSource = new Proxy({} as DataSource, {
  get(target, prop) {
    const ds = getDataSource()
    const value = (ds as any)[prop]
    if (typeof value === 'function') {
      return value.bind(ds)
    }
    return value
  },
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
