import 'reflect-metadata'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'
import { getDealerRepository, getUserRepository } from '@/lib/db'
import AdminDealersContent from '@/components/admin/AdminDealersContent'
import { serializeDealers } from '@/lib/serialize'
// Entity'leri import et - metadata yüklenmesi için
import { Dealer } from '@/entities/Dealer'
import { User } from '@/entities/User'
import { UserRole } from '@/entities/enums/UserRole'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'
// Metadata yüklenmesi için void kullan
void Dealer
void User

export default async function AdminDealersPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value

  if (!token) {
    redirect('/admin/login')
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    redirect('/admin/login')
  }

  let dealers: any[] = []

  try {
    const dealerRepo = await getDealerRepository()
    const userRepo = await getUserRepository()
    const connection = dealerRepo.manager.connection
    
    // Connection'ın initialize olduğundan emin ol
    if (!connection.isInitialized) {
      await connection.initialize()
    }
    
    // Check if "Order" dealer exists, create if not
    try {
      let orderDealer = await dealerRepo.findOne({
        where: { companyName: 'Order' },
        relations: ['user'],
      })

      if (!orderDealer) {
        const email = 'order@system.local'
        let existingUser = await userRepo.findOne({ where: { email } })
        
        let user
        if (existingUser) {
          user = existingUser
        } else {
          const hashedPassword = await bcrypt.hash('Order' + Date.now(), 10)
          user = userRepo.create({
            supabaseId: randomUUID(),
            email,
            password: hashedPassword,
            name: 'Order System',
            role: UserRole.DEALER,
          })
          user = await userRepo.save(user)
        }

        orderDealer = dealerRepo.create({
          userId: user.id,
          companyName: 'Order',
          discountRate: 0,
          isActive: true,
        })
        orderDealer = await dealerRepo.save(orderDealer)
        console.log('✅ "Order" dealer oluşturuldu (page):', orderDealer.id)
      }
    } catch (orderDealerError: any) {
      console.error('Order dealer creation error (page):', orderDealerError?.message)
      // Continue even if there's an error
    }
    
    // Simple and reliable method: fetch directly with Raw SQL
    try {
      // Önce tablo var mı kontrol et
      const tableCheck = await connection.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'dealers'
        )
      `)
      console.log('📊 Dealers table exists:', tableCheck[0]?.exists)
      
      // Tablo varsa dealer sayısını kontrol et
      const countResult = await connection.query(`SELECT COUNT(*)::int as count FROM dealers`)
      const dealerCount = parseInt(countResult[0]?.count || '0', 10)
      console.log('📊 Dealers count:', dealerCount)
      
      // If count is 0, show all records (maybe there are inactive ones)
      if (dealerCount === 0) {
        const allDealers = await connection.query(`
          SELECT 
            d.id, d."userId", d."companyName", d."taxNumber", d."discountRate", 
            d."isActive", d.address, d.phone, d.email, d."createdAt", d."updatedAt",
            u.id as "user_id", u.email as "user_email", u.name as "user_name", u.role as "user_role"
          FROM dealers d
          LEFT JOIN users u ON d."userId" = u.id
          ORDER BY d."createdAt" DESC
        `)
        console.log('📊 All dealers (including inactive):', allDealers?.length || 0)
      }
      
      const rawResult = await connection.query(`
        SELECT 
          d.id, d."userId", d."companyName", d."taxNumber", d."discountRate", 
          d."isActive", d.address, d.phone, d.email, d."createdAt", d."updatedAt",
          u.id as "user_id", u.email as "user_email", u.name as "user_name", u.role as "user_role"
        FROM dealers d
        LEFT JOIN users u ON d."userId" = u.id
        ORDER BY d."createdAt" DESC
      `)
      
      console.log('📊 Raw SQL result length:', rawResult?.length || 0)
      
      if (rawResult && rawResult.length > 0) {
        dealers = rawResult.map((raw: any) => ({
          id: raw.id,
          userId: raw.userId,
          companyName: raw.companyName,
          taxNumber: raw.taxNumber,
          discountRate: parseFloat(raw.discountRate) || 0,
          isActive: raw.isActive !== undefined ? Boolean(raw.isActive) : true,
          address: raw.address,
          phone: raw.phone,
          email: raw.email,
          createdAt: raw.createdAt,
          updatedAt: raw.updatedAt,
          user: raw.user_id ? {
            id: raw.user_id,
            email: raw.user_email,
            name: raw.user_name,
            role: raw.user_role,
          } : null,
        }))
        console.log('✅ Raw SQL mapped dealers:', dealers.length)
        console.log('✅ First dealer sample:', dealers[0] ? {
          id: dealers[0].id,
          companyName: dealers[0].companyName,
          isActive: dealers[0].isActive,
        } : 'none')
      } else {
        console.log('⚠️ Raw SQL returned empty, trying TypeORM repository...')
        // Raw SQL boş döndüyse, TypeORM repository ile dene
        try {
          const dealersData = await dealerRepo.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
          })
          console.log('✅ Repository found dealers:', dealersData.length)
          dealers = serializeDealers(dealersData)
        } catch (repoError: any) {
          console.error('Repository find failed:', repoError?.message)
          // Query builder ile dene
          try {
            const dealersData = await connection
              .getRepository('Dealer')
              .createQueryBuilder('dealer')
              .leftJoinAndSelect('dealer.user', 'user')
              .orderBy('dealer.createdAt', 'DESC')
              .getMany()
            console.log('✅ Query builder found dealers:', dealersData.length)
            dealers = serializeDealers(dealersData)
          } catch (qbError: any) {
            console.error('Query builder failed:', qbError?.message)
          }
        }
      }
    } catch (rawError: any) {
      console.error('Raw SQL failed:', rawError?.message)
      // Fallback: TypeORM repository
      try {
        const dealersData = await dealerRepo.find({
          relations: ['user'],
          order: { createdAt: 'DESC' },
        })
        dealers = serializeDealers(dealersData)
      } catch (repoError: any) {
        console.error('Repository find also failed:', repoError?.message)
      }
    }
    
    console.log('📋 Final dealers count:', dealers.length)
  } catch (error: any) {
    console.error('❌ Dealers fetch error:', error)
    console.error('❌ Error message:', error?.message)
    console.error('❌ Error stack:', error?.stack)
    dealers = [] // Hata durumunda boş array
  }

  return <AdminDealersContent dealers={dealers || []} />
}


