import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getProductRepository, getCategoryRepository } from '@/lib/db'
import { extractAuthToken, verifyToken } from '@/lib/auth'
import { serializeProduct } from '@/lib/serialize'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = extractAuthToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const productRepo = await getProductRepository()
    
    const product = await productRepo.findOne({
      where: { id },
      relations: ['category'],
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product: serializeProduct(product) })
  } catch (error: any) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = extractAuthToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const {
      name,
      slug,
      description,
      shortDescription,
      sku,
      price,
      comparePrice,
      stock,
      trackStock,
      images,
      isActive,
      isFeatured,
      categoryId,
      unit,
      weight,
      baseName,
    } = body

    const productRepo = await getProductRepository()

    // Slug'un benzersiz olduğunu kontrol et
    if (slug) {
      const existing = await productRepo.findOne({
        where: { slug },
      })

      if (existing && existing.id !== id) {
        return NextResponse.json(
          { error: 'Product with this slug already exists' },
          { status: 400 }
        )
      }
    }

    // Mevcut ürünü getir
    const existingProduct = await productRepo.findOne({
      where: { id },
      relations: ['category'],
    })

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Ürünü güncelle - save metodu kullanarak ilişkileri de güncelleyebiliriz
    if (name !== undefined) existingProduct.name = name
    if (slug !== undefined) existingProduct.slug = slug
    if (description !== undefined) existingProduct.description = description
    if (shortDescription !== undefined) existingProduct.shortDescription = shortDescription
    if (sku !== undefined) existingProduct.sku = sku
    if (price !== undefined) existingProduct.price = parseFloat(price)
    if (comparePrice !== undefined) existingProduct.comparePrice = comparePrice ? parseFloat(comparePrice) : null
    if (stock !== undefined) existingProduct.stock = parseInt(stock)
    if (trackStock !== undefined) existingProduct.trackStock = trackStock
    if (images !== undefined) {
      // Maksimum 5 görsel kontrolü
      let imagesArray: string[] = []
      if (Array.isArray(images)) {
        imagesArray = images.slice(0, 5) // İlk 5 görseli al
      } else if (images) {
        imagesArray = [images].slice(0, 5)
      }
      
      existingProduct.images = imagesArray
      console.log('Updating product images:', existingProduct.images)
    }
    if (isActive !== undefined) existingProduct.isActive = isActive
    if (isFeatured !== undefined) existingProduct.isFeatured = isFeatured
    if (unit !== undefined) existingProduct.unit = unit
    if (baseName !== undefined) existingProduct.baseName = baseName || null
    if (weight !== undefined) {
      // Weight boş veya null ise null yap, değilse parseFloat ile dönüştür
      // 0 değeri de geçerli bir weight olabilir (örn: 0.5g), bu yüzden 0'ı null yapmıyoruz
      const weightValue = weight === '' || weight === null || weight === undefined 
        ? null 
        : parseFloat(weight)
      existingProduct.weight = isNaN(weightValue) ? null : weightValue
    }
    if (categoryId !== undefined) {
      if (categoryId === '' || categoryId === null) {
        existingProduct.category = null
        existingProduct.categoryId = null
      } else {
        const categoryRepo = await getCategoryRepository()
        const category = await categoryRepo.findOne({ where: { id: categoryId } })
        if (category) {
          existingProduct.category = category
          existingProduct.categoryId = categoryId
        }
      }
    }

    await productRepo.save(existingProduct)

    // Güncellenmiş ürünü getir
    const updatedProduct = await productRepo.findOne({
      where: { id },
      relations: ['category'],
    })

    return NextResponse.json({ product: serializeProduct(updatedProduct) })
  } catch (error: any) {
    console.error('Update product error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = extractAuthToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const productRepo = await getProductRepository()
    
    await productRepo.delete(id)

    return NextResponse.json({ message: 'Product deleted successfully' })
  } catch (error: any) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
