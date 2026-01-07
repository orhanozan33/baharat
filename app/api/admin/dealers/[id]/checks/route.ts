import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getCheckRepository, getDealerRepository } from '@/lib/db'
import { checkAdmin } from '@/lib/auth-helpers'
import { Check, CheckStatus } from '@/entities/Check'

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
      return NextResponse.json({ checks: [] }, { status: 200 })
    }
    
    const checkRepo = await getCheckRepository()

    const checks = await checkRepo.find({
      where: { dealerId: id },
      order: { dueDate: 'ASC' },
    })

    return NextResponse.json({ checks })
  } catch (error: any) {
    console.error('Get checks error:', error)
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
    const { amount, checkNumber, bankName, issueDate, dueDate, notes } = body

    if (!amount || !checkNumber || !bankName || !dueDate) {
      return NextResponse.json(
        { error: 'Amount, check number, bank name, and due date are required' },
        { status: 400 }
      )
    }

    const checkRepo = await getCheckRepository()

    const check = checkRepo.create({
      dealerId: id,
      amount: parseFloat(amount),
      checkNumber,
      bankName,
      issueDate: new Date(issueDate || new Date()),
      dueDate: new Date(dueDate),
      status: CheckStatus.PENDING,
      notes: notes || null,
    })

    const saved = await checkRepo.save(check)

    return NextResponse.json({ check: saved }, { status: 201 })
  } catch (error: any) {
    console.error('Create check error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

