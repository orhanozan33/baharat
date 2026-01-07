import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env dosyasını yükle - EN ÜSTTE
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

import { getConnection } from '../lib/database'
import { getProductRepository } from '../lib/db'

async function addStockToProducts() {
  try {
    console.log('🔄 Veritabanı bağlantısı kuruluyor...')
    const connection = await getConnection()
    console.log('✅ Veritabanı bağlantısı başarılı!')
    
    const productRepo = await getProductRepository()
    
    // Tüm ürünleri getir
    const products = await productRepo.find()
    console.log(`📦 ${products.length} ürün bulundu`)
    
    let updatedCount = 0
    
    // Her ürüne 1 kg stok ekle
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      
      // Stok miktarını 1 olarak ayarla (kg cinsinden)
      product.stock = 1
      
      await productRepo.save(product)
      updatedCount++
      
      if ((i + 1) % 50 === 0) {
        console.log(`  ✓ ${i + 1}/${products.length} ürün güncellendi...`)
      }
    }
    
    console.log('\n✅ İşlem tamamlandı!')
    console.log(`📊 Özet:`)
    console.log(`   - Güncellenen ürün: ${updatedCount}`)
    console.log(`   - Eklenen stok: 1 kg (her ürün için)`)
    
    // Connection'ı kapat
    if (connection.isInitialized) {
      await connection.destroy()
    }
    
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Hata:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

// Script'i çalıştır
addStockToProducts()

