import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import ReceiptSettingsPage from '@/components/admin/ReceiptSettingsPage'

export default async function AdminReceiptSettingsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return <ReceiptSettingsPage />
}


