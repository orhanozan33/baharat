import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getDealerProductRepository, getProductRepository, getDealerRepository } from '@/lib/db'
import { checkAdmin } from '@/lib/auth-helpers'
import { DealerProduct } from '@/entities/DealerProduct'
import { Product } from '@/entities/Product'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    
    // Geçersiz dealer ID kontrolü (temp- ile başlayan ID'ler)
    if (id && id.startsWith('temp-')) {
      return NextResponse.json(
        { products: [] },
        { status: 200 }
      )
    }
    
    // Dealer'ın var olup olmadığını kontrol et
    const dealerRepo = await getDealerRepository()
    const dealer = await dealerRepo.findOne({ where: { id } })
    
    if (!dealer) {
      return NextResponse.json(
        { error: 'Bayi bulunamadı' },
        { status: 404 }
      )
    }
    
    const dealerProductRepo = await getDealerProductRepository()

    const dealerProducts = await dealerProductRepo.find({
      where: { dealerId: id },
      relations: ['product'],
    })

    return NextResponse.json({
      products: dealerProducts.map((dp) => ({
        id: dp.id,
        productId: dp.productId,
        price: dp.price,
        discountRate: dp.discountRate,
        isActive: dp.isActive,
        createdAt: dp.createdAt,
        updatedAt: dp.updatedAt,
      })),
    })
  } catch (error: any) {
    console.error('Get dealer products error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    
    // Geçersiz dealer ID kontrolü (temp- ile başlayan ID'ler)
    if (id && id.startsWith('temp-')) {
      return NextResponse.json(
        { error: 'Geçersiz bayi ID. Lütfen önce bayi kaydını tamamlayın.' },
        { status: 400 }
      )
    }

    // Dealer'ın var olup olmadığını kontrol et
    const dealerRepo = await getDealerRepository()
    const dealer = await dealerRepo.findOne({ where: { id } })
    
    if (!dealer) {
      return NextResponse.json(
        { error: 'Bayi bulunamadı' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { productId, price, discountRate } = body

    if (!productId || !price) {
      return NextResponse.json(
        { error: 'Product ID and price are required' },
        { status: 400 }
      )
    }

    const dealerProductRepo = await getDealerProductRepository()
    const productRepo = await getProductRepository()

    // Check if product exists
    const product = await productRepo.findOne({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Check if dealer product already exists
    const existing = await dealerProductRepo.findOne({
      where: { dealerId: id, productId },
    })

    if (existing) {
      // Update existing
      existing.price = parseFloat(price)
      existing.discountRate = parseFloat(discountRate || '0')
      const updated = await dealerProductRepo.save(existing)
      return NextResponse.json({ product: updated })
    } else {
      // Create new
      const dealerProduct = dealerProductRepo.create({
        dealerId: id,
        productId,
        price: parseFloat(price),
        discountRate: parseFloat(discountRate || '0'),
        isActive: true,
      })
      const saved = await dealerProductRepo.save(dealerProduct)
      return NextResponse.json({ product: saved }, { status: 201 })
    }
  } catch (error: any) {
    console.error('Create dealer product error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

