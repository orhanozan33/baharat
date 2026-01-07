import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkDealer } from '@/lib/auth-helpers'

export async function GET(req: NextRequest) {
  const auth = await checkDealer(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Dealer'ı bul
    const dealer = await prisma.dealer.findUnique({
      where: { userId: auth.userId },
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

    // Dealer'ın özel fiyatları ile ürünleri getir
    const where: any = {
      isActive: true,
      dealerProducts: {
        some: {
          dealerId: dealer.id,
          isActive: true,
        },
      },
    }

    if (category) {
      where.categoryId = category
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          dealerProducts: {
            where: {
              dealerId: dealer.id,
              isActive: true,
            },
            select: {
              price: true,
              discountRate: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    // Fiyatları dealer fiyatları ile değiştir
    const productsWithDealerPrices = products.map((product) => {
      const dealerProduct = product.dealerProducts[0]
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


