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
import '../src/database/entities/Settings'

import { connectDB } from '../src/database/typeorm'
import {
  getUserRepository,
  getAdminRepository,
  getDealerRepository,
  getSettingsRepository,
} from '../src/database/repositories'
import { UserRole } from '../src/database/entities/enums/UserRole'
import { randomUUID } from 'crypto'
import bcrypt from 'bcryptjs'

async function seedComplete() {
  try {
    console.log('🌱 Tüm veriler ekleniyor...\n')

    // Database bağlantısını kur
    await connectDB()
    console.log('✅ Database bağlantısı kuruldu\n')

    const userRepo = await getUserRepository()
    const adminRepo = await getAdminRepository()
    const dealerRepo = await getDealerRepository()
    const settingsRepo = await getSettingsRepository()

    // ============================================
    // 1. SETTINGS (Ayarlar)
    // ============================================
    console.log('📋 Ayarlar ekleniyor...')
    const settings = [
      {
        key: 'companyName',
        value: 'Epice Buhara',
      },
      {
        key: 'companyAddress',
        value: '123 Baharat Sokak, İstanbul, Türkiye',
      },
      {
        key: 'companyPhone',
        value: '+1 (514) 726-7067',
      },
      {
        key: 'companyEmail',
        value: 'info@epicebuhara.com',
      },
      {
        key: 'companyTaxNumber',
        value: '1234567890',
      },
      {
        key: 'companyWebsite',
        value: 'https://epicebuhara.com',
      },
      {
        key: 'currency',
        value: 'TRY',
      },
      {
        key: 'currencySymbol',
        value: '₺',
      },
      {
        key: 'taxRate',
        value: '20',
      },
      {
        key: 'shippingCost',
        value: '25.00',
      },
      {
        key: 'freeShippingThreshold',
        value: '500.00',
      },
      {
        key: 'minOrderAmount',
        value: '50.00',
      },
      {
        key: 'siteTitle',
        value: 'Epice Buhara - Modern E-Ticaret Platformu',
      },
      {
        key: 'siteDescription',
        value: 'Binlerce baharat çeşidi ile size en uygun fiyatları sunuyoruz',
      },
      {
        key: 'metaKeywords',
        value: 'baharat, spice, epice, e-ticaret, online shopping',
      },
      {
        key: 'facebookUrl',
        value: 'https://facebook.com/epicebuhara',
      },
      {
        key: 'instagramUrl',
        value: 'https://instagram.com/epicebuhara',
      },
      {
        key: 'twitterUrl',
        value: 'https://twitter.com/epicebuhara',
      },
      {
        key: 'maintenanceMode',
        value: 'false',
      },
      {
        key: 'allowRegistration',
        value: 'true',
      },
    ]

    for (const setting of settings) {
      let existing = await settingsRepo.findOne({ where: { key: setting.key } })
      if (!existing) {
        const newSetting = settingsRepo.create({
          key: setting.key,
          value: setting.value,
        })
        await settingsRepo.save(newSetting)
        console.log(`  ✅ ${setting.key} eklendi`)
      } else {
        console.log(`  ℹ️ ${setting.key} zaten mevcut`)
      }
    }
    console.log('✅ Ayarlar tamamlandı\n')

    // ============================================
    // 2. ÖRNEK KULLANICILAR (Normal USER)
    // ============================================
    console.log('👥 Örnek kullanıcılar ekleniyor...')
    const sampleUsers = [
      {
        email: 'ahmet@example.com',
        username: 'ahmet',
        name: 'Ahmet Yılmaz',
        phone: '+90 555 123 4567',
        address: 'Atatürk Caddesi No:123',
        city: 'İstanbul',
        postalCode: '34000',
        password: '12345678',
      },
      {
        email: 'ayse@example.com',
        username: 'ayse',
        name: 'Ayşe Demir',
        phone: '+90 555 234 5678',
        address: 'Cumhuriyet Bulvarı No:45',
        city: 'Ankara',
        postalCode: '06000',
        password: '12345678',
      },
      {
        email: 'mehmet.customer@example.com',
        username: 'mehmetcustomer',
        name: 'Mehmet Kaya',
        phone: '+90 555 345 6789',
        address: 'İnönü Sokak No:67',
        city: 'İzmir',
        postalCode: '35000',
        password: '12345678',
      },
    ]

    for (const userData of sampleUsers) {
      let existingUser = await userRepo.findOne({
        where: [{ email: userData.email }, { username: userData.username }],
      })

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10)
        const user = userRepo.create({
          supabaseId: randomUUID(),
          email: userData.email,
          username: userData.username,
          name: userData.name,
          phone: userData.phone,
          address: userData.address,
          city: userData.city,
          postalCode: userData.postalCode,
          password: hashedPassword,
          role: UserRole.USER,
        })
        await userRepo.save(user)
        console.log(`  ✅ Kullanıcı eklendi: ${userData.name} (${userData.email})`)
      } else {
        console.log(`  ℹ️ Kullanıcı zaten mevcut: ${userData.email}`)
      }
    }
    console.log('✅ Örnek kullanıcılar tamamlandı\n')

    // ============================================
    // 3. ÖRNEK BAYİLER (Dealer)
    // ============================================
    console.log('🏢 Örnek bayiler ekleniyor...')
    const sampleDealers = [
      {
        email: 'dealer1@example.com',
        username: 'dealer1',
        name: 'Baharat Dünyası A.Ş.',
        companyName: 'Baharat Dünyası A.Ş.',
        taxNumber: '1234567890',
        discountRate: 15,
        phone: '+90 555 111 2233',
        address: 'Sanayi Caddesi No:100',
        city: 'İstanbul',
        postalCode: '34000',
        password: 'dealer123',
      },
      {
        email: 'dealer2@example.com',
        username: 'dealer2',
        name: 'Doğal Baharat Ltd.',
        companyName: 'Doğal Baharat Ltd.',
        taxNumber: '9876543210',
        discountRate: 20,
        phone: '+90 555 222 3344',
        address: 'Ticaret Mahallesi No:200',
        city: 'Ankara',
        postalCode: '06000',
        password: 'dealer123',
      },
    ]

    for (const dealerData of sampleDealers) {
      let existingUser = await userRepo.findOne({
        where: [{ email: dealerData.email }, { username: dealerData.username }],
      })

      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(dealerData.password, 10)
        const user = userRepo.create({
          supabaseId: randomUUID(),
          email: dealerData.email,
          username: dealerData.username,
          name: dealerData.name,
          phone: dealerData.phone,
          address: dealerData.address,
          city: dealerData.city,
          postalCode: dealerData.postalCode,
          password: hashedPassword,
          role: UserRole.DEALER,
        })
        const savedUser = await userRepo.save(user)

        // Dealer kaydı oluştur
        const dealer = dealerRepo.create({
          userId: savedUser.id,
          companyName: dealerData.companyName,
          taxNumber: dealerData.taxNumber,
          discountRate: dealerData.discountRate,
          isActive: true,
          address: dealerData.address,
          phone: dealerData.phone,
          email: dealerData.email,
        })
        await dealerRepo.save(dealer)
        console.log(`  ✅ Bayi eklendi: ${dealerData.companyName} (${dealerData.email})`)
      } else {
        // Kullanıcı var ama dealer kaydı yoksa ekle
        const existingDealer = await dealerRepo.findOne({
          where: { userId: existingUser.id },
        })
        if (!existingDealer) {
          const dealer = dealerRepo.create({
            userId: existingUser.id,
            companyName: dealerData.companyName,
            taxNumber: dealerData.taxNumber,
            discountRate: dealerData.discountRate,
            isActive: true,
            address: dealerData.address,
            phone: dealerData.phone,
            email: dealerData.email,
          })
          await dealerRepo.save(dealer)
          console.log(`  ✅ Bayi kaydı eklendi: ${dealerData.companyName}`)
        } else {
          console.log(`  ℹ️ Bayi zaten mevcut: ${dealerData.companyName}`)
        }
      }
    }
    console.log('✅ Örnek bayiler tamamlandı\n')

    console.log('\n✅ Tüm veriler başarıyla eklendi!')
    console.log('\n📊 Özet:')
    console.log('  • Ayarlar: ✅')
    console.log('  • Örnek kullanıcılar: ✅')
    console.log('  • Örnek bayiler: ✅')
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    process.exit(0)
  }
}

seedComplete()

