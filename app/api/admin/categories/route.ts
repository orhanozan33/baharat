// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// Entity'leri import et - metadata yüklenmesi için
import { Category } from '@/entities/Category'
void Category

import { NextRequest, NextResponse } from 'next/server'
import { getCategoryRepository } from '@/lib/db'
import { checkAdmin } from '@/lib/auth-helpers'
import { serializeCategory, serializeCategories } from '@/lib/serialize'

export async function POST(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
    try {
      const body = await req.json()
      const {
        name,
        slug,
        description,
        image,
        parentId,
        order,
        isActive,
      } = body

      const categoryRepo = await getCategoryRepository()
      
      // Slug'un benzersiz olduğunu kontrol et
      const existing = await categoryRepo.findOne({
        where: { slug },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 400 }
        )
      }

      const category = categoryRepo.create({
        name,
        slug,
        description,
        image,
        parentId: parentId || null,
        order: order || 0,
        isActive: isActive !== undefined ? isActive : true,
      })

      const savedCategory = await categoryRepo.save(category)

      // Relations ile tekrar yükle
      const categoryWithRelations = await categoryRepo.findOne({
        where: { id: savedCategory.id },
        relations: ['parent', 'children'],
      })

      return NextResponse.json({ category: serializeCategory(categoryWithRelations!) }, { status: 201 })
    } catch (error: any) {
      console.error('Create category error:', error)
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      )
    }
}

export async function GET(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
    try {
      const categoryRepo = await getCategoryRepository()
      const categories = await categoryRepo.find({
        relations: ['parent', 'children'],
        order: {
          order: 'ASC',
          name: 'ASC',
        },
      })

      return NextResponse.json({ categories: serializeCategories(categories) })
    } catch (error) {
      console.error('Get categories error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
}

