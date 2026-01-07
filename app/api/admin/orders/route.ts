import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getOrderRepository } from '@/lib/db'
import { extractAuthToken, verifyToken } from '@/lib/auth'
import { OrderStatus } from '@/entities/enums/OrderStatus'
import { serializeOrders } from '@/lib/serialize'
import { Like } from 'typeorm'

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
    const status = searchParams.get('status') as OrderStatus | null
    const dealerId = searchParams.get('dealerId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const orderRepo = await getOrderRepository()

    const queryBuilder = orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.dealer', 'dealer')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')

    if (dealerId) {
      // Cari hesap için: 
      // 1. Admin tarafından oluşturulan siparişler (ADMIN-SALE-% veya DEALER-SALE-%)
      // 2. Kullanıcı siparişleri (ORD-% ile başlayan tüm siparişler)
      queryBuilder.where('order.dealerId = :dealerId', { dealerId })
      queryBuilder.andWhere(
        '(order.orderNumber LIKE :adminPrefix OR order.orderNumber LIKE :dealerPrefix OR order.orderNumber LIKE :userPrefix)',
        { 
          adminPrefix: 'ADMIN-SALE-%', 
          dealerPrefix: 'DEALER-SALE-%',
          userPrefix: 'ORD-%'
        }
      )
      
      if (status) {
        queryBuilder.andWhere('order.status = :status', { status })
      }
    } else {
      // Genel siparişler için, bayi siparişlerini hariç tut (kullanıcı siparişleri göster)
      queryBuilder.where(
        '(order.orderNumber NOT LIKE :adminPrefix AND order.orderNumber NOT LIKE :dealerPrefix)',
        { adminPrefix: 'ADMIN-SALE-%', dealerPrefix: 'DEALER-SALE-%' }
      )
      
      if (status) {
        queryBuilder.andWhere('order.status = :status', { status })
      }
    }

    queryBuilder
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit)

    const [orders, total] = await queryBuilder.getManyAndCount()

    return NextResponse.json({
      orders: serializeOrders(orders),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
