import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getDealerRepository, getUserRepository } from '@/lib/db'
import { checkAdmin } from '@/lib/auth-helpers'
import { serializeDealer } from '@/lib/serialize'

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const {
      companyName,
      taxNumber,
      discountRate,
      isActive,
      address,
      phone,
      email,
      fullName,
      userEmail,
      userPhone,
      userAddress,
      userCity,
      userPostalCode,
    } = body

    const dealerRepo = await getDealerRepository()
    const userRepo = await getUserRepository()
    
    const dealer = await dealerRepo.findOne({
      where: { id },
      relations: ['user'],
    })

    if (!dealer) {
      return NextResponse.json(
        { error: 'Bayi bulunamadı' },
        { status: 404 }
      )
    }

    // Update dealer fields
    if (companyName !== undefined) dealer.companyName = companyName
    if (taxNumber !== undefined) dealer.taxNumber = taxNumber || null
    if (discountRate !== undefined) dealer.discountRate = discountRate || 0
    if (isActive !== undefined) dealer.isActive = isActive
    if (address !== undefined) dealer.address = address || null
    if (phone !== undefined) dealer.phone = phone || null
    if (email !== undefined) dealer.email = email || null

    await dealerRepo.save(dealer)

    // Update user fields if user exists
    if (dealer.userId && dealer.user) {
      const user = await userRepo.findOne({ where: { id: dealer.userId } })
      if (user) {
        if (fullName !== undefined) user.name = fullName || null
        if (userEmail !== undefined) user.email = userEmail || user.email
        if (userPhone !== undefined) user.phone = userPhone || null
        if (userAddress !== undefined) user.address = userAddress || null
        if (userCity !== undefined) user.city = userCity || null
        if (userPostalCode !== undefined) user.postalCode = userPostalCode || null
        await userRepo.save(user)
      }
    }

    // Reload with relations
    const updatedDealer = await dealerRepo.findOne({
      where: { id },
      relations: ['user'],
    })

    if (!updatedDealer) {
      return NextResponse.json(
        { error: 'Bayi güncellenemedi' },
        { status: 500 }
      )
    }

    return NextResponse.json({ dealer: serializeDealer(updatedDealer) })
  } catch (error: any) {
    console.error('Update dealer error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

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
    const dealerRepo = await getDealerRepository()
    
    const dealer = await dealerRepo.findOne({
      where: { id },
      relations: ['user'],
    })

    if (!dealer) {
      return NextResponse.json(
        { error: 'Bayi bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json({ dealer: serializeDealer(dealer) })
  } catch (error: any) {
    console.error('Get dealer error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const dealerRepo = await getDealerRepository()
    
    const dealer = await dealerRepo.findOne({
      where: { id },
      relations: ['user'],
    })

    if (!dealer) {
      return NextResponse.json(
        { error: 'Bayi bulunamadı' },
        { status: 404 }
      )
    }

    // User'ı da sil
    const userRepo = await getUserRepository()
    if (dealer.userId) {
      const user = await userRepo.findOne({ where: { id: dealer.userId } })
      if (user) {
        await userRepo.remove(user)
      }
    }

    // Dealer'ı sil
    await dealerRepo.remove(dealer)

    return NextResponse.json({ message: 'Bayi başarıyla silindi' })
  } catch (error: any) {
    console.error('Delete dealer error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

