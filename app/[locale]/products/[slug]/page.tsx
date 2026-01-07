import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ProductDetailClientWrapper } from '@/components/ProductDetailClientWrapper'
import { ProductImageGallery } from '@/components/ProductImageGallery'
import { getProduct } from '@/lib/api'
import { getTranslations } from '@/lib/i18n'
import { isValidLocale } from '@/lib/i18n'
import { defaultLocale } from '@/i18n'

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: localeParam, slug } = await params
  const locale = isValidLocale(localeParam) ? localeParam : defaultLocale
  const t = getTranslations(locale)

  let product: any = null

  try {
    // API'den ürünü al (variants dahil)
    const data = await getProduct(slug)

    if (!data || !data.product) {
      notFound()
    }

    product = data.product
  } catch (error: any) {
    console.error('Product detail page error:', error)
    notFound()
  }

  const discountPercent = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  return (
    <div className="container mx-auto px-3 py-6">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Product Images */}
        <div className="bg-white rounded-lg shadow-lg p-3 md:p-4">
          <ProductImageGallery 
            images={product.images || []} 
            productName={product.name}
            discountPercent={discountPercent}
          />
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-3 text-gray-900">{product.baseName || product.name}</h1>
          
          {product.category && product.category.slug && (
            <div className="mb-3">
              <Link
                href={`/${locale}/category/${product.category.slug}`}
                className="inline-block px-2.5 py-0.5 bg-primary-100 text-primary-600 rounded-full text-xs font-medium hover:bg-primary-200 transition"
              >
                {product.category.name}
              </Link>
            </div>
          )}

          {/* Short Description */}
          {product.shortDescription && (
            <div className="mb-5 p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-700 leading-relaxed text-sm">{product.shortDescription}</p>
            </div>
          )}

          {/* Price, Stock, Variant Selector ve Add to Cart */}
          <ProductDetailClientWrapper 
            product={product} 
            variants={product.variants} 
            locale={locale}
            discountPercent={discountPercent}
            t={t}
          />

          {/* Product Features */}
          <div className="grid grid-cols-2 gap-3 pt-5 border-t border-gray-200">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl mb-1.5">🚚</div>
              <p className="text-xs text-gray-600 leading-tight">{t.home.freeShipping}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl mb-1.5">↩️</div>
              <p className="text-xs text-gray-600 leading-tight">{t.home.easyReturn}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl mb-1.5">🔒</div>
              <p className="text-xs text-gray-600 leading-tight">{t.home.securePayment}</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xl mb-1.5">✅</div>
              <p className="text-xs text-gray-600 leading-tight">{t.common.guarantee || 'Garanti'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      {product.description && (
        <div className="mt-9 bg-white rounded-lg shadow-lg p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4 pb-3 border-b border-gray-200">{t.product.description}</h2>
          <div
            className="prose prose-sm max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}
    </div>
  )
}

