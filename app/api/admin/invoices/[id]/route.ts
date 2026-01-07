import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getInvoiceRepository } from '@/lib/db'
import { Invoice } from '@/entities/Invoice'

// Entity'yi zorla yükle - metadata için
void Invoice

// GET - Fatura detayını getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const invoiceRepo = await getInvoiceRepository()

    const invoice = await invoiceRepo.findOne({
      where: { id },
      relations: ['order', 'order.items', 'order.items.product'],
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ invoice })
  } catch (error: any) {
    console.error('Get invoice error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

