import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env dosyasını yükle
config({ path: resolve(process.cwd(), '.env') })

import { getConnection } from '../lib/database'
import { getUserRepository, getDealerRepository } from '../lib/db'
import { UserRole } from '../entities/enums/UserRole'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

async function createOrderDealer() {
  try {
    const connection = await getConnection()
    
    const userRepo = await getUserRepository()
    const dealerRepo = await getDealerRepository()

    // "Order" dealer'ı zaten var mı kontrol et
    const existingDealer = await dealerRepo.findOne({
      where: { companyName: 'Order' },
      relations: ['user'],
    })

    if (existingDealer) {
      console.log('✅ "Order" dealer zaten mevcut:', existingDealer.id)
      return existingDealer
    }

    // User oluştur
    const email = 'order@system.local'
    const existingUser = await userRepo.findOne({ where: { email } })
    
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

    // Dealer oluştur
    const dealer = dealerRepo.create({
      userId: user.id,
      companyName: 'Order',
      taxNumber: null,
      discountRate: 0,
      address: null,
      phone: null,
      email: null,
      isActive: true,
    })

    const savedDealer = await dealerRepo.save(dealer)
    console.log('✅ "Order" dealer oluşturuldu:', savedDealer.id)
    
    return savedDealer
  } catch (error: any) {
    console.error('❌ Order dealer oluşturma hatası:', error)
    throw error
  } finally {
    process.exit(0)
  }
}

createOrderDealer()



