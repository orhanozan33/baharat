import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import AdminSettingsContent from '@/components/admin/AdminSettingsContent'

export default async function AdminSettingsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  return <AdminSettingsContent />
}



