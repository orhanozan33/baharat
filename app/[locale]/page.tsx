import 'reflect-metadata'
import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { getTranslations } from '@/lib/i18n'
import { defaultLocale } from '@/i18n'
import { isValidLocale } from '@/lib/i18n'
import { getProductRepository, getCategoryRepository } from '@/lib/db'
import { serializeProducts, serializeCategories } from '@/lib/serialize'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = isValidLocale(localeParam) ? localeParam : defaultLocale
  const t = getTranslations(locale)
  
  // Direkt database'den veri çek (API route kullanmadan)
  let products: any[] = []
  let categories: any[] = []

  try {
    const productRepo = await getProductRepository()
    const categoryRepo = await getCategoryRepository()

    const [productsData, categoriesData] = await Promise.all([
      productRepo.find({
        where: { isActive: true },
        relations: ['category'],
        order: {
          isFeatured: 'DESC',
          createdAt: 'DESC',
        },
      }),
      categoryRepo.find({
        where: { isActive: true },
        relations: ['parent'],
        order: {
          order: 'ASC',
          name: 'ASC',
        },
        take: 16,
      }),
    ])

    // TypeORM entity'lerini plain object'e serialize et
    const allProducts = serializeProducts(productsData)
    categories = serializeCategories(categoriesData)

    // baseName'e göre grupla - aynı baseName'e sahip ürünler için sadece bir tane göster
    const productMap = new Map<string, any>()
    
    for (const product of allProducts) {
      const baseName = product.baseName || product.name
      
      // İndirimli mi kontrol et
      const hasDiscount = product.comparePrice && product.comparePrice > product.price
      
      if (!productMap.has(baseName)) {
        // İlk ürünü al
        productMap.set(baseName, product)
      } else {
        const existing = productMap.get(baseName)
        const existingHasDiscount = existing.comparePrice && existing.comparePrice > existing.price
        
        // Öncelik sırası:
        // 1. İndirimli ürün (comparePrice > price)
        // 2. Fiyatı 0 olmayan ve daha düşük fiyatlı ürün
        // 3. Fiyatı 0 olmayan ürün
        
        if (hasDiscount && !existingHasDiscount) {
          // Yeni ürün indirimli, mevcut değil - yeni ürünü seç
          productMap.set(baseName, product)
        } else if (!hasDiscount && existingHasDiscount) {
          // Mevcut ürün indirimli, yeni değil - mevcut ürünü koru
          // Hiçbir şey yapma
        } else if (hasDiscount && existingHasDiscount) {
          // Her ikisi de indirimli - daha yüksek indirim yüzdesine sahip olanı seç
          const newDiscountPercent = ((product.comparePrice - product.price) / product.comparePrice) * 100
          const existingDiscountPercent = ((existing.comparePrice - existing.price) / existing.comparePrice) * 100
          if (newDiscountPercent > existingDiscountPercent) {
            productMap.set(baseName, product)
          }
        } else {
          // Hiçbiri indirimli değil - en düşük fiyatlı ve fiyatı 0 olmayan olanı seç
          if (product.price > 0 && (existing.price === 0 || product.price < existing.price)) {
            productMap.set(baseName, product)
          } else if (existing.price === 0 && product.price > 0) {
            productMap.set(baseName, product)
          }
        }
      }
    }
    
    // Gruplanmış ürünleri listeye çevir ve sırala
    const groupedProducts = Array.from(productMap.values())
    
    // Sıralama: önce featured, sonra indirimli, sonra createdAt
    groupedProducts.sort((a: any, b: any) => {
      // 1. Featured öncelik
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      
      // 2. İndirimli öncelik
      const aHasDiscount = a.comparePrice && a.comparePrice > a.price
      const bHasDiscount = b.comparePrice && b.comparePrice > b.price
      if (aHasDiscount && !bHasDiscount) return -1
      if (!aHasDiscount && bHasDiscount) return 1
      
      // 3. En son oluşturulan
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    
    // İlk 12 ürünü al (ana sayfa için)
    products = groupedProducts.slice(0, 12)
  } catch (error: any) {
    console.error('HomePage data fetch error:', error)
    // Hata durumunda boş array'ler kullan
  }

  const featuredProducts = products.filter((p: any) => p.isFeatured) || []
  const latestProducts = products.slice(0, 12) || []

  return (
    <div className="w-full">
      {/* Banner Slider Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-6 md:py-12">
        <div className="container mx-auto px-3 md:px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="md:col-span-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 leading-tight">
                {t.home.bestPrice}
              </h2>
              <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6 opacity-90 leading-relaxed">
                {t.home.bestPriceDesc}
              </p>
              <Link
                href={`/${locale}/products`}
                className="inline-block bg-white text-primary-600 px-4 md:px-6 py-2 md:py-3 rounded-lg font-semibold hover:bg-gray-100 active:bg-gray-200 transition text-sm md:text-base touch-manipulation"
              >
                {t.home.startShopping}
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur">
                <p className="text-sm mb-2">{t.home.specialDiscounts}</p>
                <p className="text-3xl font-bold">{t.home.upTo}</p>
                <p className="text-lg mt-2">{t.home.discounts}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Öne Çıkan Ürünler */}
      {featuredProducts.length > 0 && (
        <section className="bg-gray-50 py-4 md:py-8">
          <div className="container mx-auto px-3 md:px-4">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold">{t.home.featuredProducts}</h2>
              <Link
                href={`/${locale}/products?featured=true`}
                className="text-primary-600 hover:underline active:text-primary-700 font-semibold text-sm md:text-base touch-manipulation"
              >
                {t.home.viewAll} →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
              {featuredProducts.slice(0, 6).map((product: any) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Yeni Ürünler */}
      {latestProducts.length > 0 ? (
        <section className="bg-white py-4 md:py-8">
          <div className="container mx-auto px-3 md:px-4">
            <div className="flex justify-between items-center mb-4 md:mb-6">
              <h2 className="text-lg md:text-2xl font-bold">{t.home.newProducts}</h2>
              <Link
                href={`/${locale}/products`}
                className="text-primary-600 hover:underline active:text-primary-700 font-semibold text-sm md:text-base touch-manipulation"
              >
                {t.home.viewAll} →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
              {latestProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="bg-white py-4 md:py-8">
          <div className="container mx-auto px-3 md:px-4 text-center">
            <p className="text-gray-500 text-sm md:text-base">{t.home.noProducts}</p>
          </div>
        </section>
      )}

    </div>
  )
}
