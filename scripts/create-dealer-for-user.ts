import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env dosyasını yükle
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
import { getDealerRepository } from '../lib/db'

async function createDealerForUser() {
  try {
    console.log('🔄 Veritabanı bağlantısı kuruluyor...')
    const connection = await getConnection()
    console.log('✅ Veritabanı bağlantısı başarılı!')

    // DEALER rolündeki kullanıcıları bul
    const dealerUsers = await connection.query(`
      SELECT id, email, name, phone, address
      FROM users
      WHERE role = 'DEALER'
      ORDER BY "createdAt" DESC
    `)

    if (dealerUsers.length === 0) {
      console.log('⚠️ DEALER rolündeki kullanıcı bulunamadı!')
      process.exit(0)
    }

    console.log(`\n📋 ${dealerUsers.length} DEALER rolündeki kullanıcı bulundu\n`)

    const dealerRepo = await getDealerRepository()

    for (const user of dealerUsers) {
      // Bu kullanıcının dealer kaydı var mı kontrol et
      const existingDealer = await connection.query(`
        SELECT id, "companyName"
        FROM dealers
        WHERE "userId" = $1
      `, [user.id])

      if (existingDealer && existingDealer.length > 0) {
        console.log(`✅ ${user.email} için dealer kaydı zaten var: ${existingDealer[0].companyName}`)
        continue
      }

      // Dealer kaydı oluştur
      console.log(`📝 ${user.email} için dealer kaydı oluşturuluyor...`)

      const newDealer = dealerRepo.create({
        userId: user.id,
        companyName: user.name || user.email.split('@')[0] || 'Firma Adı',
        taxNumber: null,
        discountRate: 0,
        isActive: true,
        address: user.address || null,
        phone: user.phone || null,
        email: user.email || null,
      })

      const savedDealer = await dealerRepo.save(newDealer)
      console.log(`✅ Dealer kaydı oluşturuldu!`)
      console.log(`   ID: ${savedDealer.id}`)
      console.log(`   Firma Adı: ${savedDealer.companyName}`)
      console.log(`   Email: ${savedDealer.email}`)
      console.log(`   Aktif: ${savedDealer.isActive}\n`)
    }

    console.log('✅ İşlem tamamlandı!')

    if (connection.isInitialized) {
      await connection.destroy()
    }
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Hata:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

createDealerForUser()

