import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getProductRepository, getCategoryRepository, getOrderRepository, getDealerRepository } from '@/lib/db'
import AdminDashboardContent from '@/components/admin/AdminDashboardContent'
import { OrderStatus } from '@/entities/enums/OrderStatus'

export default async function AdminDashboardPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  // Fetch dashboard statistics
  let stats = {
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalDealers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    activeProducts: 0,
    activeDealers: 0,
  }

  try {
    const productRepo = await getProductRepository()
    const categoryRepo = await getCategoryRepository()
    const orderRepo = await getOrderRepository()
    const dealerRepo = await getDealerRepository()

    const [
      totalProducts,
      totalCategories,
      totalOrders,
      totalDealers,
      pendingOrders,
      deliveredOrders,
      activeProducts,
      activeDealers,
    ] = await Promise.all([
      productRepo.count(),
      categoryRepo.count(),
      orderRepo.count(),
      dealerRepo.count(),
      orderRepo.count({ where: { status: OrderStatus.PENDING } }),
      orderRepo
        .createQueryBuilder('order')
        .select('SUM(order.total)', 'total')
        .where('order.status = :status', { status: OrderStatus.DELIVERED })
        .getRawOne(),
      productRepo.count({ where: { isActive: true } }),
      dealerRepo.count({ where: { isActive: true } }),
    ])

    const totalRevenue = deliveredOrders?.total ? Number(deliveredOrders.total) : 0

    stats = {
      totalProducts,
      totalCategories,
      totalOrders,
      totalDealers,
      pendingOrders,
      totalRevenue,
      activeProducts,
      activeDealers,
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
  }

  return <AdminDashboardContent stats={stats} />
}
