import Link from 'next/link'
import { getProductRepository } from '@/lib/db'
import { ProductCard } from '@/components/ProductCard'
import { getTranslations } from '@/lib/i18n'
import { isValidLocale } from '@/lib/i18n'
import { defaultLocale } from '@/i18n'
import { serializeProducts } from '@/lib/serialize'

export default async function CampaignsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = isValidLocale(localeParam) ? localeParam : defaultLocale
  const t = getTranslations(locale)

  let campaignProducts: any[] = []

  try {
    const productRepo = await getProductRepository()
    
    // İndirimli ürünleri getir (comparePrice varsa ve comparePrice > price)
    const allProducts = await productRepo.find({
      where: { isActive: true },
      relations: ['category'],
      order: {
        createdAt: 'DESC',
      },
      take: 100,
    })

    // Önce serialize et, sonra filtrele
    const serializedProducts = serializeProducts(allProducts)
    
    // İndirim yüzdesine göre sırala
    campaignProducts = serializedProducts
      .filter((product: any) => {
        if (product.comparePrice && product.price) {
          const discountPercent =
            ((product.comparePrice - product.price) / product.comparePrice) * 100
          return discountPercent > 0
        }
        return false
      })
      .map((product: any) => {
        const discountPercent = product.comparePrice
          ? Math.round(
              ((product.comparePrice - product.price) / product.comparePrice) * 100
            )
          : 0
        return {
          ...product,
          discountPercent,
        }
      })
      .sort((a: any, b: any) => b.discountPercent - a.discountPercent)
  } catch (error: any) {
    console.error('Campaigns page error:', error)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 text-white rounded-2xl p-8 md:p-12 mb-8">
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          {t.campaigns.titleEmoji}
        </h1>
        <p className="text-lg md:text-xl opacity-90 mb-6">
          {t.campaigns.description}
        </p>
        <div className="flex flex-wrap gap-4">
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <p className="text-sm opacity-90">{t.campaigns.total}</p>
            <p className="text-2xl font-bold">
              {campaignProducts.length} {t.campaigns.products}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur rounded-lg px-4 py-2">
            <p className="text-sm opacity-90">{t.campaigns.highestDiscount}</p>
            <p className="text-2xl font-bold">
              %{campaignProducts[0]?.discountPercent || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition">
          {t.campaigns.all}
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">
          {t.campaigns.discount50Plus}
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">
          {t.campaigns.discount30to50}
        </button>
        <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition">
          {t.campaigns.discount20to30}
        </button>
      </div>

      {/* Ürünler Grid */}
      {campaignProducts.length > 0 ? (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-600">
              {campaignProducts.length} {t.campaigns.foundProducts}
            </p>
            <select className="px-4 py-2 border border-gray-300 rounded-lg">
              <option>{t.campaigns.sortBy.highestDiscount}</option>
              <option>{t.campaigns.sortBy.lowestPrice}</option>
              <option>{t.campaigns.sortBy.highestPrice}</option>
              <option>{t.campaigns.sortBy.newest}</option>
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {campaignProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg">
          <div className="text-6xl mb-4">🎁</div>
          <p className="text-gray-500 text-lg mb-2">
            {t.campaigns.noCampaigns}
          </p>
          <Link
            href={`/${locale}/products`}
            className="text-primary-600 hover:underline font-semibold"
          >
            {t.campaigns.viewAllProducts}
          </Link>
        </div>
      )}
    </div>
  )
}


