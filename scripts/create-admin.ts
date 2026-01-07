import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env dosyasını yükle - EN ÜSTTE
config({ path: resolve(process.cwd(), '.env') })

// Entity'leri import et - metadata yüklenmesi için
import '../entities/User'
import '../entities/Admin'
import '../entities/Dealer'
import '../entities/Category'
import '../entities/Product'
import '../entities/DealerProduct'
import '../entities/Order'
import '../entities/OrderItem'

import { getConnection } from '../lib/database'
import { getUserRepository, getAdminRepository } from '../lib/db'
import { UserRole } from '../entities/enums/UserRole'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  try {
    const connection = await getConnection()
    
    const userRepo = await getUserRepository()
    const adminRepo = await getAdminRepository()

    // Kullanıcı adı kontrolü
    const existingUser = await userRepo
      .createQueryBuilder('user')
      .where('user.username = :username OR user.email = :email', {
        username: 'mehmet',
        email: 'mehmet@epicebuhara.com',
      })
      .getOne()

    if (existingUser) {
      console.log('⚠️ Kullanıcı zaten mevcut:', existingUser.username || existingUser.email)
      
      // Şifre yoksa veya hash'lenmemişse güncelle
      if (!existingUser.password) {
        const hashedPassword = await bcrypt.hash('33333333', 10)
        existingUser.password = hashedPassword
        await userRepo.save(existingUser)
        console.log('✅ Şifre güncellendi!')
      }
      
      // Admin kaydı var mı kontrol et
      const existingAdmin = await adminRepo.findOne({
        where: { userId: existingUser.id },
      })
      if (!existingAdmin) {
        // Admin kaydı oluştur
        const admin = adminRepo.create({
          userId: existingUser.id,
          fullName: 'Mehmet Admin',
          permissions: ['*'], // Tam yetki
        })
        await adminRepo.save(admin)
        console.log('✅ Admin kaydı oluşturuldu!')
      } else {
        console.log('✅ Admin kaydı zaten mevcut!')
      }
      return
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash('33333333', 10)

    // Yeni kullanıcı oluştur
    const user = userRepo.create({
      supabaseId: randomUUID(),
      email: 'mehmet@epicebuhara.com',
      username: 'mehmet',
      name: 'Mehmet',
      password: hashedPassword,
      role: UserRole.ADMIN,
    })

    const savedUser = await userRepo.save(user)

    // Admin kaydı oluştur
    const admin = adminRepo.create({
      userId: savedUser.id,
      fullName: 'Mehmet Admin',
      permissions: ['*'], // Tam yetki
    })

    await adminRepo.save(admin)

    console.log('✅ Admin kullanıcısı oluşturuldu!')
    console.log('Kullanıcı Adı: mehmet')
    console.log('Şifre: 33333333')
    console.log('Email: mehmet@epicebuhara.com')
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    process.exit(0)
  }
}

createAdmin()
