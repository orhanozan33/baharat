import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkAdmin } from '@/lib/auth-helpers'
import { OrderStatus } from '@prisma/client'

export async function GET(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
    try {
      const [
        totalOrders,
        pendingOrders,
        totalRevenue,
        totalProducts,
        totalCategories,
        totalDealers,
        recentOrders,
        topProducts,
      ] = await Promise.all([
        prisma.order.count(),
        prisma.order.count({
          where: { status: OrderStatus.PENDING },
        }),
        prisma.order.aggregate({
          where: {
            status: {
              not: OrderStatus.CANCELLED,
            },
          },
          _sum: {
            total: true,
          },
        }),
        prisma.product.count(),
        prisma.category.count(),
        prisma.dealer.count({
          where: { isActive: true },
        }),
        prisma.order.findMany({
          take: 10,
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            items: {
              take: 1,
            },
          },
        }),
        prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: {
            quantity: true,
          },
          orderBy: {
            _sum: {
              quantity: 'desc',
            },
          },
          take: 5,
        }),
      ])

      const topProductsWithDetails = await Promise.all(
        topProducts.map(async (item) => {
          const product = await prisma.product.findUnique({
            where: { id: item.productId },
            select: {
              id: true,
              name: true,
              price: true,
              images: true,
            },
          })
          return {
            product,
            totalSold: item._sum.quantity || 0,
          }
        })
      )

      return NextResponse.json({
        stats: {
          totalOrders,
          pendingOrders,
          totalRevenue: totalRevenue._sum.total || 0,
          totalProducts,
          totalCategories,
          totalDealers,
        },
        recentOrders,
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

