import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getOrderRepository } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Guest order'lar için authentication gerekmiyor
    const orderRepo = await getOrderRepository()
    
    const order = await orderRepo.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Order items'ı formatla
    const formattedOrder = {
      ...order,
      items: order.items?.map((item: any) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          images: item.product.images,
        } : null,
      })) || [],
    }

    return NextResponse.json({ order: formattedOrder })
  } catch (error: any) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}


