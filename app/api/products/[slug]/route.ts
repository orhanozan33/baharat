// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// Entity'leri import et - metadata yüklenmesi için
import { Product } from '@/entities/Product'
import { Category } from '@/entities/Category'
void Product
void Category

import { NextRequest, NextResponse } from 'next/server'
import { getProductRepository } from '@/lib/db'
import { extractBaseProductName, isSameBaseProduct, extractWeightFromName } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const productRepo = await getProductRepository()

    const product = await productRepo.findOne({
      where: {
        slug,
        isActive: true,
      },
      relations: ['category'],
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Aynı temel isme sahip diğer ürünleri bul (gramaj seçenekleri için)
    let variants: any[] = []
    
    // Önce baseName kontrolü yap, yoksa ürün adından çıkar
    const productName = product.name || ''
    const productSlug = product.slug || ''
    const currentBaseName = product.baseName || (productName ? extractBaseProductName(productName) : '')
    
    if (currentBaseName) {
      try {
        // Tüm aktif ürünleri al
        const allProducts = await productRepo.find({
          where: {
            isActive: true,
          },
        })
        
        // Aynı temel isme sahip ürünleri filtrele (mevcut ürün dahil)
        const variantProducts = allProducts.filter((p: any) => {
          try {
            const pName = p.name || ''
            const pBaseName = p.baseName || (pName ? extractBaseProductName(pName) : '')
            return pBaseName && isSameBaseProduct(currentBaseName, pBaseName)
          } catch (err) {
            console.error('Error filtering variant product:', err)
            return false
          }
        })
        
        // Stok kontrolü - sadece stokta olanları göster ve map et
        variants = variantProducts
          .filter((p: any) => (p.stock || 0) > 0)
          .map((p: any) => {
            try {
              // Weight yoksa ürün adından çıkar
              let weight = p.weight
              let unit = p.unit || 'g'
              
              if (!weight || weight === 0 || isNaN(weight)) {
                // Önce ürün adından çıkar
                const pName = p.name || ''
                const pSlug = p.slug || ''
                const weightInfo = pName ? extractWeightFromName(pName) : null
                if (weightInfo) {
                  weight = weightInfo.weight
                  unit = weightInfo.unit
                } else if (pSlug) {
                  // Ürün adından bulunamadıysa slug'dan dene
                  const slugWeightInfo = extractWeightFromName(pSlug)
                  if (slugWeightInfo) {
                    weight = slugWeightInfo.weight
                    unit = slugWeightInfo.unit
                  }
                }
              }
              
              return {
                id: p.id,
                slug: p.slug || '',
                weight: weight || 0,
                price: Number(p.price || 0),
                comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
                stock: Number(p.stock || 0),
                unit: unit,
                name: p.name || '',
              }
            } catch (err) {
              console.error('Error mapping variant product:', err)
              return null
            }
          })
          .filter((v: any) => v !== null)
        
        // Weight'e göre sırala
        variants.sort((a, b) => (a.weight || 0) - (b.weight || 0))
      } catch (err) {
        console.error('Error fetching variants:', err)
        variants = []
      }
    }

    // Mevcut ürünün weight bilgisini kontrol et ve yoksa ürün adından çıkar
    let productWeight = product.weight
    let productUnit = product.unit || 'g'
    
    try {
      if (!productWeight || productWeight === 0 || isNaN(productWeight)) {
        const weightInfo = productName ? extractWeightFromName(productName) : null
        if (weightInfo) {
          productWeight = weightInfo.weight
          productUnit = weightInfo.unit
        } else if (productSlug) {
          const slugWeightInfo = extractWeightFromName(productSlug)
          if (slugWeightInfo) {
            productWeight = slugWeightInfo.weight
            productUnit = slugWeightInfo.unit
          }
        }
      }
    } catch (err) {
      console.error('Error extracting product weight:', err)
      productWeight = productWeight || 0
      productUnit = productUnit || 'g'
    }

    // Format category
    const formattedProduct = {
      id: product.id,
      name: product.name || '',
      slug: product.slug || '',
      price: Number(product.price || 0),
      comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
      images: Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? product.images.split(',').filter((img: string) => img.trim()) : []),
      stock: Number(product.stock || 0),
      isFeatured: Boolean(product.isFeatured),
      isActive: Boolean(product.isActive),
      sku: product.sku || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      unit: productUnit,
      weight: productWeight || 0,
      baseName: product.baseName || null,
      trackStock: product.trackStock !== undefined ? Boolean(product.trackStock) : true,
      category: product.category ? {
        id: product.category.id,
        name: product.category.name || '',
        slug: product.category.slug || '',
      } : null,
      variants, // Gramaj seçenekleri
    }

    return NextResponse.json({ product: formattedProduct })
  } catch (error: any) {
    console.error('Get product error:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { error: 'Internal server error', details: process.env.NODE_ENV === 'development' ? error?.message : undefined },
      { status: 500 }
    )
  }
}
