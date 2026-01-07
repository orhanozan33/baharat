import { NextRequest, NextResponse } from 'next/server'
import { getUserRepository } from '@/lib/db'
import { generateToken } from '@/lib/auth'
import { UserRole } from '@/entities/enums/UserRole'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, role } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Email'in zaten kullanılıp kullanılmadığını kontrol et
    const userRepo = await getUserRepository()
    const existingUser = await userRepo.findOne({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Database'de kullanıcı oluştur
    
    const user = userRepo.create({
      supabaseId: randomUUID(),
      email,
      name: name || undefined,
      phone: phone || undefined,
      role: role || UserRole.USER,
    })
    
    await userRepo.save(user)

    // JWT token oluştur
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      supabaseId: user.supabaseId,
    })

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
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
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
