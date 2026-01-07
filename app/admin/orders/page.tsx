import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getOrderRepository } from '@/lib/db'
import AdminOrdersContent from '@/components/admin/AdminOrdersContent'
import { serializeOrders } from '@/lib/serialize'

export default async function AdminOrdersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  let orders: any[] = []

  try {
    const orderRepo = await getOrderRepository()
    
    // Get only user orders (exclude dealer orders)
    const queryBuilder = orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.dealer', 'dealer')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where(
        '(order.orderNumber NOT LIKE :adminPrefix AND order.orderNumber NOT LIKE :dealerPrefix)',
        { adminPrefix: 'ADMIN-SALE-%', dealerPrefix: 'DEALER-SALE-%' }
      )
      .orderBy('order.createdAt', 'DESC')
      .take(100)
    
    const ordersData = await queryBuilder.getMany()
    
    // TypeORM entity'lerini plain object'e serialize et
    orders = serializeOrders(ordersData)
  } catch (error) {
    console.error('Orders fetch error:', error)
  }

  return <AdminOrdersContent orders={orders} />
}


