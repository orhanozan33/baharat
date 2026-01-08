// .env dosyasını EN ÖNCE yükle - data-source.ts'den önce
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// Entity'leri import et - metadata yüklenmesi için
import '../src/database/entities/User'
import '../src/database/entities/Order'
import '../src/database/entities/OrderItem'
import '../src/database/entities/Product'

import { connectDB } from '../src/database/typeorm'
import {
  getUserRepository,
  getOrderRepository,
  getOrderItemRepository,
  getProductRepository,
} from '../src/database/repositories'
import { OrderStatus } from '../src/database/entities/enums/OrderStatus'
import { UserRole } from '../src/database/entities/enums/UserRole'

// Order number generator
function generateOrderNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `ORD-${year}${month}${day}-${random}`
}

async function seedOrders() {
  try {
    console.log('🛒 Siparişler ekleniyor...\n')

    // Database bağlantısını kur
    await connectDB()
    console.log('✅ Database bağlantısı kuruldu\n')

    const userRepo = await getUserRepository()
    const orderRepo = await getOrderRepository()
    const orderItemRepo = await getOrderItemRepository()
    const productRepo = await getProductRepository()

    // Mevcut kullanıcıları al (USER rolünde)
    const users = await userRepo
      .createQueryBuilder('user')
      .where('user.role = :role', { role: UserRole.USER })
      .take(5)
      .getMany()

    if (users.length === 0) {
      console.log('⚠️ Önce kullanıcılar eklenmeli!')
      process.exit(1)
    }

    // Mevcut ürünleri al
    const products = await productRepo.find({
      where: { isActive: true },
      take: 10,
    })

    if (products.length === 0) {
      console.log('⚠️ Önce ürünler eklenmeli!')
      process.exit(1)
    }

    console.log(`📦 ${users.length} kullanıcı, ${products.length} ürün bulundu\n`)

    // Her kullanıcı için 1-3 sipariş oluştur
    const statuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ]

    let orderCount = 0

    for (const user of users) {
      const orderCountForUser = Math.floor(Math.random() * 3) + 1 // 1-3 sipariş

      for (let i = 0; i < orderCountForUser; i++) {
        // Sipariş numarası oluştur
        let orderNumber = generateOrderNumber()
        let existingOrder = await orderRepo.findOne({
          where: { orderNumber },
        })
        while (existingOrder) {
          orderNumber = generateOrderNumber()
          existingOrder = await orderRepo.findOne({ where: { orderNumber } })
        }

        // Rastgele ürünler seç (1-4 ürün)
        const itemCount = Math.floor(Math.random() * 4) + 1
        const selectedProducts = products
          .sort(() => Math.random() - 0.5)
          .slice(0, itemCount)

        // Sipariş kalemlerini hesapla
        let subtotal = 0
        const orderItems = []

        for (const product of selectedProducts) {
          const quantity = Math.floor(Math.random() * 3) + 1 // 1-3 adet
          const price = product.price
          const itemTotal = price * quantity
          subtotal += itemTotal

          orderItems.push({
            productId: product.id,
            product,
            quantity,
            price,
            discount: 0,
            total: itemTotal,
          })
        }

        // Vergi, kargo ve indirim hesapla
        const taxRate = 0.20 // %20 KDV
        const tax = subtotal * taxRate
        const shipping = subtotal >= 500 ? 0 : 25 // 500 TL üzeri ücretsiz kargo
        const discount = 0
        const total = subtotal + tax + shipping - discount

        // Rastgele durum seç
        const status = statuses[Math.floor(Math.random() * statuses.length)]

        // Sipariş oluştur
        const order = orderRepo.create({
          orderNumber,
          userId: user.id,
          status,
          subtotal: Math.round(subtotal * 100) / 100,
          tax: Math.round(tax * 100) / 100,
          shipping: Math.round(shipping * 100) / 100,
          discount: Math.round(discount * 100) / 100,
          total: Math.round(total * 100) / 100,
          currency: 'TRY',
          shippingName: user.name || 'Müşteri',
          shippingPhone: user.phone || '+90 555 000 0000',
          shippingEmail: user.email,
          shippingAddress: user.address || 'Adres belirtilmemiş',
          shippingCity: user.city || 'İstanbul',
          shippingPostalCode: user.postalCode || '34000',
          notes: i === 0 ? 'Lütfen dikkatli paketleyin' : undefined,
          shippedAt:
            status === OrderStatus.SHIPPED || status === OrderStatus.DELIVERED
              ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
              : undefined,
          deliveredAt:
            status === OrderStatus.DELIVERED
              ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000)
              : undefined,
        })

        const savedOrder = await orderRepo.save(order)

        // Sipariş kalemlerini ekle
        for (const item of orderItems) {
          const orderItem = orderItemRepo.create({
            orderId: savedOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            discount: item.discount,
            total: item.total,
          })
          await orderItemRepo.save(orderItem)
        }

        orderCount++
        console.log(
          `  ✅ Sipariş eklendi: ${orderNumber} - ${user.name || user.email} - ${status} - ${total.toFixed(2)} ₺`
        )
      }
    }

    console.log(`\n✅ Toplam ${orderCount} sipariş eklendi!`)
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    process.exit(0)
  }
}

seedOrders()

