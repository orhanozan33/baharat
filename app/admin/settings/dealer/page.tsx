import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import DealerSettingsPage from '@/components/admin/DealerSettingsPage'

export default async function AdminDealerSettingsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return <DealerSettingsPage />
}


