// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// Entity'leri import et - metadata yüklenmesi için
import { Category } from '@/entities/Category'
import { Product } from '@/entities/Product'
void Category
void Product

import { NextRequest, NextResponse } from 'next/server'
import { getCategoryRepository } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const categoryRepo = await getCategoryRepository()

    const category = await categoryRepo.findOne({
      where: {
        slug,
        isActive: true,
      },
      relations: ['parent', 'children', 'products'],
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Format relations
    const formattedCategory = {
      ...category,
      parent: category.parent ? {
        id: category.parent.id,
        name: category.parent.name,
        slug: category.parent.slug,
      } : null,
      children: category.children?.filter((c: any) => c.isActive) || [],
      products: category.products?.filter((p: any) => p.isActive).sort((a: any, b: any) => {
        if (a.isFeatured !== b.isFeatured) {
          return a.isFeatured ? -1 : 1
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }) || [],
    }

    return NextResponse.json({ category: formattedCategory })
  } catch (error) {
    console.error('Get category error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
