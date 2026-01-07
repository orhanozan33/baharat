// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// Entity'leri EN ÖNCE import et - metadata yüklenmesi için KRİTİK
// Side-effect import'lar - metadata'yı yüklemek için
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
import { getUserRepository, getAdminRepository, getDealerRepository } from '@/lib/db'
import { generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // Database connection kontrolü
    let userRepo
    try {
      userRepo = await getUserRepository()
    } catch (dbError: any) {
      console.error('Database connection error:', dbError?.message)
      return NextResponse.json(
        { 
          error: 'Database bağlantı hatası', 
          details: dbError?.message
        },
        { status: 500 }
      )
    }

    // Kullanıcı adı veya email ile ara
    let user
    try {
      // Önce username ile dene
      user = await userRepo.findOne({
        where: { username }
      })
      
      // Bulunamazsa email ile dene
      if (!user) {
        user = await userRepo.findOne({
          where: { email: username }
        })
      }
    } catch (queryError: any) {
      console.error('User query error:', queryError?.message)
      return NextResponse.json(
        { 
          error: 'Kullanıcı sorgusu hatası', 
          details: queryError?.message || queryError?.toString()
        },
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      )
    }

    // Şifre kontrolü
    let isValidPassword = false
    
    if (!user.password) {
      // Eğer şifre yoksa veya mehmet kullanıcısı için geçici kontrol
      if (user.username === 'mehmet' || user.email === 'mehmet@epicebuhara.com') {
        isValidPassword = password === '33333333'
      } else {
        // Diğer kullanıcılar için şifre yoksa hata
        isValidPassword = false
      }
    } else {
      // Şifre hash'lenmiş ise bcrypt ile kontrol et
      try {
        isValidPassword = await bcrypt.compare(password, user.password)
      } catch (err) {
        // Eğer bcrypt hatası varsa, düz metin kontrolü (geçici)
        isValidPassword = user.password === password
      }
    }
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      )
    }
    
    // Otomatik rol belirleme
    let userRole = user.role || 'USER'

    // Admin kontrolü
    try {
      const adminRepo = await getAdminRepository()
      const admin = await adminRepo.findOne({
        where: { userId: user.id },
      })
      if (admin) {
        userRole = 'ADMIN'
      } else {
        // Bayi kontrolü
        try {
          const dealerRepo = await getDealerRepository()
          const dealer = await dealerRepo.findOne({
            where: { userId: user.id },
          })
          if (dealer && dealer.isActive) {
            userRole = 'DEALER'
          } else {
            userRole = 'USER'
          }
        } catch (dealerError: any) {
          userRole = 'USER'
        }
      }
    } catch (adminError: any) {
      // Admin kontrolü başarısız olsa bile devam et
      userRole = user.role || 'USER'
    }

    // User role'ü güncelle (eğer değiştiyse)
    try {
      if (user.role !== userRole) {
        user.role = userRole as any
        await userRepo.save(user)
      }
    } catch (saveError: any) {
      // Role güncelleme başarısız olsa bile devam et
    }

    // JWT token oluştur
    let token
    try {
      token = generateToken({
        userId: user.id,
        email: user.email,
        role: userRole as any,
        supabaseId: user.supabaseId || '',
      })
    } catch (tokenError: any) {
      console.error('Token generation error:', tokenError)
      return NextResponse.json(
        { error: 'Token oluşturma hatası', details: tokenError?.message },
        { status: 500 }
      )
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: userRole,
      },
      token,
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error: any) {
    console.error('Login error:', error?.message)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}
