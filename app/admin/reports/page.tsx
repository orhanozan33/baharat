import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getOrderRepository, getProductRepository } from '@/lib/db'
import AdminReportsContent from '@/components/admin/AdminReportsContent'
import { OrderStatus } from '@/entities/enums/OrderStatus'
import { serializeProducts, serializeOrders } from '@/lib/serialize'
import { In } from 'typeorm'

export default async function AdminReportsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  let reportData: any = {
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    averageOrderValue: 0,
    topProducts: [],
    salesByStatus: {},
  }

  try {
    const orderRepo = await getOrderRepository()
    const productRepo = await getProductRepository()

    // Get only user orders (exclude dealer orders) - for status distribution
    const queryBuilder = orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where(
        '(order.orderNumber NOT LIKE :adminPrefix AND order.orderNumber NOT LIKE :dealerPrefix)',
        { adminPrefix: 'ADMIN-SALE-%', dealerPrefix: 'DEALER-SALE-%' }
      )

    const allOrders = await queryBuilder.getMany()

    // Get ALL orders for top-selling products (including dealer and admin sales)
    const allOrdersForProducts = await orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .getMany()

    const completedOrders = allOrders.filter((o) => o.status === OrderStatus.DELIVERED)
    const cancelledOrders = allOrders.filter((o) => o.status === OrderStatus.CANCELLED)

    const totalRevenue = completedOrders.reduce((sum, order) => sum + order.total, 0)
    const averageOrderValue =
      completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0

    // Top products by order items - from ALL orders (including dealer and admin sales)
    const productSales: Record<string, number> = {}
    allOrdersForProducts.forEach((order) => {
      order.items?.forEach((item: any) => {
        const productId = item.productId
        if (!productSales[productId]) {
          productSales[productId] = 0
        }
        productSales[productId] += item.quantity
      })
    })

    const topProductIds = Object.entries(productSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id]) => id)

    // In new TypeORM, findByIds doesn't exist, use In() instead
    const topProductsData = topProductIds.length > 0 
      ? await productRepo.find({ where: { id: In(topProductIds) } })
      : []

    // Serialize products ve sıralamayı koru
    const productsMap = new Map(
      serializeProducts(topProductsData).map((p: any) => [p.id, {
        ...p,
        quantitySold: productSales[p.id] || 0,
      }])
    )
    
    // Reorder products according to topProductIds order
    const serializedTopProducts = topProductIds
      .map(id => productsMap.get(id))
      .filter(Boolean)

    // Sales by status - only statuses used in the system
    const salesByStatus: Record<string, number> = {}
    const systemStatuses = [OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.SHIPPED, OrderStatus.CANCELLED]
    systemStatuses.forEach((status) => {
      const count = allOrders.filter((o) => o.status === status).length
      salesByStatus[status] = count
    })
    
    // Debug: Check SHIPPED orders
    console.log('📊 Reports - Total orders:', allOrders.length)
    console.log('📦 SHIPPED orders:', salesByStatus[OrderStatus.SHIPPED])
    console.log('📋 All statuses:', salesByStatus)

    reportData = {
      totalRevenue: Number(totalRevenue),
      totalOrders: allOrders.length,
      completedOrders: completedOrders.length,
      cancelledOrders: cancelledOrders.length,
      averageOrderValue: Number(averageOrderValue),
      topProducts: serializedTopProducts,
      salesByStatus,
    }
  } catch (error) {
    console.error('Reports fetch error:', error)
  }

  return <AdminReportsContent reportData={reportData} />
}


