// .env dosyasını EN ÖNCE yükle - data-source.ts'den önce
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(process.cwd(), '.env.local') })

// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// reflect-metadata EN ÖNCE import edilmeli
import 'reflect-metadata'

// Entity'leri import et - metadata yüklenmesi için
import '../src/database/entities/Category'
import '../src/database/entities/Product'

import { connectDB } from '../src/database/typeorm'
import { getCategoryRepository, getProductRepository } from '../src/database/repositories'

// Slug oluşturma helper
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// SKU oluşturma helper
function createSku(name: string, index: number): string {
  const prefix = name
    .toUpperCase()
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ş/g, 'S')
    .replace(/İ/g, 'I')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6)
  return `BH-${prefix}-${String(index).padStart(3, '0')}`
}

async function seedBaharatProducts() {
  try {
    console.log('🌱 Baharat ürünleri ekleniyor...')

    // Database bağlantısını kur
    await connectDB()
    console.log('✅ Database bağlantısı kuruldu')

    const categoryRepo = await getCategoryRepository()
    const productRepo = await getProductRepository()

    // Kategoriler
    const categories = [
      {
        name: 'Acı Biberler',
        slug: 'aci-biberler',
        description: 'Pul biber, toz biber, isot ve diğer acı biber çeşitleri',
      },
      {
        name: 'Baharat Karışımları',
        slug: 'baharat-karisimlari',
        description: 'Hazır baharat karışımları ve çeşniler',
      },
      {
        name: 'Tatlı Baharatlar',
        slug: 'tatli-baharatlar',
        description: 'Tarçın, vanilya, kakule ve diğer tatlı baharatlar',
      },
      {
        name: 'Kök Baharatlar',
        slug: 'kok-baharatlar',
        description: 'Zencefil, zerdeçal, köri ve kök baharatlar',
      },
      {
        name: 'Yaprak Baharatlar',
        slug: 'yaprak-baharatlar',
        description: 'Defne, kekik, nane, biberiye ve diğer yaprak baharatlar',
      },
      {
        name: 'Tohum Baharatlar',
        slug: 'tohum-baharatlar',
        description: 'Karabiber, kimyon, çemen ve diğer tohum baharatlar',
      },
    ]

    // Kategorileri oluştur
    const createdCategories: any[] = []
    for (const catData of categories) {
      let category = await categoryRepo.findOne({ where: { slug: catData.slug } })
      if (!category) {
        category = categoryRepo.create({
          name: catData.name,
          slug: catData.slug,
          description: catData.description,
          isActive: true,
          order: categories.indexOf(catData),
        })
        category = await categoryRepo.save(category)
        console.log(`✅ Kategori oluşturuldu: ${catData.name}`)
      } else {
        console.log(`ℹ️ Kategori zaten mevcut: ${catData.name}`)
      }
      createdCategories.push(category)
    }

    // Ürünler - Her kategoriden örnek ürünler
    const products = [
      // Acı Biberler
      {
        categoryIndex: 0,
        name: 'Pul Biber (Acı)',
        price: 45.90,
        comparePrice: 55.90,
        stock: 150,
        weight: 250,
        description: 'Özenle seçilmiş acı kırmızı biberlerden öğütülmüş, doğal ve katkısız pul biber. Yemeklerinize lezzet ve renk katar.',
        shortDescription: 'Doğal ve katkısız acı pul biber',
        isFeatured: true,
      },
      {
        categoryIndex: 0,
        name: 'Isot (Urfa Biberi)',
        price: 85.50,
        comparePrice: 95.50,
        stock: 80,
        weight: 250,
        description: 'Şanlıurfa yöresine özgü, hafif acılı ve aromatik isot. Et yemekleri ve salatalar için idealdir.',
        shortDescription: 'Şanlıurfa yöresine özgü isot',
        isFeatured: true,
      },
      {
        categoryIndex: 0,
        name: 'Toz Biber (Tatlı)',
        price: 42.90,
        comparePrice: 52.90,
        stock: 120,
        weight: 250,
        description: 'Tatlı kırmızı biberden öğütülmüş, acı olmayan toz biber. Yemeklerinize doğal kırmızı renk verir.',
        shortDescription: 'Tatlı toz biber',
      },

      // Baharat Karışımları
      {
        categoryIndex: 1,
        name: 'Tavuk Baharatı',
        price: 38.90,
        comparePrice: 48.90,
        stock: 200,
        weight: 100,
        description: 'Tavuk, hindi ve beyaz et yemekleri için özel hazırlanmış baharat karışımı.',
        shortDescription: 'Tavuk yemekleri için özel karışım',
        isFeatured: true,
      },
      {
        categoryIndex: 1,
        name: 'Köfte Baharatı',
        price: 35.90,
        comparePrice: 45.90,
        stock: 180,
        weight: 100,
        description: 'Köfte, kıyma yemekleri ve ızgara etler için ideal baharat karışımı.',
        shortDescription: 'Köfte ve kıyma yemekleri için',
        isFeatured: true,
      },
      {
        categoryIndex: 1,
        name: 'Balık Baharatı',
        price: 39.90,
        comparePrice: 49.90,
        stock: 150,
        weight: 100,
        description: 'Balık ve deniz ürünleri için özel hazırlanmış baharat karışımı.',
        shortDescription: 'Balık yemekleri için özel karışım',
      },

      // Tatlı Baharatlar
      {
        categoryIndex: 2,
        name: 'Tarçın (Toz)',
        price: 65.90,
        comparePrice: 75.90,
        stock: 100,
        weight: 100,
        description: 'Öğütülmüş doğal tarçın. Tatlılar, kekler ve sıcak içecekler için.',
        shortDescription: 'Doğal öğütülmüş tarçın',
        isFeatured: true,
      },
      {
        categoryIndex: 2,
        name: 'Vanilya (Özüt)',
        price: 125.90,
        comparePrice: 145.90,
        stock: 50,
        weight: 50,
        description: 'Doğal vanilya özütü. Pastacılık ve tatlı yapımı için premium kalite.',
        shortDescription: 'Doğal vanilya özütü',
      },
      {
        categoryIndex: 2,
        name: 'Kakule',
        price: 95.90,
        comparePrice: 110.90,
        stock: 60,
        weight: 50,
        description: 'Aromatik ve hafif acı tatlı kakule tohumu. Türk kahvesi ve çay için özeldir.',
        shortDescription: 'Aromatik kakule tohumu',
      },

      // Kök Baharatlar
      {
        categoryIndex: 3,
        name: 'Zencefil (Toz)',
        price: 75.90,
        comparePrice: 85.90,
        stock: 90,
        weight: 100,
        description: 'Kurutulmuş ve öğütülmüş zencefil. Yemekler ve sağlıklı içecekler için.',
        shortDescription: 'Öğütülmüş zencefil',
        isFeatured: true,
      },
      {
        categoryIndex: 3,
        name: 'Zerdeçal (Toz)',
        price: 68.90,
        comparePrice: 78.90,
        stock: 110,
        weight: 100,
        description: 'Doğal zerdeçal tozu. Antioksidan özellikli, yemeklere altın renk verir.',
        shortDescription: 'Doğal zerdeçal tozu',
        isFeatured: true,
      },
      {
        categoryIndex: 3,
        name: 'Köri Tozu',
        price: 58.90,
        comparePrice: 68.90,
        stock: 130,
        weight: 100,
        description: 'Hint mutfağından köri tozu. Et, tavuk ve sebze yemekleri için.',
        shortDescription: 'Hint köri tozu',
      },

      // Yaprak Baharatlar
      {
        categoryIndex: 4,
        name: 'Defne Yaprağı',
        price: 28.90,
        comparePrice: 35.90,
        stock: 250,
        weight: 50,
        description: 'Kurutulmuş defne yaprağı. Et yemekleri, pilav ve çorbalar için.',
        shortDescription: 'Kurutulmuş defne yaprağı',
        isFeatured: true,
      },
      {
        categoryIndex: 4,
        name: 'Kekik (Kuru)',
        price: 45.90,
        comparePrice: 55.90,
        stock: 180,
        weight: 100,
        description: 'Doğal kurutulmuş kekik. Izgara etler, pizzalar ve salatalar için.',
        shortDescription: 'Doğal kuru kekik',
        isFeatured: true,
      },
      {
        categoryIndex: 4,
        name: 'Nane (Kuru)',
        price: 39.90,
        comparePrice: 49.90,
        stock: 200,
        weight: 100,
        description: 'Kurutulmuş nane yaprağı. Çorbalar, salatalar ve içecekler için.',
        shortDescription: 'Kurutulmuş nane',
      },
      {
        categoryIndex: 4,
        name: 'Biberiye',
        price: 48.90,
        comparePrice: 58.90,
        stock: 140,
        weight: 50,
        description: 'Kurutulmuş biberiye. Et yemekleri ve fırın yemekleri için aromatik.',
        shortDescription: 'Kurutulmuş biberiye',
      },

      // Tohum Baharatlar
      {
        categoryIndex: 5,
        name: 'Karabiber (Tane)',
        price: 52.90,
        comparePrice: 62.90,
        stock: 160,
        weight: 100,
        description: 'Kaliteli karabiber tanesi. Taze öğütülerek kullanılır.',
        shortDescription: 'Karabiber tanesi',
        isFeatured: true,
      },
      {
        categoryIndex: 5,
        name: 'Karabiber (Toz)',
        price: 49.90,
        comparePrice: 59.90,
        stock: 170,
        weight: 100,
        description: 'Öğütülmüş karabiber. Hemen kullanıma hazır.',
        shortDescription: 'Öğütülmüş karabiber',
        isFeatured: true,
      },
      {
        categoryIndex: 5,
        name: 'Kimyon',
        price: 42.90,
        comparePrice: 52.90,
        stock: 190,
        weight: 100,
        description: 'Kavrulmuş kimyon tohumu. Et yemekleri ve köfteler için vazgeçilmez.',
        shortDescription: 'Kavrulmuş kimyon',
        isFeatured: true,
      },
      {
        categoryIndex: 5,
        name: 'Çemen Otu',
        price: 55.90,
        comparePrice: 65.90,
        stock: 120,
        weight: 100,
        description: 'Çemen otu tohumu. Pastırma ve bazı özel yemekler için.',
        shortDescription: 'Çemen otu tohumu',
      },
      {
        categoryIndex: 5,
        name: 'Kırmızı Biber Tanesi',
        price: 38.90,
        comparePrice: 48.90,
        stock: 210,
        weight: 100,
        description: 'Kurutulmuş kırmızı biber tanesi. Baharat karışımları ve özel yemekler için.',
        shortDescription: 'Kurutulmuş kırmızı biber tanesi',
      },
    ]

    // Ürünleri oluştur
    let productIndex = 1
    for (const productData of products) {
      const category = createdCategories[productData.categoryIndex]
      const slug = createSlug(productData.name)
      const sku = createSku(productData.name, productIndex)

      let product = await productRepo.findOne({ where: { slug } })
      if (!product) {
        product = productRepo.create({
          name: productData.name,
          slug,
          sku,
          price: productData.price,
          comparePrice: productData.comparePrice,
          stock: productData.stock,
          weight: productData.weight,
          description: productData.description,
          shortDescription: productData.shortDescription,
          categoryId: category.id,
          isActive: true,
          isFeatured: productData.isFeatured || false,
          trackStock: true,
          images: [],
        })
        product = await productRepo.save(product)
        console.log(`✅ Ürün oluşturuldu: ${productData.name} (${category.name})`)
      } else {
        console.log(`ℹ️ Ürün zaten mevcut: ${productData.name}`)
      }
      productIndex++
    }

    console.log('\n✅ Tüm baharat ürünleri başarıyla eklendi!')
    console.log(`📊 Toplam ${categories.length} kategori, ${products.length} ürün eklendi.`)
  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    process.exit(0)
  }
}

seedBaharatProducts()

