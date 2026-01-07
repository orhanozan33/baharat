import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getCategoryRepository } from '@/lib/db'
import AdminCategoryForm from '@/components/admin/AdminCategoryForm'
import { serializeCategory, serializeCategories } from '@/lib/serialize'

export default async function AdminCategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  const { id } = await params

  let category: any = null
  let allCategories: any[] = []

  try {
    const categoryRepo = await getCategoryRepository()
    
    const [categoryData, allCategoriesData] = await Promise.all([
      categoryRepo.findOne({
        where: { id },
        relations: ['parent'],
      }),
      categoryRepo.find({
        relations: ['parent'],
        order: {
          order: 'ASC',
          name: 'ASC',
        },
      }),
    ])

    if (categoryData) {
      category = serializeCategory(categoryData)
    }
    allCategories = serializeCategories(allCategoriesData)
  } catch (error) {
    console.error('Category fetch error:', error)
  }

  if (!category) {
    redirect('/admin/categories')
  }

  return (
    <div>
      <AdminCategoryForm category={category} categories={allCategories} />
    </div>
  )
}

