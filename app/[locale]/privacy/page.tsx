import { getTranslations } from '@/lib/i18n'
import { isValidLocale } from '@/lib/i18n'
import { defaultLocale } from '@/i18n'

export default async function PrivacyPage({
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
          {t.footer.privacy}
        </h1>
        
        <div className="prose prose-sm sm:prose-base max-w-none text-gray-700 space-y-4 sm:space-y-6">
          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.privacy.introduction}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              {t.privacy.introductionText}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.privacy.dataCollection}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
              {t.privacy.dataCollectionText}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base ml-4">
              <li>{t.privacy.dataCollectionItem1}</li>
              <li>{t.privacy.dataCollectionItem2}</li>
              <li>{t.privacy.dataCollectionItem3}</li>
              <li>{t.privacy.dataCollectionItem4}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.privacy.dataUsage}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
              {t.privacy.dataUsageText}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base ml-4">
              <li>{t.privacy.dataUsageItem1}</li>
              <li>{t.privacy.dataUsageItem2}</li>
              <li>{t.privacy.dataUsageItem3}</li>
              <li>{t.privacy.dataUsageItem4}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.privacy.dataSecurity}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              {t.privacy.dataSecurityText}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.privacy.cookies}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              {t.privacy.cookiesText}
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.privacy.rights}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">
              {t.privacy.rightsText}
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm sm:text-base ml-4">
              <li>{t.privacy.rightsItem1}</li>
              <li>{t.privacy.rightsItem2}</li>
              <li>{t.privacy.rightsItem3}</li>
              <li>{t.privacy.rightsItem4}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mt-6 sm:mt-8 mb-3 sm:mb-4">
              {t.privacy.contact}
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              {t.privacy.contactText}
            </p>
          </section>

          <section className="pt-4 sm:pt-6 border-t border-gray-200">
            <p className="text-xs sm:text-sm text-gray-500">
              {t.privacy.lastUpdated}: {new Date().toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'fr' ? 'fr-FR' : 'en-CA', {
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

