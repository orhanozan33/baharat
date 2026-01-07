import { NextRequest } from 'next/server'
import { extractAuthToken, verifyToken } from './auth'
import { UserRole } from '@/src/database/entities/enums/UserRole'

export async function checkAdmin(req: NextRequest) {
  const token = extractAuthToken(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || payload.role !== UserRole.ADMIN) return null

  return payload
}

export async function checkDealer(req: NextRequest) {
  const token = extractAuthToken(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload || payload.role !== UserRole.DEALER) return null

  return payload
}

export async function checkAuth(req: NextRequest) {
  const token = extractAuthToken(req)
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  return payload
}

