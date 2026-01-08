// .env dosyasını EN ÖNCE yükle - data-source.ts'den önce
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// Entity'leri import et - metadata yüklenmesi için
import '../src/database/entities/User'
import '../src/database/entities/Admin'
import '../src/database/entities/Dealer'
import '../src/database/entities/Category'
import '../src/database/entities/Product'
import '../src/database/entities/DealerProduct'
import '../src/database/entities/Order'
import '../src/database/entities/OrderItem'

import { connectDB } from '../src/database/typeorm'
import { getUserRepository, getAdminRepository } from '../src/database/repositories'
import { UserRole } from '../src/database/entities/enums/UserRole'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

async function createAdmin() {
  try {
    // Database bağlantısını kur
    await connectDB()
    console.log('✅ Database bağlantısı kuruldu')
    
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
