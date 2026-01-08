import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getOrderRepository } from '@/lib/db'

// Sipariş numarasına göre sipariş sorgulama (authentication gerektirmez - guest order için)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('orderNumber')

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Sipariş numarası gereklidir' },
        { status: 400 }
      )
    }

    const orderRepo = await getOrderRepository()
    
    const order = await orderRepo.findOne({
      where: { orderNumber },
      relations: ['items', 'items.product'],
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
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
        sku: item.sku,
        product: item.product ? {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          images: item.product.images || [],
        } : null,
      })) || [],
    }

    return NextResponse.json({ order: formattedOrder })
  } catch (error: any) {
    console.error('Track order error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}



