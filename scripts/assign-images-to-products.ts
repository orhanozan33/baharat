import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'
import * as fs from 'fs'
import * as path from 'path'

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
import { createSlug } from '../lib/utils'

// Resim klasörü yolu - kullanıcı buraya kendi klasör yolunu yazabilir
let IMAGE_FOLDER_PATH = process.argv[2]

// Eğer yol verilmemişse, alternatif yolları dene
if (!IMAGE_FOLDER_PATH) {
  const possiblePaths = [
    'C:\\Users\\orhan\\OneDrive\\Masaüstü\\baharat',
    'C:\\Users\\orhan\\OneDrive\\Masaüstü\\BAHARTA',
    'C:\\Users\\orhan\\OneDrive\\Masaüstü\\baharat resim',
    path.join(process.cwd(), 'images'),
    path.join(process.cwd(), 'resimler'),
  ]
  
  for (const possiblePath of possiblePaths) {
    if (fs.existsSync(possiblePath)) {
      IMAGE_FOLDER_PATH = possiblePath
      break
    }
  }
}

// Destinasyon klasörü (public/uploads/products)
const DEST_FOLDER = resolve(process.cwd(), 'public', 'uploads', 'products')

async function assignImagesToProducts() {
  try {
    console.log('🔄 Veritabanı bağlantısı kuruluyor...')
    const connection = await getConnection()
    console.log('✅ Veritabanı bağlantısı başarılı!')
    
    // Resim klasörünü kontrol et
    if (!IMAGE_FOLDER_PATH || !fs.existsSync(IMAGE_FOLDER_PATH)) {
      console.error(`❌ Resim klasörü bulunamadı!`)
      console.log('\nLütfen resim klasörünün tam yolunu belirtin:')
      console.log('Kullanım: npm run assign-images "C:\\path\\to\\images"')
      console.log('\nÖrnek: npm run assign-images "C:\\Users\\orhan\\OneDrive\\Masaüstü\\baharat"')
      process.exit(1)
    }

    console.log(`📁 Resim klasörü: ${IMAGE_FOLDER_PATH}`)
    
    // Destinasyon klasörünü oluştur
    if (!fs.existsSync(DEST_FOLDER)) {
      fs.mkdirSync(DEST_FOLDER, { recursive: true })
      console.log(`📁 Destinasyon klasörü oluşturuldu: ${DEST_FOLDER}`)
    }

    // Resim dosyalarını oku
    const imageFiles = fs.readdirSync(IMAGE_FOLDER_PATH)
      .filter(file => {
        const ext = path.extname(file).toLowerCase()
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)
      })
      .map(file => ({
        name: file,
        path: path.join(IMAGE_FOLDER_PATH, file),
        ext: path.extname(file).toLowerCase()
      }))

    console.log(`📸 ${imageFiles.length} resim dosyası bulundu`)

    if (imageFiles.length === 0) {
      console.error('❌ Klasörde resim dosyası bulunamadı!')
      process.exit(1)
    }

    // Tüm ürünleri getir
    const productRepo = await getProductRepository()
    const products = await productRepo.find({
      order: { createdAt: 'ASC' }
    })

    console.log(`📦 ${products.length} ürün bulundu`)

    let assignedCount = 0
    let copiedCount = 0
    const usedImages: string[] = []

    // Her ürün için resim bul ve ata
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      
      // Ürün adından slug oluştur (resim eşleştirmesi için)
      const productSlug = createSlug(product.name)
      
      // Resim dosyasını bul (isim benzerliğine göre)
      let matchedImage = imageFiles.find(img => {
        const imgName = path.basename(img.name, img.ext).toLowerCase()
        const imgSlug = createSlug(imgName)
        
        // Tam eşleşme veya kısmi eşleşme
        return imgSlug.includes(productSlug) || 
               productSlug.includes(imgSlug) ||
               imgName.includes(productSlug.substring(0, 5)) ||
               productSlug.includes(imgName.substring(0, 5))
      })

      // Eşleşme bulunamazsa, kullanılmamış bir resim al
      if (!matchedImage && imageFiles.length > usedImages.length) {
        matchedImage = imageFiles.find(img => !usedImages.includes(img.path))
      }

      if (matchedImage && !usedImages.includes(matchedImage.path)) {
        try {
          // Yeni dosya adı oluştur (timestamp + random)
          const timestamp = Date.now()
          const random = Math.random().toString(36).substring(2, 9)
          const newFileName = `${timestamp}-${random}${matchedImage.ext}`
          const destPath = path.join(DEST_FOLDER, newFileName)

          // Dosyayı kopyala
          fs.copyFileSync(matchedImage.path, destPath)
          
          // Web path oluştur
          const webPath = `/uploads/products/${newFileName}`
          
          // Ürünü güncelle
          product.images = [webPath]
          await productRepo.save(product)
          
          usedImages.push(matchedImage.path)
          assignedCount++
          copiedCount++
          
          if ((i + 1) % 10 === 0) {
            console.log(`  ✓ ${i + 1}/${products.length} ürün işlendi...`)
          }
        } catch (error: any) {
          console.error(`  ✗ Hata (${product.name}): ${error.message}`)
        }
      } else {
        // Resim bulunamadı - mevcut resimlerden birini döngüsel olarak kullan
        if (imageFiles.length > 0) {
          // Döngüsel olarak resim seç (8 resim varsa, 189 ürün için döngüsel kullan)
          const imageIndex = i % imageFiles.length
          const availableImage = imageFiles[imageIndex]
          
          try {
            // Her ürün için yeni bir kopya oluştur (aynı resim farklı ürünlerde kullanılabilir)
            const timestamp = Date.now() + i // Her ürün için farklı timestamp
            const random = Math.random().toString(36).substring(2, 9)
            const newFileName = `${timestamp}-${random}${availableImage.ext}`
            const destPath = path.join(DEST_FOLDER, newFileName)

            fs.copyFileSync(availableImage.path, destPath)
            
            const webPath = `/uploads/products/${newFileName}`
            product.images = [webPath]
            await productRepo.save(product)
            
            assignedCount++
            copiedCount++
          } catch (error: any) {
            console.error(`  ✗ Hata (${product.name}): ${error.message}`)
          }
        }
      }
    }

    console.log('\n✅ İşlem tamamlandı!')
    console.log(`📊 Özet:`)
    console.log(`   - İşlenen ürün: ${products.length}`)
    console.log(`   - Resim atanan: ${assignedCount}`)
    console.log(`   - Kopyalanan resim: ${copiedCount}`)
    
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
assignImagesToProducts()

