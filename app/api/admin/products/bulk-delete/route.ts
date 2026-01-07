import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getProductRepository } from '@/lib/db'
import { extractAuthToken, verifyToken } from '@/lib/auth'

export async function DELETE(req: NextRequest) {
  const token = extractAuthToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const productRepo = await getProductRepository()
    
    // Tüm ürünleri sil (Foreign key kısıtları nedeniyle query builder kullanıyoruz)
    await productRepo
      .createQueryBuilder()
      .delete()
      .from('products')
      .where('1 = 1') // Tüm kayıtları sil
      .execute()
    
    return NextResponse.json({ 
      message: 'All products deleted successfully'
    })
  } catch (error: any) {
    console.error('Bulk delete error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

