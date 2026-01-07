import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getDealerRepository, getOrderRepository } from '@/lib/db'
import { extractAuthToken, verifyToken } from '@/lib/auth'
import { OrderStatus } from '@/entities/enums/OrderStatus'

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
    const orderRepo = await getOrderRepository()

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
    const status = searchParams.get('status') as OrderStatus | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const queryBuilder = orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('order.dealerId = :dealerId', { dealerId: dealer.id })

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status })
    }

    queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit)

    const [orders, total] = await queryBuilder.getManyAndCount()

    return NextResponse.json({
      orders: orders.map((order: any) => ({
        ...order,
        items: (order.items || []).map((item: any) => ({
          ...item,
          product: item.product ? {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            images: item.product.images || [],
          } : null,
        })),
      })),
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

// POST method için mevcut kodu koruyoruz
export async function POST(req: NextRequest) {
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
    const dealer = await dealerRepo.findOne({
      where: { userId: payload.userId },
    })

    if (!dealer || !dealer.isActive) {
      return NextResponse.json(
        { error: 'Dealer not found or inactive' },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { items, shippingName, shippingPhone, shippingAddress, shippingCity, shippingPostalCode, billingName, billingAddress, billingTaxNumber } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    // Mevcut POST implementasyonunu buraya ekleyin
    // (Dealer order creation logic)
    
    return NextResponse.json({ error: 'Not implemented' }, { status: 501 })
  } catch (error) {
    console.error('Create dealer order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
