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
import { getProductRepository, getOrderItemRepository, getDealerProductRepository } from '../lib/db'
import { createSlug } from '../lib/utils'

// Görselden çıkarılan tüm ürünler
const PRODUCTS_DATA = [
  // ZİPLİ AMBALAJ (1-46)
  { package: 'ZİPLİ AMBALAJ', name: 'ISOT PEPPER' },
  { package: 'ZİPLİ AMBALAJ', name: 'CHILI FLAKES' },
  { package: 'ZİPLİ AMBALAJ', name: 'CHILI FLAKES EXTRA HOT' },
  { package: 'ZİPLİ AMBALAJ', name: 'CHILI POWDER' },
  { package: 'ZİPLİ AMBALAJ', name: 'SWEET PAPRIKA FLAKES' },
  { package: 'ZİPLİ AMBALAJ', name: 'SWEET PAPRIKA POWDER' },
  { package: 'ZİPLİ AMBALAJ', name: 'BLACK PEPPER GROUND' },
  { package: 'ZİPLİ AMBALAJ', name: 'BLACK PEPPER COARSE' },
  { package: 'ZİPLİ AMBALAJ', name: 'BLACK PEPPERCORNS' },
  { package: 'ZİPLİ AMBALAJ', name: 'WHITE PEPPERCORNS' },
  { package: 'ZİPLİ AMBALAJ', name: 'WHITE PEPPER GROUND' },
  { package: 'ZİPLİ AMBALAJ', name: 'SUMAC (WHOLE)' },
  { package: 'ZİPLİ AMBALAJ', name: 'BAY LEAF' },
  { package: 'ZİPLİ AMBALAJ', name: 'MINT FLAKES' },
  { package: 'ZİPLİ AMBALAJ', name: 'THYME' },
  { package: 'ZİPLİ AMBALAJ', name: 'OREGANO' },
  { package: 'ZİPLİ AMBALAJ', name: 'ROSEMARY LEAVES' },
  { package: 'ZİPLİ AMBALAJ', name: 'PARSLEY FLAKES' },
  { package: 'ZİPLİ AMBALAJ', name: 'FENUGREEK SEEDS' },
  { package: 'ZİPLİ AMBALAJ', name: 'FENUGREEK POWDER' },
  { package: 'ZİPLİ AMBALAJ', name: 'CUMIN SEEDS' },
  { package: 'ZİPLİ AMBALAJ', name: 'CUMIN GROUND' },
  { package: 'ZİPLİ AMBALAJ', name: 'CORIANDER SEEDS' },
  { package: 'ZİPLİ AMBALAJ', name: 'CORIANDER POWDER' },
  { package: 'ZİPLİ AMBALAJ', name: 'SESAME (ROASTED)' },
  { package: 'ZİPLİ AMBALAJ', name: 'BLACK SEEDS' },
  { package: 'ZİPLİ AMBALAJ', name: 'BLUE POPPY SEEDS' },
  { package: 'ZİPLİ AMBALAJ', name: 'CHIA SEEDS' },
  { package: 'ZİPLİ AMBALAJ', name: 'CARAWAY SEEDS' },
  { package: 'ZİPLİ AMBALAJ', name: 'FLAXSEED' },
  { package: 'ZİPLİ AMBALAJ', name: 'ANISE SEEDS' },
  { package: 'ZİPLİ AMBALAJ', name: 'SHREDDED COCONUT' },
  { package: 'ZİPLİ AMBALAJ', name: 'CINNAMON STICKS' },
  { package: 'ZİPLİ AMBALAJ', name: 'CINNAMON POWDER' },
  { package: 'ZİPLİ AMBALAJ', name: 'CLOVES' },
  { package: 'ZİPLİ AMBALAJ', name: 'CLOVES GROUND' },
  { package: 'ZİPLİ AMBALAJ', name: 'STAR ANISE' },
  { package: 'ZİPLİ AMBALAJ', name: 'GARLIC POWDER (GRANULES)' },
  { package: 'ZİPLİ AMBALAJ', name: 'ONION POWDER' },
  { package: 'ZİPLİ AMBALAJ', name: 'ALLSPICE POWDER (WHOLE)' },
  { package: 'ZİPLİ AMBALAJ', name: 'GINGER POWDER' },
  { package: 'ZİPLİ AMBALAJ', name: 'TURMERIC POWDER' },
  { package: 'ZİPLİ AMBALAJ', name: 'BAKING SODA' },
  { package: 'ZİPLİ AMBALAJ', name: 'CITRIC ACID POWDER' },
  { package: 'ZİPLİ AMBALAJ', name: 'SEA SALT POWDER' },
  { package: 'ZİPLİ AMBALAJ', name: 'HIMALAYAN SALT POWDER' },
  { package: 'ZİPLİ AMBALAJ', name: 'ROCK SALT POWDER' },
  
  // ORTA PETLER (47-109)
  { package: 'ORTA PETLER', name: 'ISOT PEPPER' },
  { package: 'ORTA PETLER', name: 'CHILI FLAKES' },
  { package: 'ORTA PETLER', name: 'CHILI FLAKES EXTRA HOT' },
  { package: 'ORTA PETLER', name: 'CHILI POWDER' },
  { package: 'ORTA PETLER', name: 'SWEET PAPRIKA FLAKES' },
  { package: 'ORTA PETLER', name: 'SWEET PAPRIKA POWDER' },
  { package: 'ORTA PETLER', name: 'BLACK PEPPER GROUND' },
  { package: 'ORTA PETLER', name: 'BLACK PEPPER COARSE' },
  { package: 'ORTA PETLER', name: 'BLACK PEPPERCORNS' },
  { package: 'ORTA PETLER', name: 'WHITE PEPPERCORNS' },
  { package: 'ORTA PETLER', name: 'WHITE PEPPER GROUND' },
  { package: 'ORTA PETLER', name: 'SUMAC (WHOLE)' },
  { package: 'ORTA PETLER', name: 'BAY LEAF' },
  { package: 'ORTA PETLER', name: 'MINT FLAKES' },
  { package: 'ORTA PETLER', name: 'THYME' },
  { package: 'ORTA PETLER', name: 'OREGANO' },
  { package: 'ORTA PETLER', name: 'ROSEMARY LEAVES' },
  { package: 'ORTA PETLER', name: 'PARSLEY FLAKES' },
  { package: 'ORTA PETLER', name: 'FENUGREEK SEEDS' },
  { package: 'ORTA PETLER', name: 'FENUGREEK POWDER' },
  { package: 'ORTA PETLER', name: 'CUMIN SEEDS' },
  { package: 'ORTA PETLER', name: 'CUMIN GROUND' },
  { package: 'ORTA PETLER', name: 'CORIANDER SEEDS' },
  { package: 'ORTA PETLER', name: 'CORIANDER POWDER' },
  { package: 'ORTA PETLER', name: 'SESAME (ROASTED)' },
  { package: 'ORTA PETLER', name: 'BLACK SEEDS' },
  { package: 'ORTA PETLER', name: 'BLUE POPPY SEEDS' },
  { package: 'ORTA PETLER', name: 'CHIA SEEDS' },
  { package: 'ORTA PETLER', name: 'CARAWAY SEEDS' },
  { package: 'ORTA PETLER', name: 'FLAXSEED' },
  { package: 'ORTA PETLER', name: 'ANISE SEEDS' },
  { package: 'ORTA PETLER', name: 'SHREDDED COCONUT' },
  { package: 'ORTA PETLER', name: 'CINNAMON STICKS' },
  { package: 'ORTA PETLER', name: 'CINNAMON POWDER' },
  { package: 'ORTA PETLER', name: 'CLOVES' },
  { package: 'ORTA PETLER', name: 'CLOVES GROUND' },
  { package: 'ORTA PETLER', name: 'STAR ANISE' },
  { package: 'ORTA PETLER', name: 'GARLIC POWDER (GRANULES)' },
  { package: 'ORTA PETLER', name: 'ONION POWDER' },
  { package: 'ORTA PETLER', name: 'ALLSPICE POWDER (WHOLE)' },
  { package: 'ORTA PETLER', name: 'GINGER POWDER' },
  { package: 'ORTA PETLER', name: 'TURMERIC POWDER' },
  { package: 'ORTA PETLER', name: 'BAKING SODA' },
  { package: 'ORTA PETLER', name: 'CITRIC ACID POWDER' },
  { package: 'ORTA PETLER', name: 'SEA SALT POWDER' },
  { package: 'ORTA PETLER', name: 'HIMALAYAN SALT POWDER' },
  { package: 'ORTA PETLER', name: 'ROCK SALT POWDER' },
  { package: 'ORTA PETLER', name: 'MEAT SEASONING' },
  { package: 'ORTA PETLER', name: 'GARAM MASALA' },
  { package: 'ORTA PETLER', name: 'KERRIE MASALLA' },
  { package: 'ORTA PETLER', name: 'CURRY' },
  { package: 'ORTA PETLER', name: 'HOT MADRAS CURRY' },
  { package: 'ORTA PETLER', name: 'BARBECUE SEASONING' },
  { package: 'ORTA PETLER', name: 'FRIES SEASONING' },
  { package: 'ORTA PETLER', name: 'RAS EL HANOUT' },
  { package: 'ORTA PETLER', name: 'GARLIC MIX' },
  { package: 'ORTA PETLER', name: 'CHICKEN SEASONING' },
  { package: 'ORTA PETLER', name: '7 SPICE' },
  { package: 'ORTA PETLER', name: 'BIRYANI MASALA' },
  { package: 'ORTA PETLER', name: 'DONER SEASONING' },
  { package: 'ORTA PETLER', name: 'KOFTA SEASONING' },
  { package: 'ORTA PETLER', name: 'MERQUEZ SAUSAGE SEASONING' },
  { package: 'ORTA PETLER', name: 'RICE SEASONING' },
  { package: 'ORTA PETLER', name: 'TANDOORI MASALA' },
  
  // BÜYÜK PETLER (110-137)
  { package: 'BÜYÜK PETLER', name: 'ISOT PEPPER' },
  { package: 'BÜYÜK PETLER', name: 'CHILI FLAKES' },
  { package: 'BÜYÜK PETLER', name: 'CHILI FLAKES EXTRA HOT' },
  { package: 'BÜYÜK PETLER', name: 'CHILI POWDER' },
  { package: 'BÜYÜK PETLER', name: 'SWEET PAPRIKA FLAKES' },
  { package: 'BÜYÜK PETLER', name: 'SWEET PAPRIKA POWDER' },
  { package: 'BÜYÜK PETLER', name: 'BLACK PEPPER GROUND' },
  { package: 'BÜYÜK PETLER', name: 'BLACK PEPPER COARSE' },
  { package: 'BÜYÜK PETLER', name: 'BLACK PEPPERCORNS' },
  { package: 'BÜYÜK PETLER', name: 'WHITE PEPPERCORNS' },
  { package: 'BÜYÜK PETLER', name: 'WHITE PEPPER GROUND' },
  { package: 'BÜYÜK PETLER', name: 'SUMAC (WHOLE)' },
  { package: 'BÜYÜK PETLER', name: 'BAY LEAF' },
  { package: 'BÜYÜK PETLER', name: 'MINT FLAKES' },
  { package: 'BÜYÜK PETLER', name: 'THYME' },
  { package: 'BÜYÜK PETLER', name: 'OREGANO' },
  { package: 'BÜYÜK PETLER', name: 'ROSEMARY LEAVES' },
  { package: 'BÜYÜK PETLER', name: 'PARSLEY FLAKES' },
  { package: 'BÜYÜK PETLER', name: 'FENUGREEK SEEDS' },
  { package: 'BÜYÜK PETLER', name: 'FENUGREEK POWDER' },
  { package: 'BÜYÜK PETLER', name: 'CUMIN SEEDS' },
  { package: 'BÜYÜK PETLER', name: 'CUMIN GROUND' },
  { package: 'BÜYÜK PETLER', name: 'CORIANDER SEEDS' },
  { package: 'BÜYÜK PETLER', name: 'CORIANDER POWDER' },
  { package: 'BÜYÜK PETLER', name: 'SESAME (ROASTED)' },
  { package: 'BÜYÜK PETLER', name: 'BLACK SEEDS' },
  { package: 'BÜYÜK PETLER', name: 'BLUE POPPY SEEDS' },
  { package: 'BÜYÜK PETLER', name: 'CHIA SEEDS' },
  
  // SOSLAR (138-140)
  { package: 'SOSLAR', name: 'LEMON SAUCE', volume: '1000 ml' },
  { package: 'SOSLAR', name: 'LEMON SAUCE', volume: '500 ml' },
  { package: 'SOSLAR', name: 'POMEGRANATE SAUCE', volume: '1000 ml' },
  
  // YAĞLAR (141-142)
  { package: 'YAĞLAR', name: 'BLACK SEED OIL' },
  { package: 'YAĞLAR', name: 'SESAME OIL', volume: '250 ml' },
  
  // SİRKELER (143-145)
  { package: 'SİRKELER', name: 'WHITE VINEGAR', volume: '1000 ml' },
  { package: 'SİRKELER', name: 'APPLE VINEGAR', volume: '1000 ml' },
  { package: 'SİRKELER', name: 'GRAPE VINEGAR', volume: '1000 ml' },
  
  // KOVALAR (146-149)
  { package: 'KOVALAR', name: 'ISOT PEPPER' },
  { package: 'KOVALAR', name: 'CHILI FLAKES' },
  { package: 'KOVALAR', name: 'CHILI POWDER' },
  { package: 'KOVALAR', name: 'SWEET PAPRIKA POWDER' },
  
  // XL PETLER (150-161)
  { package: 'XL PETLER', name: 'ISOT PEPPER' },
  { package: 'XL PETLER', name: 'CHILI FLAKES' },
  { package: 'XL PETLER', name: 'CHILI FLAKES EXTRA HOT' },
  { package: 'XL PETLER', name: 'CHILI POWDER' },
  { package: 'XL PETLER', name: 'SWEET PAPRIKA FLAKES' },
  { package: 'XL PETLER', name: 'SWEET PAPRIKA POWDER' },
  { package: 'XL PETLER', name: 'BLACK PEPPER GROUND' },
  { package: 'XL PETLER', name: 'BLACK PEPPER COARSE' },
  { package: 'XL PETLER', name: 'BLACK PEPPERCORNS' },
  { package: 'XL PETLER', name: 'CUMIN SEEDS' },
  { package: 'XL PETLER', name: 'CUMIN GROUND' },
  { package: 'XL PETLER', name: 'CORIANDER SEEDS' },
  
  // STANTLAR (162)
  { package: 'STANTLAR', name: 'STANDARD SPICE SHELF' },
  
  // BİTKİ ÇAYLARI (163-187)
  { package: 'BİTKİ ÇAYLARI', name: 'SAGE TEA' },
  { package: 'BİTKİ ÇAYLARI', name: 'LINDEN TEA' },
  { package: 'BİTKİ ÇAYLARI', name: 'ROSEMARY LEAVES' },
  { package: 'BİTKİ ÇAYLARI', name: 'CINNAMON STICKS' },
  { package: 'BİTKİ ÇAYLARI', name: 'BAY LEAF' },
  { package: 'BİTKİ ÇAYLARI', name: 'WILD THYME' },
  { package: 'BİTKİ ÇAYLARI', name: 'FLAXSEED' },
  { package: 'BİTKİ ÇAYLARI', name: 'ROSEHIP TEA' },
  { package: 'BİTKİ ÇAYLARI', name: 'MELISSA (LEMON BALM)' },
  { package: 'BİTKİ ÇAYLARI', name: 'HIBISCUS' },
  { package: 'BİTKİ ÇAYLARI', name: 'CHAMOMILE' },
  { package: 'BİTKİ ÇAYLARI', name: 'FENNEL' },
  { package: 'BİTKİ ÇAYLARI', name: 'GREEN TEA' },
  { package: 'BİTKİ ÇAYLARI', name: 'GINGER WHOLE' },
  { package: 'BİTKİ ÇAYLARI', name: 'TURMERIC WHOLE' },
  { package: 'BİTKİ ÇAYLARI', name: 'WINTER TEA' },
  { package: 'BİTKİ ÇAYLARI', name: 'FORM TEA' },
  { package: 'BİTKİ ÇAYLARI', name: 'LAVENDER' },
  { package: 'BİTKİ ÇAYLARI', name: 'YARROW' },
  { package: 'BİTKİ ÇAYLARI', name: 'ECHINACEA-BASIL' },
  { package: 'BİTKİ ÇAYLARI', name: 'ANISE SEEDS' },
  { package: 'BİTKİ ÇAYLARI', name: 'CHERRY STEM' },
  { package: 'BİTKİ ÇAYLARI', name: 'CHIA SEEDS' },
  { package: 'BİTKİ ÇAYLARI', name: 'ROSE BUDS' },
  { package: 'BİTKİ ÇAYLARI', name: 'PURPLE BASIL' },
] as const

