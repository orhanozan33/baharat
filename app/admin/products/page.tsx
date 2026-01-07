import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getProductRepository } from '@/lib/db'
import AdminProductsContent from '@/components/admin/AdminProductsContent'
import { serializeProducts } from '@/lib/serialize'

export default async function AdminProductsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  let products: any[] = []

  try {
    const productRepo = await getProductRepository()
    // Fetch all products (active and inactive) - admin should be able to see all products
    const productsData = await productRepo.find({
      relations: ['category'],
      order: {
        createdAt: 'DESC',
      },
      // Limit removed or increased - show all products
    })
    
    // TypeORM entity'lerini plain object'e serialize et
    products = serializeProducts(productsData)
    
    // Debug için
    console.log(`Admin Products: Found ${products.length} products`)
  } catch (error: any) {
    console.error('Products fetch error:', error)
    console.error('Error details:', error.message, error.stack)
  }

  return <AdminProductsContent products={products} />
}
