import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getDealerRepository, getOrderRepository, getDealerProductRepository } from '@/lib/db'
import { extractAuthToken, verifyToken } from '@/lib/auth'
import { OrderStatus } from '@/entities/enums/OrderStatus'
import { Not } from 'typeorm'

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
    const dealerProductRepo = await getDealerProductRepository()

    const dealer = await dealerRepo.findOne({
      where: { userId: payload.userId },
      relations: ['user'],
    })

    if (!dealer || !dealer.isActive) {
      return NextResponse.json(
        { error: 'Dealer not found or inactive' },
        { status: 403 }
      )
    }

    const [
      totalOrders,
      pendingOrders,
      totalRevenueResult,
      recentOrders,
      totalProducts,
    ] = await Promise.all([
      orderRepo.count({ where: { dealerId: dealer.id } }),
      orderRepo.count({
        where: {
          dealerId: dealer.id,
          status: OrderStatus.PENDING,
        },
      }),
      orderRepo
        .createQueryBuilder('order')
        .select('SUM(order.total)', 'sum')
        .where('order.dealerId = :dealerId', { dealerId: dealer.id })
        .andWhere('order.status != :status', { status: OrderStatus.CANCELLED })
        .getRawOne(),
      orderRepo.find({
        where: { dealerId: dealer.id },
        take: 10,
        order: { createdAt: 'DESC' },
        relations: ['items', 'items.product'],
      }),
      dealerProductRepo.count({ where: { dealerId: dealer.id, isActive: true } }),
    ])

    return NextResponse.json({
      dealer: {
        id: dealer.id,
        companyName: dealer.companyName,
        discountRate: dealer.discountRate,
      },
      stats: {
        totalOrders,
        pendingOrders,
        totalRevenue: parseFloat(totalRevenueResult?.sum || '0') || 0,
        totalProducts,
      },
      recentOrders: recentOrders.map((order: any) => ({
        ...order,
        items: order.items?.slice(0, 1) || [],
      })),
    })
  } catch (error) {
    console.error('Get dealer dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
