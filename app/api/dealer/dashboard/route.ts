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
      include: {
        _count: {
          select: {
            orders: true,
            dealerProducts: true,
          },
        },
      },
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
      totalRevenue,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count({
        where: { dealerId: dealer.id },
      }),
      prisma.order.count({
        where: {
          dealerId: dealer.id,
          status: OrderStatus.PENDING,
        },
      }),
      prisma.order.aggregate({
        where: {
          dealerId: dealer.id,
          status: {
            not: OrderStatus.CANCELLED,
          },
        },
        _sum: {
          total: true,
        },
      }),
      prisma.order.findMany({
        where: { dealerId: dealer.id },
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          items: {
            take: 1,
            include: {
              product: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
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
        totalRevenue: totalRevenue._sum.total || 0,
        totalProducts: dealer._count.dealerProducts,
      },
      recentOrders,
    })
  } catch (error) {
    console.error('Get dealer dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


