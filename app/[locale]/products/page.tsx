import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { getTranslations } from '@/lib/i18n'
import { isValidLocale } from '@/lib/i18n'
import { defaultLocale } from '@/i18n'
import { getProductRepository, getCategoryRepository } from '@/lib/db'
import { serializeProducts, serializeCategories } from '@/lib/serialize'
import CategorySidebar from '@/components/CategorySidebar'

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ category?: string; search?: string; page?: string; featured?: string }>
}) {
  const { locale: localeParam } = await params
  const locale = isValidLocale(localeParam) ? localeParam : defaultLocale
  const t = getTranslations(locale)
  const { category, search, page, featured } = await searchParams

  const currentPage = parseInt(page || '1')
  const limit = 24
  const skip = (currentPage - 1) * limit

  let products: any[] = []
  let categories: any[] = []
  let total = 0

  try {
    const productRepo = await getProductRepository()
    const categoryRepo = await getCategoryRepository()

    // Kategorileri getir
    const categoriesData = await categoryRepo.find({
      where: { isActive: true },
      relations: ['parent'],
      order: {
        order: 'ASC',
        name: 'ASC',
      },
    })

    categories = categoriesData.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parent: c.parent ? { id: c.parent.id, name: c.parent.name, slug: c.parent.slug } : null,
    }))

    // Ürünleri getir
    const queryBuilder = productRepo.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isActive = :isActive', { isActive: true })

    if (category) {
      queryBuilder.andWhere('category.slug = :categorySlug', { categorySlug: category })
    }

    if (featured === 'true') {
      queryBuilder.andWhere('product.isFeatured = :isFeatured', { isFeatured: true })
    }

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(product.name) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${search}%` }
      )
    }

    queryBuilder
      .orderBy('product.isFeatured', 'DESC')
      .addOrderBy('product.createdAt', 'DESC')

    // Tüm ürünleri al (gruplama için skip/take kullanmadan)
    const allProductsData = await queryBuilder.getMany()
    
    // TypeORM entity'lerini plain object'e serialize et
    const allProducts = serializeProducts(allProductsData)

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
    
    // Total sayısını güncelle (gruplanmış ürün sayısı)
    total = groupedProducts.length
    
    // Pagination uygula
    products = groupedProducts.slice(skip, skip + limit)
  } catch (error: any) {
    console.error('Products page error:', error)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container mx-auto px-4 py-4 md:py-8">
      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
        {/* Sidebar - Categories */}
        <CategorySidebar
          categories={categories}
          selectedCategory={category || null}
          locale={locale}
          featured={featured || null}
          t={t}
        />

        {/* Products Grid */}
        <div className="flex-1">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              {t.nav.products}
              {category && ` - ${categories.find((c: any) => c.slug === category)?.name || category}`}
              {featured === 'true' && ` - ${t.home.featuredProducts}`}
            </h1>
            
            {/* Search */}
            <form method="get" action={`/${locale}/products`} className="flex gap-2 mb-4">
              <input
                type="text"
                name="search"
                placeholder={t.nav.search}
                defaultValue={search || ''}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
              >
                {t.common.search}
              </button>
              {search && (
                <Link
                  href={`/${locale}/products${category ? `?category=${category}` : ''}`}
                  className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  {t.common.clear || 'Temizle'}
                </Link>
              )}
              {category && (
                <input type="hidden" name="category" value={category} />
              )}
            </form>

            {/* Results count */}
            {total > 0 && (
              <p className="text-gray-600 text-sm">
                {skip + 1}-{Math.min(skip + limit, total)} {t.common.of || 'arası, toplam'} {total} {t.common.items || 'ürün'}
              </p>
            )}
          </div>

          {/* Products */}
          {products.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 mb-8">
                {products.map((product: any) => (
                  <ProductCard key={product.id} product={product} locale={locale} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 flex-wrap">
                  <Link
                    href={`/${locale}/products?page=${currentPage - 1}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}${featured ? `&featured=${featured}` : ''}`}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    ← {t.common.previous || 'Önceki'}
                  </Link>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number
                      if (totalPages <= 5) {
                        pageNum = i + 1
                      } else if (currentPage <= 3) {
                        pageNum = i + 1
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i
                      } else {
                        pageNum = currentPage - 2 + i
                      }

                      return (
                        <Link
                          key={pageNum}
                          href={`/${locale}/products?page=${pageNum}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}${featured ? `&featured=${featured}` : ''}`}
                          className={`px-4 py-2 rounded-lg transition ${
                            currentPage === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      )
                    })}
                  </div>

                  <Link
                    href={`/${locale}/products?page=${currentPage + 1}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}${featured ? `&featured=${featured}` : ''}`}
                    className={`px-4 py-2 rounded-lg transition ${
                      currentPage >= totalPages
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed pointer-events-none'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {t.common.next || 'Sonraki'} →
                  </Link>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-sm">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg mb-4">{t.products.notFound}</p>
              <Link
                href={`/${locale}/products`}
                className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
              >
                {t.common.viewAll || 'Tüm Ürünleri Gör'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

