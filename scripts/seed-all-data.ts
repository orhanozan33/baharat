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
import '../src/database/entities/Invoice'
import '../src/database/entities/Payment'
import '../src/database/entities/Check'

import { connectDB } from '../src/database/typeorm'
import {
  getCategoryRepository,
  getProductRepository,
  getDealerRepository,
  getDealerProductRepository,
  getOrderRepository,
  getInvoiceRepository,
  getPaymentRepository,
  getCheckRepository,
} from '../src/database/repositories'
import { PaymentType } from '../src/database/entities/Payment'
import { CheckStatus } from '../src/database/entities/Check'

// Placeholder image URLs (Unsplash veya başka bir servis)
const getProductImage = (productName: string, index: number = 0): string => {
  // Ürün adına göre placeholder image
  const images = [
    'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop', // Baharat genel
    'https://images.unsplash.com/photo-1609501676725-7186f3a1f24f?w=500&h=500&fit=crop', // Baharat 2
    'https://images.unsplash.com/photo-1615485925503-6eec6fc37af0?w=500&h=500&fit=crop', // Baharat 3
    'https://images.unsplash.com/photo-1606914509745-6b0c0c0a8a5e?w=500&h=500&fit=crop', // Baharat 4
    'https://images.unsplash.com/photo-1615485500600-0e0c5c0b5a5e?w=500&h=500&fit=crop', // Baharat 5
  ]
  return images[index % images.length]
}

const getCategoryImage = (categoryName: string): string => {
  const categoryImages: { [key: string]: string } = {
    'Acı Biberler': 'https://images.unsplash.com/photo-1609501676725-7186f3a1f24f?w=500&h=500&fit=crop',
    'Baharat Karışımları': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop',
    'Tatlı Baharatlar': 'https://images.unsplash.com/photo-1615485925503-6eec6fc37af0?w=500&h=500&fit=crop',
    'Kök Baharatlar': 'https://images.unsplash.com/photo-1606914509745-6b0c0c0a8a5e?w=500&h=500&fit=crop',
    'Yaprak Baharatlar': 'https://images.unsplash.com/photo-1615485500600-0e0c5c0b5a5e?w=500&h=500&fit=crop',
    'Tohum Baharatlar': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop',
  }
  return categoryImages[categoryName] || 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&h=500&fit=crop'
}

