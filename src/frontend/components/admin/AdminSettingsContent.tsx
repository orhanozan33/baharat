'use client'

import { useState } from 'react'
import Link from 'next/link'
import SocialSettingsModal from './SocialSettingsModal'
import ContactSettingsModal from './ContactSettingsModal'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

export default function AdminSettingsContent() {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [socialModalOpen, setSocialModalOpen] = useState(false)
  const [contactModalOpen, setContactModalOpen] = useState(false)

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 md:mb-6">{t.admin.pages.settings.title}</h1>

        <div className="space-y-3 md:space-y-4">
          {/* Makbuz Ayarları Butonu */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{t.admin.pages.settings.receipt.title}</h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t.admin.pages.settings.receipt.description}
                </p>
              </div>
              <Link
                href="/admin/settings/receipt"
                className="px-3 md:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-block text-sm md:text-base whitespace-nowrap w-full sm:w-auto text-center"
              >
                {t.admin.pages.settings.receipt.edit}
              </Link>
            </div>
          </div>

          {/* Sosyal Medya Ayarları Butonu */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{t.admin.pages.settings.social.title}</h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t.admin.pages.settings.social.description}
                </p>
              </div>
              <button
                onClick={() => setSocialModalOpen(true)}
                className="px-3 md:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm md:text-base whitespace-nowrap w-full sm:w-auto"
              >
                {t.admin.pages.settings.social.edit}
              </button>
            </div>
          </div>

          {/* İletişim Ayarları Butonu */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{t.admin.pages.settings.contact.title}</h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t.admin.pages.settings.contact.description}
                </p>
              </div>
              <button
                onClick={() => setContactModalOpen(true)}
                className="px-3 md:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm md:text-base whitespace-nowrap w-full sm:w-auto"
              >
                {t.admin.pages.settings.contact.edit}
              </button>
            </div>
          </div>

          {/* Faturalar Butonu */}
          <div className="border border-gray-200 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">{t.admin.pages.settings.invoices.title}</h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t.admin.pages.settings.invoices.description}
                </p>
              </div>
              <Link
                href="/admin/settings/invoices"
                className="px-3 md:px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-block text-sm md:text-base whitespace-nowrap w-full sm:w-auto text-center"
              >
                {t.admin.pages.settings.invoices.edit}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <SocialSettingsModal
        isOpen={socialModalOpen}
        onClose={() => setSocialModalOpen(false)}
        onSave={() => setSocialModalOpen(false)}
      />

      <ContactSettingsModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSave={() => setContactModalOpen(false)}
      />
    </div>
  )
}

