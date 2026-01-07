import { getCategory, getProducts } from '@/lib/api'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ProductCard } from '@/components/ProductCard'
import { getTranslations } from '@/lib/i18n'
import { isValidLocale } from '@/lib/i18n'
import { defaultLocale } from '@/i18n'

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale: localeParam, slug } = await params
  const locale = isValidLocale(localeParam) ? localeParam : defaultLocale
  const t = getTranslations(locale)
  
  const categoryData = await getCategory(slug)
  
  if (!categoryData || !categoryData.category) {
    notFound()
  }

  const category = categoryData.category
  const productsData = await getProducts({ category: category.id })

  return (
    <div className="container mx-auto px-3 py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">{category.name}</h1>
      {category.description && (
        <p className="text-gray-600 mb-6 md:mb-8">{category.description}</p>
      )}

      {productsData?.products && productsData.products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
          {productsData.products.map((product: any) => (
            <ProductCard
              key={product.id}
              product={product}
              locale={locale}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 md:py-16">
          <p className="text-gray-500 text-sm md:text-base">
            {t.product.noProducts}
          </p>
        </div>
      )}
    </div>
  )
}

