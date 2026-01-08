import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getOrderRepository } from '@/lib/db'
import { serializeOrder } from '@/lib/serialize'
import InvoicePage from '@/components/admin/InvoicePage'

export default async function AdminInvoicePage({
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
  const orderRepo = await getOrderRepository()
  
  const order = await orderRepo.findOne({
    where: { id },
    relations: ['items', 'items.product', 'user', 'dealer'],
  })

  if (!order) {
    redirect('/admin/orders')
  }

  return <InvoicePage order={serializeOrder(order)} />
}


