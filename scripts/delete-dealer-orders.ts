import 'reflect-metadata'
import { config } from 'dotenv'
import { resolve } from 'path'

// .env dosyasını yükle - EN ÜSTTE
config({ path: resolve(process.cwd(), '.env') })

// Entity'leri import et - metadata yüklenmesi için
import '../entities/User'
import '../entities/Dealer'
import '../entities/Order'
import '../entities/OrderItem'

import { getConnection } from '../lib/database'
import { getDealerRepository, getOrderRepository, getOrderItemRepository } from '../lib/db'

async function deleteDealerOrders() {
  try {
    await getConnection() // Connection'ı initialize et
    const dealerRepo = await getDealerRepository()
    const orderRepo = await getOrderRepository()
    const orderItemRepo = await getOrderItemRepository()

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

    let totalDeletedOrders = 0
    let totalDeletedItems = 0

    // Orhan Şimşek'in siparişlerini sil
    if (orhanDealer) {
      console.log(`\n📋 Orhan Şimşek dealer bulundu (ID: ${orhanDealer.id})`)
      
      // Bu dealer'a ait tüm siparişleri bul
      const orhanOrders = await orderRepo.find({
        where: { dealerId: orhanDealer.id },
        relations: ['items'],
      })

      console.log(`   Toplam ${orhanOrders.length} sipariş bulundu`)

      if (orhanOrders.length > 0) {
        // Önce sipariş item'larını sil
        for (const order of orhanOrders) {
          if (order.items && order.items.length > 0) {
            await orderItemRepo.remove(order.items)
            totalDeletedItems += order.items.length
          }
        }
        
        // Sonra siparişleri sil
        await orderRepo.remove(orhanOrders)
        totalDeletedOrders += orhanOrders.length
        console.log(`   ✅ ${orhanOrders.length} sipariş ve ${totalDeletedItems} sipariş item'ı silindi`)
      } else {
        console.log('   ⚠️  Silinecek sipariş yok')
      }
    } else {
      console.log('\n⚠️  Orhan Şimşek dealer bulunamadı')
    }

    // Order dealer'ının siparişlerini sil
    if (orderDealer) {
      console.log(`\n📋 Order dealer bulundu (ID: ${orderDealer.id})`)
      
      const orderDealerOrders = await orderRepo.find({
        where: { dealerId: orderDealer.id },
        relations: ['items'],
      })

      console.log(`   Toplam ${orderDealerOrders.length} sipariş bulundu`)

      if (orderDealerOrders.length > 0) {
        let itemsCount = 0
        // Önce sipariş item'larını sil
        for (const order of orderDealerOrders) {
          if (order.items && order.items.length > 0) {
            await orderItemRepo.remove(order.items)
            itemsCount += order.items.length
          }
        }
        
        // Sonra siparişleri sil
        await orderRepo.remove(orderDealerOrders)
        totalDeletedOrders += orderDealerOrders.length
        totalDeletedItems += itemsCount
        console.log(`   ✅ ${orderDealerOrders.length} sipariş ve ${itemsCount} sipariş item'ı silindi`)
      } else {
        console.log('   ⚠️  Silinecek sipariş yok')
      }
    } else {
      console.log('\n⚠️  Order dealer bulunamadı')
    }

    console.log(`\n✅ Toplam ${totalDeletedOrders} sipariş ve ${totalDeletedItems} sipariş item'ı silindi`)
    console.log('\n✨ İşlem tamamlandı!')
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Hata:', error.message)
    console.error(error)
    process.exit(1)
  }
}

deleteDealerOrders()


