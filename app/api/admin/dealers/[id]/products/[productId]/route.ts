import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getDealerProductRepository } from '@/lib/db'
import { checkAdmin } from '@/lib/auth-helpers'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; productId: string }> }
) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id, productId } = await params
    
    // Geçersiz dealer ID kontrolü
    if (id && id.startsWith('temp-')) {
      return NextResponse.json(
        { error: 'Geçersiz bayi ID. Lütfen önce bayi kaydını tamamlayın.' },
        { status: 400 }
      )
    }
    
    const dealerProductRepo = await getDealerProductRepository()

    const dealerProduct = await dealerProductRepo.findOne({
      where: { dealerId: id, productId },
    })

    if (!dealerProduct) {
      return NextResponse.json(
        { error: 'Dealer product not found' },
        { status: 404 }
      )
    }

    await dealerProductRepo.remove(dealerProduct)

    return NextResponse.json({ message: 'Product removed successfully' })
  } catch (error: any) {
    console.error('Delete dealer product error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

