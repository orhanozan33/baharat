// reflect-metadata MUST be imported FIRST
import 'reflect-metadata'

// ============================================
// ENTITY IMPORTS - Force metadata loading
// ============================================
// Import entities BEFORE any other imports
// This ensures metadata is loaded before DataSource initialization
import { Product } from '@/src/database/entities/Product'
import { Category } from '@/src/database/entities/Category'

// Force metadata loading
void Product
void Category

// Import database modules AFTER entities
import '@/src/database/data-source'
import '@/src/database/typeorm'
import '@/src/database/repositories'

import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { getTranslations } from '@/lib/i18n'
import { defaultLocale } from '@/i18n'
import { isValidLocale } from '@/lib/i18n'
import { connectDB, getProductRepository, getCategoryRepository } from '@/lib/db'
import { serializeProducts, serializeCategories } from '@/lib/serialize'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = isValidLocale(localeParam) ? localeParam : defaultLocale
  const t = getTranslations(locale)
  
  // Initialize data arrays
  let products: any[] = []
  let categories: any[] = []

  try {
    // Step 1: Connect to database
    await connectDB()
    
    // Step 2: Get repositories
    const productRepo = await getProductRepository()
    const categoryRepo = await getCategoryRepository()

    // Step 3: Fetch data
    const [productsData, categoriesData] = await Promise.all([
      productRepo.find({
        where: { isActive: true },
        relations: ['category'],
        order: {
          isFeatured: 'DESC',
          createdAt: 'DESC',
        },
        take: 20,
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

    // Step 4: Serialize entities to plain objects
    const allProducts = serializeProducts(productsData)
    categories = serializeCategories(categoriesData)

    // Step 5: Sort products
    const sortedProducts = [...allProducts].sort((a: any, b: any) => {
      // Featured first
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      
      // Discounted second
      const aHasDiscount = a.comparePrice && a.comparePrice > a.price
      const bHasDiscount = b.comparePrice && b.comparePrice > b.price
      if (aHasDiscount && !bHasDiscount) return -1
      if (!aHasDiscount && bHasDiscount) return 1
      
      // Newest last
      const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return bDate - aDate
    })
    
    // Step 6: Take first 12 products
    products = sortedProducts.slice(0, 12)
    
  } catch (error: any) {
    console.error('❌ HomePage data fetch error:', error)
    console.error('❌ Error message:', error?.message)
    console.error('❌ Error stack:', error?.stack)
    // On error, use empty arrays
    products = []
    categories = []
  }

  const featuredProducts = products.filter((p: any) => p.isFeatured) || []
  const latestProducts = products.slice(0, 12) || []

  return (
    <div className="w-full">
      {/* Banner Section */}
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

      {/* Featured Products */}
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

      {/* Latest Products */}
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
