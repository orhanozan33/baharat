import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getUserRepository, getDealerRepository } from '@/lib/db'
import AdminUsersContent from '@/components/admin/AdminUsersContent'
import { serializeUsers, serializeDealers } from '@/lib/serialize'

export default async function AdminUsersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  let users: any[] = []

  try {
    const userRepo = await getUserRepository()
    const dealerRepo = await getDealerRepository()
    
    // Fetch all users (including USER, ADMIN, DEALER roles)
    const usersData = await userRepo.find({
      relations: ['dealer'],
      order: {
        createdAt: 'DESC',
      },
      take: 100,
    })
    
    // TypeORM entity'lerini plain object'e serialize et
    users = serializeUsers(usersData)
    
    // Add additional information for dealers
    for (const user of users) {
      if (user.role === 'DEALER' && user.dealer) {
        // Dealer bilgileri zaten user içinde olmalı
        // But if it doesn't exist, fetch the dealer again
        if (!user.companyName) {
          const dealer = await dealerRepo.findOne({
            where: { userId: user.id },
            relations: ['user'],
          })
          if (dealer) {
            user.companyName = dealer.companyName
            user.taxNumber = dealer.taxNumber
            user.dealerId = dealer.id
          }
        }
      }
    }
  } catch (error) {
    console.error('Users fetch error:', error)
  }

  return <AdminUsersContent users={users} />
}


