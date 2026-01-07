import Link from 'next/link'
import { getProductRepository } from '@/lib/db'
import { serializeProducts } from '@/lib/serialize'
import { ProductCard } from '@/components/ProductCard'
import { getTranslations } from '@/lib/i18n'
import { isValidLocale } from '@/lib/i18n'
import { defaultLocale } from '@/i18n'

export default async function NewProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { locale: localeParam } = await params
  const locale = isValidLocale(localeParam) ? localeParam : defaultLocale
  const t = getTranslations(locale)
  const { page } = await searchParams
  const currentPage = parseInt(page || '1')
  const limit = 24
  const skip = (currentPage - 1) * limit

  let products: any[] = []
  let total = 0

  try {
    const productRepo = await getProductRepository()

    // Tüm yeni ürünleri al (gruplama için skip/take kullanmadan)
    const allProductsData = await productRepo.find({
      where: { isActive: true },
      relations: ['category'],
      order: {
        createdAt: 'DESC',
      },
    })

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
        
        // Öncelik sırası: İndirimli > Düşük fiyatlı
        if (hasDiscount && !existingHasDiscount) {
          productMap.set(baseName, product)
        } else if (!hasDiscount && existingHasDiscount) {
          // Mevcut ürün indirimli, yeni değil - mevcut ürünü koru
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
    
    // Gruplanmış ürünleri listeye çevir ve sırala (en yeni önce)
    const groupedProducts = Array.from(productMap.values())
    groupedProducts.sort((a: any, b: any) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    
    // Total sayısını güncelle (gruplanmış ürün sayısı)
    total = groupedProducts.length
    
    // Pagination uygula
    products = groupedProducts.slice(skip, skip + limit)
  } catch (error: any) {
    console.error('New products page error:', error)
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🆕</span>
          <h1 className="text-3xl md:text-4xl font-bold">{t.newProducts.title}</h1>
        </div>
        <p className="text-gray-600">
          {t.newProducts.description || "En son eklenen ürünlerimizi keşfedin"}
        </p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">{t.newProducts.totalNewProducts}</p>
          <p className="text-2xl font-bold text-primary-600">{total}</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Bu Sayfada</p>
          <p className="text-2xl font-bold text-primary-600">
            {products.length}
          </p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <p className="text-gray-600 text-sm mb-1">Sayfa</p>
          <p className="text-2xl font-bold text-primary-600">
            {currentPage} / {totalPages || 1}
          </p>
        </div>
      </div>

      {/* Ürünler */}
      {products.length > 0 ? (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              {skip + 1}-{Math.min(skip + limit, total)} arası, toplam {total}{' '}
              ürün
            </p>
            <Link
              href={`/${locale}/products`}
              className="text-primary-600 hover:underline font-semibold"
            >
              {t.newProducts.viewAllProducts}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Link
                href={`/${locale}/new-products${currentPage > 1 ? `?page=${currentPage - 1}` : ''}`}
                className={`px-4 py-2 rounded-lg ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } transition`}
              >
                ← Önceki
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
                      href={`/${locale}/new-products?page=${pageNum}`}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } transition`}
                    >
                      {pageNum}
                    </Link>
                  )
                })}
              </div>

              <Link
                href={`/${locale}/new-products?page=${currentPage + 1}`}
                className={`px-4 py-2 rounded-lg ${
                  currentPage >= totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                } transition`}
              >
                Sonraki →
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">📦</div>
          <p className="text-gray-500 text-lg mb-2">
            {t.newProducts.noProducts}
          </p>
          <Link
            href={`/${locale}/products`}
            className="text-primary-600 hover:underline font-semibold"
          >
            {t.newProducts.viewAllProducts}
          </Link>
        </div>
      )}
    </div>
  )
}


