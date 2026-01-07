import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getUserRepository, getAdminRepository } from '@/lib/db'
import { UserRole } from '@/entities/enums/UserRole'
import { randomUUID } from 'node:crypto'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const userRepo = await getUserRepository()
    const adminRepo = await getAdminRepository()

    // Kullanıcı adı kontrolü
    const existingUser = await userRepo
      .createQueryBuilder('user')
      .where('user.username = :username OR user.email = :email', {
        username: 'mehmet',
        email: 'mehmet@epicebuhara.com',
      })
      .getOne()

    const password = '33333333'
    const hashedPassword = await bcrypt.hash(password, 10)

    if (existingUser) {
      // Şifre yoksa veya hash'lenmemişse güncelle
      if (!existingUser.password) {
        existingUser.password = hashedPassword
        existingUser.role = UserRole.ADMIN
        await userRepo.save(existingUser)
      }

      // Admin kaydı var mı kontrol et
      const existingAdmin = await adminRepo.findOne({
        where: { userId: existingUser.id },
      })
      if (!existingAdmin) {
        // Admin kaydı oluştur
        const admin = adminRepo.create({
          userId: existingUser.id,
          fullName: 'Mehmet Admin',
          permissions: ['*'], // Tam yetki
        })
        await adminRepo.save(admin)
        return NextResponse.json({
          message: 'Admin kaydı oluşturuldu ve şifre güncellendi',
          user: {
            username: existingUser.username,
            email: existingUser.email,
            hasPassword: true,
          },
        })
      }
      return NextResponse.json({
        message: 'Admin kullanıcısı zaten mevcut',
        user: {
          username: existingUser.username,
          email: existingUser.email,
          hasPassword: !!existingUser.password,
        },
      })
    }

    // Yeni kullanıcı oluştur
    const user = userRepo.create({
      supabaseId: randomUUID(),
      email: 'mehmet@epicebuhara.com',
      username: 'mehmet',
      name: 'Mehmet',
      password: hashedPassword,
      role: UserRole.ADMIN,
    })

    const savedUser = await userRepo.save(user)

    // Admin kaydı oluştur
    const admin = adminRepo.create({
      userId: savedUser.id,
      fullName: 'Mehmet Admin',
      permissions: ['*'], // Tam yetki
    })

    await adminRepo.save(admin)

    return NextResponse.json({
      message: 'Admin kullanıcısı oluşturuldu',
      user: {
        username: 'mehmet',
        email: 'mehmet@epicebuhara.com',
        password: '33333333',
      },
    })
  } catch (error: any) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}


