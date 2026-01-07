import 'reflect-metadata'
import { getProductRepository } from '../lib/db'
import { extractWeightFromName } from '../lib/utils'

async function checkProductData() {
  try {
    const productRepo = await getProductRepository()
    
    // Isot Pepper Zipli Ambalaj ürününü bul
    const product = await productRepo.findOne({
      where: {
        slug: 'isot-pepper-zipli-ambalaj',
      },
    })
    
    if (!product) {
      console.log('Ürün bulunamadı: isot-pepper-zipli-ambalaj')
      return
    }
    
    console.log('=== ÜRÜN BİLGİLERİ ===')
    console.log('ID:', product.id)
    console.log('Name:', product.name)
    console.log('Slug:', product.slug)
    console.log('Price:', product.price)
    console.log('Stock:', product.stock)
    console.log('Unit:', product.unit)
    console.log('Weight:', product.weight)
    console.log('BaseName:', product.baseName)
    
    // Weight yoksa ürün adından çıkar
    if (!product.weight || product.weight === 0) {
      const weightInfo = extractWeightFromName(product.name)
      if (weightInfo) {
        console.log('\nÜrün adından çıkarılan weight:', weightInfo)
      } else {
        const slugWeightInfo = extractWeightFromName(product.slug)
        if (slugWeightInfo) {
          console.log('\nSlug\'dan çıkarılan weight:', slugWeightInfo)
        }
      }
    }
    
    // Aynı baseName'e sahip diğer ürünleri bul
    const baseName = product.baseName || 'Isot Pepper'
    const variants = await productRepo.find({
      where: {
        isActive: true,
      },
    })
    
    const relatedProducts = variants.filter((p: any) => {
      const pBaseName = p.baseName || 'Isot Pepper'
      return pBaseName.toLowerCase().includes('isot pepper') || 
             p.name.toLowerCase().includes('isot pepper')
    })
    
    console.log('\n=== İLGİLİ ÜRÜNLER (Variants) ===')
    relatedProducts.forEach((p: any) => {
      console.log(`- ${p.name} | Slug: ${p.slug} | Weight: ${p.weight || 'N/A'} | Unit: ${p.unit || 'N/A'} | Price: ${p.price} | Stock: ${p.stock}`)
    })
    
    process.exit(0)
  } catch (error) {
    console.error('Hata:', error)
    process.exit(1)
  }
}

checkProductData()