async function replaceAllProducts() {
  try {
    console.log('🔄 Veritabanı bağlantısı kuruluyor...')
    const connection = await getConnection()
    console.log('✅ Veritabanı bağlantısı başarılı!')
    
    const productRepo = await getProductRepository()
    const orderItemRepo = await getOrderItemRepository()
    const dealerProductRepo = await getDealerProductRepository()
    
    // 1. Önce ilişkili kayıtları sil (foreign key kısıtları nedeniyle)
    console.log('🗑️  İlişkili kayıtlar siliniyor...')
    
    // Order items'ları sil (RESTRICT kısıtı var)
    await orderItemRepo
      .createQueryBuilder()
      .delete()
      .from('order_items')
      .where('1 = 1')
      .execute()
    console.log('  ✓ Order items silindi')
    
    // Dealer products'ları sil (CASCADE olacak ama önce silelim)
    await dealerProductRepo
      .createQueryBuilder()
      .delete()
      .from('dealer_products')
      .where('1 = 1')
      .execute()
    console.log('  ✓ Dealer products silindi')
    
    // 2. Şimdi tüm ürünleri sil
    console.log('🗑️  Tüm mevcut ürünler siliniyor...')
    await productRepo
      .createQueryBuilder()
      .delete()
      .from('products')
      .where('1 = 1')
      .execute()
    console.log(`✅ Tüm ürünler silindi`)
    
    // 2. Yeni ürünleri ekle
    console.log(`📦 ${PRODUCTS_DATA.length} yeni ürün ekleniyor...`)
    const createdProducts = []
    const errors = []

    for (let i = 0; i < PRODUCTS_DATA.length; i++) {
      const productData = PRODUCTS_DATA[i]
      const baseName = productData.name
      const packageType = productData.package
      const volume = (productData as any).volume || ''
      
      // Ürün adını oluştur (volume varsa ekle)
      const fullName = volume ? `${baseName} ${volume}` : baseName
      
      // Slug oluştur
      let slug = createSlug(`${fullName} ${packageType}`)
      
      // SKU oluştur (benzersiz olması için)
      const sku = `PROD-${String(i + 1).padStart(3, '0')}-${createSlug(packageType).substring(0, 3).toUpperCase()}`
      
      // Slug'un benzersiz olduğundan emin ol
      let uniqueSlug = slug
      let counter = 1
      while (true) {
        const existing = await productRepo.findOne({ where: { slug: uniqueSlug } })
        if (!existing) break
        uniqueSlug = `${slug}-${counter}`
        counter++
      }

      try {
        const product = productRepo.create({
          name: fullName,
          slug: uniqueSlug,
          description: `${fullName} - ${packageType}`,
          shortDescription: packageType,
          sku,
          price: 0, // Varsayılan fiyat, sonra güncellenebilir
          stock: 0,
          trackStock: true,
          images: [],
          isActive: true,
          isFeatured: false,
          unit: volume ? 'ml' : 'kg',
        })

        const savedProduct = await productRepo.save(product)
        createdProducts.push(savedProduct)
        
        if ((i + 1) % 10 === 0) {
          console.log(`  ✓ ${i + 1}/${PRODUCTS_DATA.length} ürün eklendi...`)
        }
      } catch (error: any) {
        errors.push({
          product: fullName,
          error: error.message,
        })
        console.error(`  ✗ Hata: ${fullName} - ${error.message}`)
      }
    }

    console.log('\n✅ İşlem tamamlandı!')
    console.log(`📊 Özet:`)
    console.log(`   - Eklenen: ${createdProducts.length}`)
    console.log(`   - Hatalar: ${errors.length}`)
    
    if (errors.length > 0) {
      console.log('\n⚠️  Hata Detayları:')
      errors.forEach((err, idx) => {
        console.log(`   ${idx + 1}. ${err.product}: ${err.error}`)
      })
    }
    
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
replaceAllProducts()

