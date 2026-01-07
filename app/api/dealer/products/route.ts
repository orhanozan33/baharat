import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getDealerRepository, getProductRepository, getDealerProductRepository } from '@/lib/db'
import { extractAuthToken, verifyToken } from '@/lib/auth'
import { Like, In } from 'typeorm'

export async function GET(req: NextRequest) {
  const token = extractAuthToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'DEALER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dealerRepo = await getDealerRepository()
    const productRepo = await getProductRepository()
    const dealerProductRepo = await getDealerProductRepository()

    const dealer = await dealerRepo.findOne({
      where: { userId: payload.userId },
    })

    if (!dealer || !dealer.isActive) {
      return NextResponse.json(
        { error: 'Dealer not found or inactive' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Dealer'ın aktif dealer product'larını getir
    const dealerProducts = await dealerProductRepo.find({
      where: {
        dealerId: dealer.id,
        isActive: true,
      },
      relations: ['product', 'product.category'],
    })

    // Product ID'leri al
    const productIds = dealerProducts.map((dp) => dp.productId)

    if (productIds.length === 0) {
      return NextResponse.json({
        products: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      })
    }

    // Query builder oluştur
    const queryBuilder = productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id IN (:...productIds)', { productIds })
      .andWhere('product.isActive = :isActive', { isActive: true })

    if (category) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId: category })
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search) OR LOWER(product.sku) LIKE LOWER(:search))',
        { search: `%${search}%` }
      )
    }

    queryBuilder
      .orderBy('product.isFeatured', 'DESC')
      .addOrderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit)

    const [products, total] = await queryBuilder.getManyAndCount()

    // Dealer fiyatları ile birleştir
    const dealerProductMap = new Map(
      dealerProducts.map((dp) => [dp.productId, dp])
    )

    const productsWithDealerPrices = products.map((product: any) => {
      const dealerProduct = dealerProductMap.get(product.id)
      let finalPrice = product.price

      if (dealerProduct) {
        finalPrice = dealerProduct.price
        if (dealerProduct.discountRate > 0) {
          finalPrice = finalPrice * (1 - dealerProduct.discountRate / 100)
        }
      }

      return {
        ...product,
        price: finalPrice,
        originalPrice: product.price,
        dealerDiscount: dealerProduct?.discountRate || 0,
      }
    })

    return NextResponse.json({
      products: productsWithDealerPrices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get dealer products error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
