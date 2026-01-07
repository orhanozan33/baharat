// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// Entity'leri EN ÖNCE import et - metadata yüklenmesi için KRİTİK
import { User } from '@/entities/User'
import { Admin } from '@/entities/Admin'
import { Dealer } from '@/entities/Dealer'
import { Category } from '@/entities/Category'
import { Product } from '@/entities/Product'
import { DealerProduct } from '@/entities/DealerProduct'
import { Order } from '@/entities/Order'
import { OrderItem } from '@/entities/OrderItem'

// Entity'leri kullanılabilir hale getir (metadata yüklensin diye)
void User
void Admin
void Dealer
void Category
void Product
void DealerProduct
void Order
void OrderItem

import { NextRequest, NextResponse } from 'next/server'
import { getUserRepository, getAdminRepository } from '@/lib/db'
import { UserRole } from '@/entities/enums/UserRole'
import { randomUUID } from '@/lib/utils-uuid'
import bcrypt from 'bcryptjs'

// Bu endpoint sadece admin kullanıcısını oluşturmak için
// Güvenlik için production'da kaldırılmalı veya korumalı olmalı
export async function POST(request: NextRequest) {
  try {
    const userRepo = await getUserRepository()
    const adminRepo = await getAdminRepository()

    const username = 'mehmet'
    const email = 'mehmet@epicebuhara.com'
    const password = '33333333'

    // Kullanıcı kontrolü
    const existingUser = await userRepo
      .createQueryBuilder('user')
      .where('user.username = :username OR user.email = :email', {
        username,
        email,
      })
      .getOne()

    let user

    if (existingUser) {
      user = existingUser
      console.log('Existing user found:', user.id)

      // Şifre yoksa veya hash'lenmemişse güncelle
      if (!user.password) {
        const hashedPassword = await bcrypt.hash(password, 10)
        user.password = hashedPassword
        user.role = UserRole.ADMIN
        await userRepo.save(user)
        console.log('Password updated for user')
      }
    } else {
      // Yeni kullanıcı oluştur
      const hashedPassword = await bcrypt.hash(password, 10)
      user = userRepo.create({
        supabaseId: randomUUID(),
        email,
        username,
        name: 'Mehmet',
        password: hashedPassword,
        role: UserRole.ADMIN,
      })
      user = await userRepo.save(user)
      console.log('New user created:', user.id)
    }

    // Admin kaydı kontrolü
    const existingAdmin = await adminRepo.findOne({
      where: { userId: user.id },
    })

    if (!existingAdmin) {
      const admin = adminRepo.create({
        userId: user.id,
        fullName: 'Mehmet Admin',
        permissions: ['*'], // Tam yetki
      })
      await adminRepo.save(admin)
      console.log('Admin record created')
    } else {
      console.log('Admin record already exists')
    }

    return NextResponse.json({
      success: true,
      message: 'Admin kullanıcısı başarıyla oluşturuldu/güncellendi',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        hasPassword: !!user.password,
      },
    })
  } catch (error: any) {
    console.error('Setup admin error:', error)
    return NextResponse.json(
      { error: error.message || 'Admin oluşturma hatası' },
      { status: 500 }
    )
  }
}

