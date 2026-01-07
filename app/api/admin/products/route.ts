import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getProductRepository, getCategoryRepository } from '@/lib/db'
import { extractAuthToken, verifyToken } from '@/lib/auth'
import { serializeProduct } from '@/lib/serialize'

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
    const existing = await productRepo.findOne({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Product with this slug already exists' },
        { status: 400 }
      )
    }

    // Category'yi getir
    let category = null
    if (categoryId) {
      const categoryRepo = await getCategoryRepository()
      category = await categoryRepo.findOne({ where: { id: categoryId } })
    }

    // Yeni ürün oluştur
    const productData: any = {
      name,
      slug,
      description: description || '',
      shortDescription: shortDescription || '',
      sku,
      price: parseFloat(price),
      comparePrice: comparePrice ? parseFloat(comparePrice) : null,
      stock: parseInt(stock) || 0,
      trackStock: trackStock !== undefined ? trackStock : true,
      images: Array.isArray(images) && images.length > 0 
        ? images.slice(0, 5) // Maksimum 5 görsel
        : (images ? [images].slice(0, 5) : []),
      isActive: isActive !== undefined ? isActive : true,
      isFeatured: isFeatured !== undefined ? isFeatured : false,
      unit: unit || 'g',
      weight: weight ? parseFloat(weight) : null,
      baseName: baseName || null,
    }

    if (category) {
      productData.category = category
    }

    const product = productRepo.create(productData)
    const savedProduct = await productRepo.save(product)

    // İlişkilerle birlikte getir
    const productWithCategory = await productRepo.findOne({
      where: { id: (savedProduct as any).id },
      relations: ['category'],
    })

    return NextResponse.json(
      { product: serializeProduct(productWithCategory) },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const token = extractAuthToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit
    const search = searchParams.get('search')

    const productRepo = await getProductRepository()

    const queryBuilder = productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')

    if (search) {
      queryBuilder.where(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.sku) LIKE LOWER(:search))',
        { search: `%${search}%` }
      )
    }

    queryBuilder
      .orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit)

    const [products, total] = await queryBuilder.getManyAndCount()

    return NextResponse.json({
      products: products.map((p) => serializeProduct(p)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
