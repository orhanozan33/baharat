import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getCategoryRepository } from '@/lib/db'
import AdminCategoryForm from '@/components/admin/AdminCategoryForm'
import { serializeCategories } from '@/lib/serialize'

export default async function AdminNewCategoryPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  let allCategories: any[] = []

  try {
    const categoryRepo = await getCategoryRepository()
    const categoriesData = await categoryRepo.find({
      relations: ['parent'],
      order: {
        order: 'ASC',
        name: 'ASC',
      },
    })
    
    allCategories = serializeCategories(categoriesData)
  } catch (error) {
    console.error('Categories fetch error:', error)
  }

  return (
    <div>
      <AdminCategoryForm categories={allCategories} />
    </div>
  )
}

