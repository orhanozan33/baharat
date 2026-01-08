// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// Entity'leri direkt import et - metadata yüklenmesi için
import { Category } from '@/src/database/entities/Category'
import { Product } from '@/src/database/entities/Product'
void Category
void Product

// Repositories ve typeorm'u import et
import '@/src/database/repositories'
import '@/src/database/typeorm'

import { NextRequest, NextResponse } from 'next/server'
import { connectDB, getCategoryRepository } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Database bağlantısını kur (metadata yüklendikten sonra)
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const includeProducts = searchParams.get('includeProducts') === 'true'

    const categoryRepo = await getCategoryRepository()

    const categories = await categoryRepo.find({
      where: {
        isActive: true,
      },
      relations: includeProducts ? ['parent', 'children', 'products'] : ['parent', 'children'],
      order: {
        order: 'ASC',
        name: 'ASC',
      },
    })

    // Format products if included
    const formattedCategories = categories.map((category: any) => ({
      ...category,
      parent: category.parent ? {
        id: category.parent.id,
        name: category.parent.name,
        slug: category.parent.slug,
      } : null,
      children: (category.children || []).map((child: any) => ({
        id: child.id,
        name: child.name,
        slug: child.slug,
        image: child.image,
      })),
      ...(includeProducts && category.products && {
        products: (category.products || []).slice(0, 10).map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          images: product.images,
        })),
      }),
    }))

    return NextResponse.json({ categories: formattedCategories })
  } catch (error: any) {
    console.error('Get categories error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
