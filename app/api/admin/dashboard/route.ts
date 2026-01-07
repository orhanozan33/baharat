import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getOrderRepository, getProductRepository, getCategoryRepository, getDealerRepository, getOrderItemRepository } from '@/lib/db'
import { extractAuthToken, verifyToken } from '@/lib/auth'
import { OrderStatus } from '@/entities/enums/OrderStatus'
import { Not } from 'typeorm'

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
    const orderRepo = await getOrderRepository()
    const productRepo = await getProductRepository()
    const categoryRepo = await getCategoryRepository()
    const dealerRepo = await getDealerRepository()
    const orderItemRepo = await getOrderItemRepository()

    const [
      totalOrders,
      pendingOrders,
      totalRevenueResult,
      totalProducts,
      totalCategories,
      totalDealers,
      recentOrders,
      topProductsRaw,
    ] = await Promise.all([
      orderRepo.count(),
      orderRepo.count({ where: { status: OrderStatus.PENDING } }),
      orderRepo
        .createQueryBuilder('order')
        .select('SUM(order.total)', 'sum')
        .where('order.status != :status', { status: OrderStatus.CANCELLED })
        .getRawOne(),
      productRepo.count(),
      categoryRepo.count(),
      dealerRepo.count({ where: { isActive: true } }),
      orderRepo.find({
        take: 10,
        order: { createdAt: 'DESC' },
        relations: ['user', 'items'],
      }),
      orderItemRepo
        .createQueryBuilder('orderItem')
        .select('orderItem.productId', 'productId')
        .addSelect('SUM(orderItem.quantity)', 'totalSold')
        .groupBy('orderItem.productId')
        .orderBy('SUM(orderItem.quantity)', 'DESC')
        .limit(5)
        .getRawMany(),
    ])

    const topProductsWithDetails = await Promise.all(
      topProductsRaw.map(async (item: any) => {
        const product = await productRepo.findOne({
          where: { id: item.productId },
          select: ['id', 'name', 'price', 'images'],
        })
        return {
          product,
          totalSold: parseInt(item.totalSold) || 0,
        }
      })
    )

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        totalRevenue: parseFloat(totalRevenueResult?.sum || '0') || 0,
        totalProducts,
        totalCategories,
        totalDealers,
      },
      recentOrders: recentOrders.map((order: any) => ({
        ...order,
        items: order.items?.slice(0, 1) || [],
        user: order.user ? {
          name: order.user.name,
          email: order.user.email,
        } : null,
      })),
      topProducts: topProductsWithDetails,
    })
  } catch (error) {
    console.error('Get dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
