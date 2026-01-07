import { UserRole } from '@/entities/enums/UserRole'
import jwt from 'jsonwebtoken'

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  supabaseId?: string
}

export function generateToken(payload: JWTPayload): string {
  const secret = (process.env.JWT_SECRET || 'fallback-secret') as string
  // @ts-ignore - JWT secret type issue
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = String(process.env.JWT_SECRET || 'fallback-secret')
    return jwt.verify(token, secret) as JWTPayload
  } catch {
    return null
  }
}

import { getUserRepository, getAdminRepository, getDealerRepository } from '@/src/database/repositories'

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload) return null

  const userRepo = await getUserRepository()
  const user = await userRepo.findOne({
    where: { id: payload.userId },
  })

  return user
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const userRepo = await getUserRepository()
  const user = await userRepo.findOne({
    where: { id: userId },
    select: ['role'],
  })
  return user?.role || UserRole.USER
}

export async function isAdmin(userId: string): Promise<boolean> {
  const adminRepo = await getAdminRepository()
  const admin = await adminRepo.findOne({
    where: { userId },
  })
  return !!admin
}

export async function isDealer(userId: string): Promise<boolean> {
  const dealerRepo = await getDealerRepository()
  const dealer = await dealerRepo.findOne({
    where: { userId },
  })
  return !!dealer
}

export function extractAuthToken(req: Request): string | null {
  // Cookie'den token'ı al
  const cookieHeader = req.headers.get('cookie')
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=')
      acc[key] = value
      return acc
    }, {} as Record<string, string>)
    
    if (cookies['auth-token']) {
      return cookies['auth-token']
    }
  }

  // Authorization header'dan token'ı al (Bearer token)
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

