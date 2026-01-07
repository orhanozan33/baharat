import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getProductRepository } from '@/lib/db'
import { serializeProduct } from '@/lib/serialize'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productRepo = await getProductRepository()
    
    const product = await productRepo.findOne({
      where: { id },
      relations: ['category'],
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ product: serializeProduct(product) })
  } catch (error: any) {
    console.error('Get product error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

