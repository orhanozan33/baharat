// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// Entity'leri import et - metadata yüklenmesi için
import { Category } from '@/entities/Category'
void Category

import { NextRequest, NextResponse } from 'next/server'
import { getCategoryRepository } from '@/lib/db'
import { checkAdmin } from '@/lib/auth-helpers'
import { serializeCategory } from '@/lib/serialize'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const categoryRepo = await getCategoryRepository()
    
    const category = await categoryRepo.findOne({
      where: { id },
      relations: ['parent', 'children'],
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ category: serializeCategory(category) })
  } catch (error: any) {
    console.error('Get category error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
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
    
    // Mevcut kategoriyi bul
    const existingCategory = await categoryRepo.findOne({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Slug kontrolü (eğer değiştiriliyorsa)
    if (slug && slug !== existingCategory.slug) {
      const slugExists = await categoryRepo.findOne({
        where: { slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Category with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Güncelleme
    if (name) existingCategory.name = name
    if (slug) existingCategory.slug = slug
    if (description !== undefined) existingCategory.description = description
    if (image !== undefined) existingCategory.image = image
    if (parentId !== undefined) existingCategory.parentId = parentId || null
    if (order !== undefined) existingCategory.order = order
    if (isActive !== undefined) existingCategory.isActive = isActive

    const updatedCategory = await categoryRepo.save(existingCategory)

    // Relations ile tekrar yükle
    const category = await categoryRepo.findOne({
      where: { id: updatedCategory.id },
      relations: ['parent', 'children'],
    })

    return NextResponse.json({ category: serializeCategory(category!) })
  } catch (error: any) {
    console.error('Update category error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const categoryRepo = await getCategoryRepository()
    
    const category = await categoryRepo.findOne({
      where: { id },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    await categoryRepo.remove(category)

    return NextResponse.json({ message: 'Category deleted successfully' })
  } catch (error: any) {
    console.error('Delete category error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
