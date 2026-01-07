import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env dosyasını yükle - EN ÜSTTE
config({ path: resolve(process.cwd(), '.env') })

// Entity'leri import et - metadata yüklenmesi için
import '../entities/User'
import '../entities/Dealer'
import '../entities/Payment'

import { getConnection } from '../lib/database'
import { getDealerRepository, getPaymentRepository } from '../lib/db'

async function deleteDealerSales() {
  try {
    await getConnection() // Connection'ı initialize et
    const dealerRepo = await getDealerRepository()
    const paymentRepo = await getPaymentRepository()

    // "Orhan Şimşek" dealer'ını bul
    const orhanDealer = await dealerRepo.findOne({
      where: { companyName: 'Orhan Şimşek' },
      relations: ['user'],
    })

    // "Order" dealer'ını bul
    const orderDealer = await dealerRepo.findOne({
      where: { companyName: 'Order' },
      relations: ['user'],
    })

    if (!orhanDealer && !orderDealer) {
      console.log('❌ Hiçbir dealer bulunamadı')
      process.exit(1)
    }

    let totalDeleted = 0

    // Orhan Şimşek'in payment'larını sil
    if (orhanDealer) {
      console.log(`\n📋 Orhan Şimşek dealer bulundu (ID: ${orhanDealer.id})`)
      
      const orhanPayments = await paymentRepo.find({
        where: { dealerId: orhanDealer.id },
      })

      console.log(`   Toplam ${orhanPayments.length} payment bulundu`)

      if (orhanPayments.length > 0) {
        await paymentRepo.remove(orhanPayments)
        console.log(`   ✅ ${orhanPayments.length} payment silindi`)
        totalDeleted += orhanPayments.length
      } else {
        console.log('   ⚠️  Silinecek payment yok')
      }
    } else {
      console.log('\n⚠️  Orhan Şimşek dealer bulunamadı')
    }

    // Order dealer'ının payment'larını sil
    if (orderDealer) {
      console.log(`\n📋 Order dealer bulundu (ID: ${orderDealer.id})`)
      
      const orderPayments = await paymentRepo.find({
        where: { dealerId: orderDealer.id },
      })

      console.log(`   Toplam ${orderPayments.length} payment bulundu`)

      if (orderPayments.length > 0) {
        await paymentRepo.remove(orderPayments)
        console.log(`   ✅ ${orderPayments.length} payment silindi`)
        totalDeleted += orderPayments.length
      } else {
        console.log('   ⚠️  Silinecek payment yok')
      }
    } else {
      console.log('\n⚠️  Order dealer bulunamadı')
    }

    console.log(`\n✅ Toplam ${totalDeleted} payment silindi`)
    console.log('\n✨ İşlem tamamlandı!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Hata:', error.message)
    console.error(error)
    process.exit(1)
  }
}

deleteDealerSales()

