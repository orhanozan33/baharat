'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface AdminDealersContentProps {
  dealers: any[]
}

export default function AdminDealersContent({ dealers: initialDealers }: AdminDealersContentProps) {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [dealers, setDealers] = useState(initialDealers || [])
  const [searchTerm, setSearchTerm] = useState('')

  // initialDealers değiştiğinde state'i güncelle
  useEffect(() => {
    setDealers(initialDealers || [])
  }, [initialDealers])

  const filteredDealers = dealers.filter((dealer) => {
    if (!dealer) return false
    const nameMatch = dealer.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const emailMatch = dealer.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      dealer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    const taxMatch = dealer.taxNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    return nameMatch || emailMatch || taxMatch
  })

  const handleToggleActive = async (dealer: any) => {
    try {
      const response = await fetch(`/api/admin/dealers/${dealer.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dealer,
          isActive: !dealer.isActive,
        }),
      })

      if (response.ok) {
        setDealers(
          dealers.map((d) =>
            d.id === dealer.id ? { ...d, isActive: !d.isActive } : d
          )
        )
        showToast(t.admin.pages.dealers.actions.statusUpdated, 'success')
      }
    } catch (error) {
      console.error('Toggle error:', error)
      showToast(t.admin.common.actions.error, 'error')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.admin.pages.dealers.title}</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t.admin.pages.dealers.totalDealers.replace('{count}', filteredDealers.length.toString())}
          </p>
        </div>
        <Link
          href="/admin/dealers/new"
          className="bg-primary-600 text-white px-3 md:px-6 py-1.5 md:py-2 rounded-lg hover:bg-primary-700 transition font-medium text-xs md:text-base whitespace-nowrap w-full md:w-auto text-center"
        >
          {t.admin.pages.dealers.addNew}
        </Link>
      </div>

      {/* Arama */}
      <div className="mb-4 md:mb-6">
        <input
          type="text"
          placeholder={t.admin.pages.dealers.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-3 sm:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
        />
      </div>

      {/* Dealers Table */}
      {filteredDealers.length > 0 ? (
        <>
          {/* Mobil Kart Görünümü */}
          <div className="block sm:hidden space-y-3">
            {filteredDealers.map((dealer) => (
              <div key={dealer.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{dealer.companyName}</h3>
                    <p className="text-xs text-gray-600">{dealer.user?.email || dealer.email || '-'}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleToggleActive(dealer)
                    }}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition touch-manipulation ${
                      dealer.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                    style={{ minHeight: '32px' }}
                  >
                    {dealer.isActive ? t.admin.common.status.active : t.admin.common.status.inactive}
                  </button>
                </div>
                <div className="space-y-2 text-xs text-gray-600 mb-3">
                  {dealer.phone && <p><span className="font-medium">Tel:</span> {dealer.phone}</p>}
                  {dealer.taxNumber && <p><span className="font-medium">Vergi No:</span> {dealer.taxNumber}</p>}
                  <p><span className="font-medium">İndirim:</span> <span className="font-semibold text-primary-600">%{Number(dealer.discountRate || 0).toFixed(1)}</span></p>
                </div>
                <div className="flex gap-2 pt-3 border-t">
                  <Link
                    href={`/admin/dealers/${dealer.id}/sale`}
                    className="flex-1 bg-green-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-green-700 active:bg-green-800 transition text-center touch-manipulation"
                    style={{ minHeight: '36px' }}
                  >
                    {t.admin.pages.dealers.actions.makeSale}
                  </Link>
                  <Link
                    href={`/admin/dealers/${dealer.id}/account`}
                    className="flex-1 bg-primary-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-primary-700 active:bg-primary-800 transition text-center touch-manipulation"
                    style={{ minHeight: '36px' }}
                  >
                    {t.admin.pages.dealers.actions.accountDetail}
                  </Link>
                  <Link
                    href={`/admin/settings/dealer?id=${dealer.id}`}
                    className="flex-1 bg-gray-600 text-white px-3 py-2 rounded text-xs font-medium hover:bg-gray-700 active:bg-gray-800 transition text-center touch-manipulation"
                    style={{ minHeight: '36px' }}
                  >
                    {t.admin.pages.settings.dealer.edit || 'Ayarlar'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {/* Desktop Tablo Görünümü */}
          <div className="hidden sm:block overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full min-w-[640px]">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.dealers.table.companyName}</th>
                <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">{t.admin.pages.dealers.table.email}</th>
                <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">{t.admin.pages.dealers.table.phone}</th>
                <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">{t.admin.pages.dealers.table.taxNumber}</th>
                <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.dealers.table.discount}</th>
                <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">{t.admin.pages.dealers.table.status}</th>
                <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.dealers.table.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredDealers.map((dealer) => (
                <tr key={dealer.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 sm:p-3 md:p-4">
                    <span className="font-semibold text-gray-900 text-xs sm:text-sm">{dealer.companyName}</span>
                    <div className="sm:hidden text-xs text-gray-500 mt-1">
                      {dealer.user?.email || dealer.email || '-'}
                    </div>
                  </td>
                  <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">
                    {dealer.user?.email || dealer.email || '-'}
                  </td>
                  <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-gray-600 hidden md:table-cell">
                    {dealer.phone || '-'}
                  </td>
                  <td className="p-2 sm:p-3 md:p-4 text-xs sm:text-sm text-gray-600 hidden lg:table-cell">
                    {dealer.taxNumber || '-'}
                  </td>
                  <td className="p-2 sm:p-3 md:p-4">
                    <span className="font-semibold text-primary-600 text-xs sm:text-sm">
                      %{Number(dealer.discountRate || 0).toFixed(1)}
                    </span>
                  </td>
                  <td className="p-2 sm:p-3 md:p-4 hidden sm:table-cell">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggleActive(dealer)
                      }}
                      className={`px-2 sm:px-3 py-2 sm:py-1 rounded text-xs font-semibold transition touch-manipulation ${
                        dealer.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200 active:bg-green-300'
                          : 'bg-red-100 text-red-800 hover:bg-red-200 active:bg-red-300'
                      }`}
                      style={{ minHeight: '36px' }}
                    >
                      {dealer.isActive ? t.admin.common.status.active : t.admin.common.status.inactive}
                    </button>
                  </td>
                  <td className="p-2 sm:p-3 md:p-4">
                    <div className="flex gap-1 sm:gap-1.5 items-center flex-wrap">
                      <Link
                        href={`/admin/dealers/${dealer.id}/sale`}
                        className="bg-green-600 text-white px-2 sm:px-2 py-2 sm:py-1 rounded text-xs font-medium hover:bg-green-700 active:bg-green-800 transition whitespace-nowrap touch-manipulation"
                        style={{ minHeight: '36px', minWidth: '44px' }}
                      >
                        {t.admin.pages.dealers.actions.makeSale}
                      </Link>
                      <Link
                        href={`/admin/dealers/${dealer.id}/account`}
                        className="bg-primary-600 text-white px-2 sm:px-2 py-2 sm:py-1 rounded text-xs font-medium hover:bg-primary-700 active:bg-primary-800 transition whitespace-nowrap touch-manipulation"
                        style={{ minHeight: '36px', minWidth: '44px' }}
                      >
                        {t.admin.pages.dealers.actions.accountDetail}
                      </Link>
                      <Link
                        href={`/admin/settings/dealer?id=${dealer.id}`}
                        className="bg-gray-600 text-white px-2 sm:px-2 py-2 sm:py-1 rounded text-xs font-medium hover:bg-gray-700 active:bg-gray-800 transition whitespace-nowrap touch-manipulation"
                        style={{ minHeight: '36px', minWidth: '44px' }}
                      >
                        {t.admin.pages.settings.dealer.edit || 'Ayarlar'}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      ) : dealers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">{t.admin.pages.dealers.empty.message}</p>
          <Link
            href="/admin/dealers/new"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition font-medium"
          >
            {t.admin.pages.dealers.empty.addFirst}
          </Link>
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          {t.admin.pages.dealers.noResults}
        </div>
      )}
    </div>
  )
}


