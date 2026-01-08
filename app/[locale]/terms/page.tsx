import { getTranslations } from '@/lib/i18n'
import { isValidLocale } from '@/lib/i18n'
import { defaultLocale } from '@/i18n'

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale: localeParam } = await params
  const locale = isValidLocale(localeParam) ? localeParam : defaultLocale
  const t = getTranslations(locale)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-6 sm:mb-8">
          {t.footer.terms}
        </h1>
        
        <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 space-y-4 sm:space-y-6">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.terms.acceptance}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              {t.terms.acceptanceText}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.terms.products}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
              {t.terms.productsText}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base ml-4">
              <li>{t.terms.productsItem1}</li>
              <li>{t.terms.productsItem2}</li>
              <li>{t.terms.productsItem3}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.terms.orders}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
              {t.terms.ordersText}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base ml-4">
              <li>{t.terms.ordersItem1}</li>
              <li>{t.terms.ordersItem2}</li>
              <li>{t.terms.ordersItem3}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.terms.payment}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              {t.terms.paymentText}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.terms.shipping}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              {t.terms.shippingText}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.terms.returns}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              {t.terms.returnsText}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.terms.liability}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              {t.terms.liabilityText}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.terms.changes}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              {t.terms.changesText}
            </p>
          </section>

          <section className="pt-4 sm:pt-6 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500">
              {t.terms.lastUpdated}: {new Date().toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'fr' ? 'fr-FR' : 'en-CA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}


