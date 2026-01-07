import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getPaymentRepository, getDealerRepository } from '@/lib/db'
import { checkAdmin } from '@/lib/auth-helpers'
import { Payment, PaymentType } from '@/entities/Payment'

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
    
    // Geçersiz dealer ID kontrolü
    if (id && id.startsWith('temp-')) {
      return NextResponse.json({ payments: [] }, { status: 200 })
    }
    
    const paymentRepo = await getPaymentRepository()

    const payments = await paymentRepo.find({
      where: { dealerId: id },
      order: { paymentDate: 'DESC' },
    })

    return NextResponse.json({ payments })
  } catch (error: any) {
    console.error('Get payments error:', error)
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
    
    // Geçersiz dealer ID kontrolü
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
    const { amount, type, paymentDate, description, referenceNumber } = body

    if (!amount || !paymentDate) {
      return NextResponse.json(
        { error: 'Amount and payment date are required' },
        { status: 400 }
      )
    }

    const paymentRepo = await getPaymentRepository()

    const payment = paymentRepo.create({
      dealerId: id,
      amount: parseFloat(amount),
      type: (type as PaymentType) || PaymentType.CASH,
      paymentDate: new Date(paymentDate),
      description: description || null,
      referenceNumber: referenceNumber || null,
    })

    const saved = await paymentRepo.save(payment)

    return NextResponse.json({ payment: saved }, { status: 201 })
  } catch (error: any) {
    console.error('Create payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

