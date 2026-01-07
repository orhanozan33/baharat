import 'reflect-metadata'
import { getProductRepository } from '../lib/db'

// product-data.ts'den Isot Pepper verileri
const isotPepperVariants = [
  { weight: 50, price: 0.70, package: 'ZİPLİ AMBALAJ', unit: 'g', stock: 1000 },
  { weight: 150, price: 1.42, package: 'ORTA PETLER', unit: 'g', stock: 1000 },
  { weight: 500, price: 3.81, package: 'BÜYÜK PETLER', unit: 'g', stock: 1000 },
  { weight: 2000, price: 13.49, package: 'XL PETLER', unit: 'g', stock: 1000 },
]

async function fixIsotPepperProducts() {
  try {
    const productRepo = await getProductRepository()
    
    // Isot Pepper ürünlerini bul
    const allProducts = await productRepo.find({
      where: {
        isActive: true,
      },
    })
    
    const isotPepperProducts = allProducts.filter((p: any) => 
      p.name.toLowerCase().includes('isot pepper') || 
      p.slug.includes('isot-pepper')
    )
    
    console.log(`Bulunan Isot Pepper ürünleri: ${isotPepperProducts.length}`)
    
    for (const product of isotPepperProducts) {
      console.log(`\nİşleniyor: ${product.name} (${product.slug})`)
      
      // Slug'a göre hangi variant olduğunu belirle
      let variant = null
      if (product.slug.includes('zipli-ambalaj')) {
        variant = isotPepperVariants[0] // 50g
      } else if (product.slug.includes('orta-petler')) {
        variant = isotPepperVariants[1] // 150g
      } else if (product.slug.includes('buyuk-petler')) {
        variant = isotPepperVariants[2] // 500g
      } else if (product.slug.includes('xl-petler')) {
        variant = isotPepperVariants[3] // 2000g
      }
      
      if (variant) {
        product.weight = variant.weight
        product.price = variant.price
        product.stock = variant.stock
        product.unit = variant.unit
        product.baseName = 'Isot Pepper'
        
        await productRepo.save(product)
        console.log(`✓ Güncellendi: ${variant.weight}${variant.unit} - ${variant.price} CAD - Stok: ${variant.stock}${variant.unit}`)
      } else {
        console.log(`⚠ Variant bulunamadı, atlandı`)
      }
    }
    
    console.log('\n✅ Tüm Isot Pepper ürünleri güncellendi!')
    process.exit(0)
  } catch (error) {
    console.error('Hata:', error)
    process.exit(1)
  }
}

fixIsotPepperProducts()

