import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from './auth'
import { UserRole } from '@/entities/enums/UserRole'

export function withAuth(
  handler: (req: NextRequest, userId: string, role: UserRole) => Promise<NextResponse>,
  allowedRoles?: UserRole[]
) {
  return async (req: NextRequest) => {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') ||
                  req.cookies.get('auth-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (allowedRoles && !allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return handler(req, payload.userId, payload.role)
  }
}

export function extractAuthToken(req: NextRequest): string | null {
  return req.headers.get('authorization')?.replace('Bearer ', '') ||
         req.cookies.get('auth-token')?.value ||
         null
}
