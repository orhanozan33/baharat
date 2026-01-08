import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getDealerRepository } from '@/lib/db'
import DealerSalePage from '@/components/admin/DealerSalePage'
import { serializeDealer } from '@/lib/serialize'

export default async function DealerSaleRoute({
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
  let dealer: any = null

  try {
    const dealerRepo = await getDealerRepository()
    const dealerData = await dealerRepo.findOne({
      where: { id },
      relations: ['user'],
    })

    if (!dealerData) {
      redirect('/admin/dealers')
    }

    dealer = serializeDealer(dealerData)
  } catch (error: any) {
    console.error('Dealer fetch error:', error)
    redirect('/admin/dealers')
  }

  return <DealerSalePage dealer={dealer} />
}



