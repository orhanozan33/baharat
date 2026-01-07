import { redirect, notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getProductRepository, getCategoryRepository } from '@/lib/db'
import AdminProductForm from '@/components/admin/AdminProductForm'
import { serializeProduct, serializeCategories } from '@/lib/serialize'

export default async function AdminProductEditPage({
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

  let product: any = null
  let categories: any[] = []

  try {
    const productRepo = await getProductRepository()
    const categoryRepo = await getCategoryRepository()

    const [productData, categoriesData] = await Promise.all([
      productRepo.findOne({
        where: { id },
        relations: ['category'],
      }),
      categoryRepo.find({
        where: { isActive: true },
        relations: ['parent'],
        order: { name: 'ASC' },
      }),
    ])

    if (!productData) {
      notFound()
    }

    product = serializeProduct(productData)
    categories = serializeCategories(categoriesData)
  } catch (error: any) {
    console.error('Product fetch error:', error)
    notFound()
  }

  return <AdminProductForm product={product} categories={categories} />
}

