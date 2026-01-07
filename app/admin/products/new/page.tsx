import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getCategoryRepository } from '@/lib/db'
import AdminProductForm from '@/components/admin/AdminProductForm'
import { serializeCategories } from '@/lib/serialize'

export default async function AdminProductNewPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  let categories: any[] = []

  try {
    const categoryRepo = await getCategoryRepository()
    const categoriesData = await categoryRepo.find({
      where: { isActive: true },
      relations: ['parent'],
      order: { name: 'ASC' },
    })

    categories = serializeCategories(categoriesData)
  } catch (error: any) {
    console.error('Categories fetch error:', error)
  }

  return <AdminProductForm categories={categories} />
}

