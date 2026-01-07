'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'
import Link from 'next/link'

export default function InvoicesPage() {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [stats, setStats] = useState({
    totalCount: 0,
    totalSubtotal: 0,
    totalTax: 0,
    totalShipping: 0,
    totalDiscount: 0,
    totalAmount: 0,
  })

  useEffect(() => {
    loadInvoices()
  }, [page, search, startDate, endDate])

  const loadInvoices = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      })
      if (search) {
        params.append('search', search)
      }
      if (startDate) {
        params.append('startDate', startDate)
      }
      if (endDate) {
        params.append('endDate', endDate)
      }

      const response = await fetch(`/api/admin/invoices?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.total || 0)
        setStats(data.stats || {
          totalCount: 0,
          totalSubtotal: 0,
          totalTax: 0,
          totalShipping: 0,
          totalDiscount: 0,
          totalAmount: 0,
        })
      }
    } catch (error) {
      console.error('Load invoices error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    loadInvoices()
  }

  const handleDateFilter = () => {
    setPage(1)
    loadInvoices()
  }

  const clearDateFilter = () => {
    setStartDate('')
    setEndDate('')
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 md:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 md:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t.admin.pages.settings.invoices.title}
          </h1>
            <Link
              href="/admin/settings"
              className="px-3 sm:px-4 py-2 text-gray-600 hover:text-gray-900 transition text-sm sm:text-base whitespace-nowrap"
            >
              ← {t.admin.backToSite || 'Geri'}
            </Link>
          </div>

          {/* Search and Date Filter */}
          <div className="mb-4 md:mb-6 space-y-3 md:space-y-4">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Fatura No, Müşteri Adı veya Sipariş No ile ara..."
                className="flex-1 px-3 sm:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button
                type="submit"
                className="px-4 sm:px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm md:text-base whitespace-nowrap"
              >
                Ara
              </button>
            </form>

            {/* Date Range Filter */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-end">
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Başlangıç Tarihi
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  Bitiş Tarihi
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <button
                onClick={handleDateFilter}
                className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm md:text-base whitespace-nowrap w-full sm:w-auto"
              >
                Filtrele
              </button>
              {(startDate || endDate) && (
                <button
                  onClick={clearDateFilter}
                  className="px-4 sm:px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition text-sm md:text-base whitespace-nowrap w-full sm:w-auto"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-4 md:mb-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="text-sm text-blue-600 font-medium">Toplam Fatura</div>
              <div className="text-2xl font-bold text-blue-900 mt-1">{stats.totalCount}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="text-sm text-green-600 font-medium">Ara Toplam</div>
              <div className="text-xl font-bold text-green-900 mt-1">
                {formatPrice(stats.totalSubtotal)}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="text-sm text-yellow-600 font-medium">Vergi</div>
              <div className="text-xl font-bold text-yellow-900 mt-1">
                {formatPrice(stats.totalTax)}
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
              <div className="text-sm text-purple-600 font-medium">Kargo</div>
              <div className="text-xl font-bold text-purple-900 mt-1">
                {formatPrice(stats.totalShipping)}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="text-sm text-red-600 font-medium">İndirim</div>
              <div className="text-xl font-bold text-red-900 mt-1">
                {formatPrice(stats.totalDiscount)}
              </div>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
              <div className="text-sm text-indigo-600 font-medium">Toplam Tutar</div>
              <div className="text-xl font-bold text-indigo-900 mt-1">
                {formatPrice(stats.totalAmount)}
              </div>
            </div>
          </div>

          {/* Stats Info */}
          <div className="mb-6 text-sm text-gray-600">
            Toplam {total} fatura bulundu
            {(startDate || endDate) && (
              <span className="ml-2 text-gray-500">
                (Filtrelenmiş: {stats.totalCount} fatura)
              </span>
            )}
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8">Yükleniyor...</div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Fatura bulunamadı
            </div>
          ) : (
            <>
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <table className="w-full border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                        Fatura No
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">
                        Sipariş No
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">
                        Müşteri / Firma
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-left text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">
                        Tarih
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">
                        Ara Toplam
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">
                        Vergi
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-right text-xs sm:text-sm font-semibold text-gray-700">
                        Toplam
                      </th>
                      <th className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">
                        İşlemler
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => (
                      <tr
                        key={invoice.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-3 text-sm font-medium">
                          {invoice.invoiceNumber}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {invoice.order?.orderNumber || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {invoice.billingName || invoice.customerName || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {new Date(invoice.createdAt).toLocaleDateString(
                            'tr-TR',
                            {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            }
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatPrice(invoice.subtotal)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          {formatPrice(invoice.tax)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">
                          {formatPrice(invoice.total)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Link
                            href={`/admin/invoices/${invoice.id}`}
                            className="px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition text-sm"
                          >
                            Görüntüle
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Önceki
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-600">
                    Sayfa {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

