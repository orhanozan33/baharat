// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// Entity'leri import et - metadata yüklenmesi için
import { User } from '@/entities/User'
import { Dealer } from '@/entities/Dealer'
import { UserRole } from '@/entities/enums/UserRole'
void User
void Dealer

import { NextRequest, NextResponse } from 'next/server'
import { getUserRepository, getDealerRepository } from '@/lib/db'
import { checkAdmin } from '@/lib/auth-helpers'
import { serializeDealer } from '@/lib/serialize'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await req.json()
    const {
      companyName,
      taxNumber,
      discountRate,
      address,
      phone,
      fullName,
    } = body

    if (!companyName || !fullName) {
      return NextResponse.json(
        { error: 'Firma adı ve ad soyadı gereklidir' },
        { status: 400 }
      )
    }

    const userRepo = await getUserRepository()
    const dealerRepo = await getDealerRepository()

    // Otomatik email oluştur (firma adından slug oluştur + random sayı)
    const emailBase = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20) || 'dealer'
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    let email = `${emailBase}${randomSuffix}@dealer.local`
    
    // Email benzersizliğini kontrol et
    let existingUser = await userRepo.findOne({ where: { email } })
    let counter = 0
    while (existingUser && counter < 10) {
      email = `${emailBase}${randomSuffix}${counter}@dealer.local`
      existingUser = await userRepo.findOne({ where: { email } })
      counter++
    }

    // Varsayılan şifre oluştur
    const defaultPassword = `Dealer${Date.now()}`
    const hashedPassword = await bcrypt.hash(defaultPassword, 10)

    // User oluştur
    const user = userRepo.create({
      supabaseId: randomUUID(),
      email,
      password: hashedPassword,
      name: fullName,
      phone: phone || null,
      role: UserRole.DEALER,
    })

    const savedUser = await userRepo.save(user)

    // Dealer oluştur
    const dealer = dealerRepo.create({
      userId: savedUser.id,
      companyName,
      taxNumber: taxNumber || null,
      discountRate: discountRate || 0,
      address: address || null,
      phone: phone || null,
      email: null,
      isActive: true,
    })

    const savedDealer = await dealerRepo.save(dealer)

    // Relations ile tekrar yükle
    const dealerWithRelations = await dealerRepo.findOne({
      where: { id: savedDealer.id },
      relations: ['user'],
    })

    if (!dealerWithRelations) {
      return NextResponse.json(
        { error: 'Bayi oluşturuldu ancak yüklenemedi' },
        { status: 500 }
      )
    }

    console.log('✅ Dealer created successfully:', {
      id: dealerWithRelations.id,
      companyName: dealerWithRelations.companyName,
      email: dealerWithRelations.user?.email,
    })

    return NextResponse.json({ dealer: serializeDealer(dealerWithRelations) }, { status: 201 })
  } catch (error: any) {
    console.error('Create dealer error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const dealerRepo = await getDealerRepository()
    const userRepo = await getUserRepository()
    
    // "Order" dealer'ının var olup olmadığını kontrol et, yoksa oluştur
    let orderDealer = await dealerRepo.findOne({
      where: { companyName: 'Order' },
      relations: ['user'],
    })

    if (!orderDealer) {
      const email = 'order@system.local'
      let existingUser = await userRepo.findOne({ where: { email } })
      
      let user
      if (existingUser) {
        user = existingUser
      } else {
        const hashedPassword = await bcrypt.hash('Order' + Date.now(), 10)
        user = userRepo.create({
          supabaseId: randomUUID(),
          email,
          password: hashedPassword,
          name: 'Order System',
          role: UserRole.DEALER,
        })
        user = await userRepo.save(user)
      }

      orderDealer = dealerRepo.create({
        userId: user.id,
        companyName: 'Order',
        discountRate: 0,
        isActive: true,
      })
      orderDealer = await dealerRepo.save(orderDealer)
      console.log('✅ "Order" dealer oluşturuldu:', orderDealer.id)
    }

    const dealersData = await dealerRepo.find({
      relations: ['user'],
      order: {
        createdAt: 'DESC',
      },
    })

    console.log('📋 Total dealers found:', dealersData.length)
    console.log('📋 Dealers:', dealersData.map((d: any) => ({
      id: d.id,
      companyName: d.companyName,
      email: d.user?.email || d.email,
    })))

    const serializedDealers = dealersData.map((d: any) => serializeDealer(d))
    
    return NextResponse.json({
      dealers: serializedDealers,
      pagination: {
        page: 1,
        limit: dealersData.length,
        total: dealersData.length,
        pages: 1,
      },
    })
  } catch (error: any) {
    console.error('Get dealers error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

