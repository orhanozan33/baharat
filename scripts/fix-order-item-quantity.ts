import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env dosyasını yükle
config({ path: resolve(process.cwd(), '.env') })

// Entity'leri import et - metadata yüklenmesi için
import '../entities/User'
import '../entities/Admin'
import '../entities/Dealer'
import '../entities/Category'
import '../entities/Product'
import '../entities/DealerProduct'
import '../entities/Order'
import '../entities/OrderItem'

import { DataSource } from 'typeorm'

async function fixOrderItemQuantity() {
  let connection: DataSource | null = null
  try {
    console.log('🔄 Veritabanı bağlantısı kuruluyor...')
    
    // Direkt DataSource oluştur (synchronize olmadan)
    const dataSource = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:333333@localhost:5432/baharat',
      synchronize: false, // Synchronize'i kapat
      logging: false,
    })
    
    await dataSource.initialize()
    connection = dataSource
    console.log('✅ Veritabanı bağlantısı başarılı!')

    // Mevcut kolon tipini kontrol et
    const columnCheck = await connection.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' 
      AND column_name = 'quantity'
    `)

    console.log('📊 Mevcut quantity tipi:', columnCheck[0]?.data_type || 'bulunamadı')

    if (columnCheck[0]?.data_type === 'integer' || columnCheck[0]?.data_type === 'int4') {
      console.log('🔧 quantity kolonu integer, float\'a çevriliyor...')
      
      // Önce NULL değerleri 0 ile doldur
      console.log('📝 NULL değerler 0 ile dolduruluyor...')
      const nullUpdate = await connection.query(`
        UPDATE order_items 
        SET quantity = 0 
        WHERE quantity IS NULL
      `)
      console.log(`✅ ${nullUpdate[1] || 0} NULL değer güncellendi`)
      
      // Kolonu float'a çevir
      await connection.query(`
        ALTER TABLE order_items 
        ALTER COLUMN quantity TYPE double precision USING quantity::double precision
      `)
      
      console.log('✅ quantity kolonu float\'a çevrildi!')
    } else if (columnCheck[0]?.data_type === 'double precision' || columnCheck[0]?.data_type === 'real' || columnCheck[0]?.data_type === 'numeric') {
      console.log('✅ quantity kolonu zaten float tipinde')
    } else {
      console.log('⚠️ Bilinmeyen tip:', columnCheck[0]?.data_type)
    }

    // Kontrol et
    const finalCheck = await connection.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'order_items' 
      AND column_name = 'quantity'
    `)

    console.log('📊 Yeni quantity tipi:', finalCheck[0]?.data_type)

    if (connection && connection.isInitialized) {
      await connection.destroy()
    }
    console.log('\n✅ İşlem tamamlandı!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Hata:', error.message)
    console.error(error.stack)
    if (connection && connection.isInitialized) {
      await connection.destroy()
    }
    process.exit(1)
  }
}

fixOrderItemQuantity()