async function seedAllData() {
  try {
    console.log('🔄 Tüm veriler güncelleniyor...\n')

    // Database bağlantısını kur
    await connectDB()
    console.log('✅ Database bağlantısı kuruldu\n')

    const categoryRepo = await getCategoryRepository()
    const productRepo = await getProductRepository()
    const dealerRepo = await getDealerRepository()
    const dealerProductRepo = await getDealerProductRepository()
    const orderRepo = await getOrderRepository()
    const invoiceRepo = await getInvoiceRepository()
    const paymentRepo = await getPaymentRepository()
    const checkRepo = await getCheckRepository()

    // ============================================
    // 1. KATEGORİLERE RESİM EKLE
    // ============================================
    console.log('🖼️ Kategorilere resim ekleniyor...')
    const categories = await categoryRepo.find()
    for (const category of categories) {
      if (!category.image) {
        category.image = getCategoryImage(category.name)
        await categoryRepo.save(category)
        console.log(`  ✅ ${category.name} - resim eklendi`)
      }
    }
    console.log('✅ Kategoriler tamamlandı\n')

    // ============================================
    // 2. ÜRÜNLERE RESİM EKLE
    // ============================================
    console.log('🖼️ Ürünlere resim ekleniyor...')
    const products = await productRepo.find()
    for (let i = 0; i < products.length; i++) {
      const product = products[i]
      if (!product.images || product.images.length === 0) {
        product.images = [getProductImage(product.name, i)]
        await productRepo.save(product)
        console.log(`  ✅ ${product.name} - resim eklendi`)
      }
    }
    console.log('✅ Ürünler tamamlandı\n')

    // ============================================
    // 3. DEALER PRODUCTS (Bayi Özel Fiyatlandırma)
    // ============================================
    console.log('💰 Bayi özel fiyatlandırma ekleniyor...')
    const dealers = await dealerRepo.find({ where: { isActive: true } })
    const activeProducts = await productRepo.find({
      where: { isActive: true },
      take: 10,
    })

    let dealerProductCount = 0
    for (const dealer of dealers) {
      // Her bayi için 5-8 ürüne özel fiyat
      const selectedProducts = activeProducts
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 4) + 5)

      for (const product of selectedProducts) {
        const existing = await dealerProductRepo.findOne({
          where: { dealerId: dealer.id, productId: product.id },
        })

        if (!existing) {
          // Bayi indirim oranına göre fiyat hesapla
          const discountRate = dealer.discountRate || 0
          const dealerPrice = product.price * (1 - discountRate / 100)

          const dealerProduct = dealerProductRepo.create({
            dealerId: dealer.id,
            productId: product.id,
            price: Math.round(dealerPrice * 100) / 100,
            discountRate: discountRate,
            isActive: true,
          })
          await dealerProductRepo.save(dealerProduct)
          dealerProductCount++
        }
      }
    }
    console.log(`✅ ${dealerProductCount} bayi özel fiyat eklendi\n`)

    // ============================================
    // 4. INVOICES (Faturalar)
    // ============================================
    console.log('📄 Faturalar ekleniyor...')
    const orders = await orderRepo.find({
      where: { status: 'CONFIRMED' },
      take: 5,
    })

    let invoiceCount = 0
    for (const order of orders) {
      const existingInvoice = await invoiceRepo.findOne({
        where: { orderId: order.id },
      })

      if (!existingInvoice) {
        const invoiceNumber = `INV-${order.orderNumber.split('-').slice(1).join('-')}`
        const invoice = invoiceRepo.create({
          invoiceNumber,
          orderId: order.id,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          discount: order.discount,
          total: order.total,
          currency: order.currency,
          customerName: order.shippingName,
          customerPhone: order.shippingPhone,
          customerAddress: order.shippingAddress,
          customerCity: order.shippingCity,
          customerPostalCode: order.shippingPostalCode,
          billingName: order.billingName,
          billingAddress: order.billingAddress,
          billingTaxNumber: order.billingTaxNumber,
        })
        await invoiceRepo.save(invoice)
        invoiceCount++
        console.log(`  ✅ Fatura eklendi: ${invoiceNumber}`)
      }
    }
    console.log(`✅ ${invoiceCount} fatura eklendi\n`)

    // ============================================
    // 5. PAYMENTS (Ödemeler)
    // ============================================
    console.log('💳 Ödemeler ekleniyor...')
    let paymentCount = 0
    for (const dealer of dealers) {
      // Her bayi için 2-4 ödeme
      const paymentCountForDealer = Math.floor(Math.random() * 3) + 2

      for (let i = 0; i < paymentCountForDealer; i++) {
        const amount = Math.random() * 5000 + 1000 // 1000-6000 arası
        const paymentTypes = [
          PaymentType.CASH,
          PaymentType.BANK_TRANSFER,
          PaymentType.CREDIT_CARD,
        ]
        const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)]

        const payment = paymentRepo.create({
          dealerId: dealer.id,
          amount: Math.round(amount * 100) / 100,
          type: paymentType,
          paymentDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Son 30 gün içinde
          description: `${paymentType} ödemesi`,
          referenceNumber: `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        })
        await paymentRepo.save(payment)
        paymentCount++
      }
    }
    console.log(`✅ ${paymentCount} ödeme eklendi\n`)

    // ============================================
    // 6. CHECKS (Çekler)
    // ============================================
    console.log('📝 Çekler ekleniyor...')
    let checkCount = 0
    for (const dealer of dealers) {
      // Her bayi için 1-3 çek
      const checkCountForDealer = Math.floor(Math.random() * 3) + 1

      for (let i = 0; i < checkCountForDealer; i++) {
        const amount = Math.random() * 3000 + 500 // 500-3500 arası
        const statuses = [
          CheckStatus.PENDING,
          CheckStatus.DEPOSITED,
          CheckStatus.CLEARED,
        ]
        const status = statuses[Math.floor(Math.random() * statuses.length)]

        const issueDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000)
        const dueDate = new Date(issueDate.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 gün sonra

        const check = checkRepo.create({
          dealerId: dealer.id,
          amount: Math.round(amount * 100) / 100,
          checkNumber: `CHK-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          bankName: ['Ziraat Bankası', 'İş Bankası', 'Garanti BBVA', 'Akbank'][
            Math.floor(Math.random() * 4)
          ],
          issueDate,
          dueDate,
          status,
          notes: status === CheckStatus.PENDING ? 'Beklemede' : undefined,
        })
        await checkRepo.save(check)
        checkCount++
      }
    }
    console.log(`✅ ${checkCount} çek eklendi\n`)

    console.log('\n✅ TÜM VERİLER BAŞARIYLA EKLENDİ!')
    console.log('\n📊 Final Özet:')
    console.log('  • Kategoriler: Resimler eklendi ✅')
    console.log('  • Ürünler: Resimler eklendi ✅')
    console.log(`  • Bayi Özel Fiyatlar: ${dealerProductCount} adet ✅`)
    console.log(`  • Faturalar: ${invoiceCount} adet ✅`)
    console.log(`  • Ödemeler: ${paymentCount} adet ✅`)
    console.log(`  • Çekler: ${checkCount} adet ✅`)
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    process.exit(0)
  }
}

seedAllData()

