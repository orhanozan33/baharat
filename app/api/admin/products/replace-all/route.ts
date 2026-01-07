import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getProductRepository, getOrderItemRepository, getDealerProductRepository } from '@/lib/db'
import { extractAuthToken, verifyToken } from '@/lib/auth'
import { createSlug } from '@/lib/utils'
import { PRODUCT_GROUPS } from '../product-data'

export async function POST(req: NextRequest) {
  const token = extractAuthToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const productRepo = await getProductRepository()
    const orderItemRepo = await getOrderItemRepository()
    const dealerProductRepo = await getDealerProductRepository()
    
    // 1. Önce foreign key kısıtları nedeniyle ilişkili kayıtları sil
    console.log('Deleting related records...')
    await orderItemRepo.createQueryBuilder().delete().from('order_items').execute()
    await dealerProductRepo.createQueryBuilder().delete().from('dealer_products').execute()
    
    // 2. Tüm ürünleri sil
    console.log('Deleting all existing products...')
    await productRepo
      .createQueryBuilder()
      .delete()
      .from('products')
      .where('1 = 1')
      .execute()
    console.log('All products deleted')
    
    // 3. Yeni ürünleri gruplu şekilde ekle
    console.log('Creating new products with variants...')
    const createdProducts = []
    const errors = []
    let productCounter = 1

    for (const group of PRODUCT_GROUPS) {
      const baseName = group.baseName
      const normalizedBaseName = baseName.toUpperCase().trim()
      
      for (const variant of group.variants) {
        // Ürün adını oluştur (gramaj bilgisi ile)
        const weightDisplay = variant.unit === 'ml' 
          ? `${variant.weight}${variant.unit}` 
          : `${variant.weight}g`
        
        const fullName = `${baseName} ${weightDisplay}`
        
        // Slug oluştur
        let slug = createSlug(`${baseName} ${weightDisplay}`)
        
        // SKU oluştur
        const sku = `PROD-${String(productCounter).padStart(4, '0')}-${createSlug(variant.package).substring(0, 3).toUpperCase()}`
        
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
            baseName: normalizedBaseName, // Gruplama için
            slug: uniqueSlug,
            description: `${baseName} - ${variant.package} - ${weightDisplay}`,
            shortDescription: `${variant.package} - ${weightDisplay}`,
            sku,
            price: variant.price,
            stock: variant.stock || 1000, // Varsayılan 1000g stok
            trackStock: true,
            weight: variant.weight, // Gramaj bilgisi (g veya ml)
            images: [],
            isActive: true,
            isFeatured: false,
            unit: variant.unit === 'ml' ? 'ml' : 'g', // Sadece g veya ml
          })

          const savedProduct = await productRepo.save(product)
          createdProducts.push(savedProduct)
          productCounter++
        } catch (error: any) {
          errors.push({
            product: fullName,
            error: error.message,
          })
          console.error(`Error creating product ${fullName}:`, error)
        }
      }
    }

    return NextResponse.json({
      message: 'Products replaced successfully with variants',
      created: createdProducts.length,
      errors: errors.length,
      errorDetails: errors,
      groups: PRODUCT_GROUPS.length,
    })
  } catch (error: any) {
    console.error('Replace products error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
