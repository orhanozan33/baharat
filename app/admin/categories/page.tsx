import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getCategoryRepository } from '@/lib/db'
import AdminCategoriesContent from '@/components/admin/AdminCategoriesContent'
import { serializeCategories } from '@/lib/serialize'

export default async function AdminCategoriesPage() {
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
      relations: ['parent'],
      order: {
        order: 'ASC',
        name: 'ASC',
      },
    })
    
    // TypeORM entity'lerini plain object'e serialize et
    categories = serializeCategories(categoriesData)
  } catch (error) {
    console.error('Categories fetch error:', error)
  }

  return <AdminCategoriesContent categories={categories} />
}


