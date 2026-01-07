import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'
import { DataSource } from 'typeorm'

// .env dosyasını yükle
config({ path: resolve(process.cwd(), '.env') })

async function fixQuantityColumn() {
  let connection: DataSource | null = null
  try {
    console.log('🔄 Veritabanı bağlantısı kuruluyor...')
    
    // Direkt DataSource oluştur (synchronize olmadan)
    const dataSource = new DataSource({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://postgres:333333@localhost:5432/baharat',
      synchronize: false,
      logging: true,
    })
    
    await dataSource.initialize()
    connection = dataSource
    console.log('✅ Veritabanı bağlantısı başarılı!')

    // Mevcut kolon tipini kontrol et
    const columnCheck = await connection.query(`
      SELECT 
        data_type,
        numeric_precision,
        numeric_scale,
        is_nullable
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'order_items' 
      AND column_name = 'quantity'
    `)

    console.log('📊 Mevcut quantity kolonu bilgisi:')
    console.log(JSON.stringify(columnCheck[0], null, 2))

    if (columnCheck[0]) {
      const currentType = columnCheck[0].data_type
      
      if (currentType === 'integer' || currentType === 'int4' || currentType === 'bigint' || currentType === 'int8') {
        console.log('🔧 quantity kolonu integer tipinde, float\'a çevriliyor...')
        
        // Önce NULL değerleri 0 ile doldur
        console.log('📝 NULL değerler kontrol ediliyor...')
        const nullCheck = await connection.query(`
          SELECT COUNT(*) as count
          FROM order_items 
          WHERE quantity IS NULL
        `)
        console.log(`📊 NULL değer sayısı: ${nullCheck[0]?.count || 0}`)
        
        if (parseInt(nullCheck[0]?.count || '0') > 0) {
          await connection.query(`
            UPDATE order_items 
            SET quantity = 0 
            WHERE quantity IS NULL
          `)
          console.log('✅ NULL değerler 0 ile dolduruldu')
        }
        
        // Kolonu float'a çevir - USING ile tip dönüşümü yap
        console.log('🔄 Kolon tipi değiştiriliyor...')
        await connection.query(`
          ALTER TABLE order_items 
          ALTER COLUMN quantity TYPE double precision USING quantity::double precision
        `)
        
        console.log('✅ quantity kolonu double precision\'a çevrildi!')
      } else if (currentType === 'double precision' || currentType === 'real' || currentType === 'numeric') {
        console.log('✅ quantity kolonu zaten float tipinde')
      } else {
        console.log('⚠️ Beklenmeyen tip:', currentType)
        console.log('🔧 Yine de double precision\'a çevriliyor...')
        try {
          await connection.query(`
            ALTER TABLE order_items 
            ALTER COLUMN quantity TYPE double precision USING quantity::double precision
          `)
          console.log('✅ Kolon tipi değiştirildi')
        } catch (alterError: any) {
          console.error('❌ Kolon tipi değiştirilemedi:', alterError.message)
        }
      }
    } else {
      console.log('⚠️ quantity kolonu bulunamadı!')
    }

    // Son kontrol
    const finalCheck = await connection.query(`
      SELECT data_type
      FROM information_schema.columns 
      WHERE table_schema = 'public'
      AND table_name = 'order_items' 
      AND column_name = 'quantity'
    `)

    console.log('\n📊 Final quantity tipi:', finalCheck[0]?.data_type)
    console.log('✅ İşlem tamamlandı!')

    if (connection && connection.isInitialized) {
      await connection.destroy()
    }
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

fixQuantityColumn()

