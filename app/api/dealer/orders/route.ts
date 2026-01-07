import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkDealer } from '@/lib/auth-helpers'
import { OrderStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const auth = await checkDealer(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
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
    const status = searchParams.get('status') as OrderStatus | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const where: any = {
      dealerId: dealer.id,
    }

    if (status) {
      where.status = status
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get dealer orders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const auth = await checkDealer(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const dealer = await prisma.dealer.findUnique({
      where: { userId: auth.userId },
    })

    if (!dealer || !dealer.isActive) {
      return NextResponse.json(
        { error: 'Dealer not found or inactive' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      items,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      billingName,
      billingAddress,
      billingTaxNumber,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    // Ürünleri kontrol et ve dealer fiyatlarını hesapla
    let subtotal = 0
    const orderItems = []

    for (const item of items) {
      const dealerProduct = await prisma.dealerProduct.findUnique({
        where: {
          dealerId_productId: {
            dealerId: dealer.id,
            productId: item.productId,
          },
          isActive: true,
        },
        include: {
          product: true,
        },
      })

      if (!dealerProduct || !dealerProduct.product.isActive) {
        return NextResponse.json(
          { error: `Product ${item.productId} not available for dealer` },
          { status: 400 }
        )
      }

      const product = dealerProduct.product

      if (product.trackStock && product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product.name}` },
          { status: 400 }
        )
      }

      let price = dealerProduct.price
      if (dealerProduct.discountRate > 0) {
        price = price * (1 - dealerProduct.discountRate / 100)
      }

      const itemTotal = price * item.quantity
      subtotal += itemTotal

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price,
        total: itemTotal,
        sku: product.sku,
      })
    }

    const orderNumber = `DEALER-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: auth.userId,
        dealerId: dealer.id,
        status: OrderStatus.PENDING,
        subtotal,
        tax: subtotal * 0.18,
        shipping: 0,
        discount: 0,
        total: subtotal * 1.18,
        shippingName,
        shippingPhone,
        shippingAddress,
        shippingCity,
        shippingPostalCode: shippingPostalCode || null,
        billingName: billingName || shippingName,
        billingAddress: billingAddress || shippingAddress,
        billingTaxNumber: billingTaxNumber || dealer.taxNumber || null,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    })

    // Stok güncelle
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    return NextResponse.json({ order }, { status: 201 })
  } catch (error: any) {
    console.error('Create dealer order error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


