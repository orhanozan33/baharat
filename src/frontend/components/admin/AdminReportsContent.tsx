'use client'

import { formatPrice } from '@/lib/utils'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface AdminReportsContentProps {
  reportData: {
    totalRevenue: number
    totalOrders: number
    completedOrders: number
    cancelledOrders: number
    averageOrderValue: number
    topProducts: any[]
    salesByStatus: Record<string, number>
  }
}

const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPED', 'CANCELLED']

export default function AdminReportsContent({ reportData }: AdminReportsContentProps) {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  
  const statusLabels: Record<string, string> = {
    PENDING: t.orders.status.PENDING,
    CONFIRMED: t.orders.status.CONFIRMED,
    PROCESSING: t.orders.status.PROCESSING,
    SHIPPED: t.orders.status.SHIPPED,
    DELIVERED: t.orders.status.DELIVERED,
    CANCELLED: t.orders.status.CANCELLED,
  }
  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.admin.pages.reports.title}</h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">{t.admin.pages.reports.description}</p>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-green-500">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">{t.admin.pages.reports.totalRevenue}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {formatPrice(reportData.totalRevenue)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 border-l-4 border-blue-500">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">{t.admin.pages.reports.totalOrders}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{reportData.totalOrders}</p>
        </div>
      </div>

      {/* Sipariş Durumları */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t.admin.pages.reports.statusDistribution}</h2>
        <div className="space-y-3">
          {statusOrder
            .filter(status => statusLabels[status]) // Sadece tanımlı durumları göster
            .map((status) => {
              const count = reportData.salesByStatus[status] || 0
              return (
            <div key={status} className="flex items-center justify-between gap-2 sm:gap-3">
              <span className="text-xs sm:text-sm font-medium text-gray-700 flex-shrink-0">
                {statusLabels[status]}
              </span>
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{
                      width: `${reportData.totalOrders > 0 ? (count / reportData.totalOrders) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-900 w-8 sm:w-12 text-right flex-shrink-0">
                  {count}
                </span>
              </div>
            </div>
              )
            })}
        </div>
      </div>

      {/* En Çok Satan Ürünler */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">{t.admin.pages.reports.topProducts}</h2>
        {reportData.topProducts.length > 0 ? (
          <div className="overflow-x-auto -mx-3 sm:mx-0">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.reports.table.rank}</th>
                  <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.reports.table.product}</th>
                  <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">{t.admin.pages.reports.table.quantitySold}</th>
                  <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.reports.table.price}</th>
                </tr>
              </thead>
              <tbody>
                {reportData.topProducts.map((product: any, index: number) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 sm:p-3 md:p-4">
                      <span className="text-base sm:text-lg font-bold text-primary-600">#{index + 1}</span>
                    </td>
                    <td className="p-2 sm:p-3 md:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {product.images && product.images.length > 0 && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded flex-shrink-0"
                          />
                        )}
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate">{product.name}</span>
                      </div>
                      <div className="sm:hidden text-xs text-gray-600 mt-1">
                        {product.quantitySold || 0} {t.admin.pages.reports.piece}
                      </div>
                    </td>
                    <td className="p-2 sm:p-3 md:p-4 hidden sm:table-cell">
                      <span className="font-semibold text-gray-900 text-xs sm:text-sm">
                        {product.quantitySold || 0} {t.admin.pages.reports.piece}
                      </span>
                    </td>
                    <td className="p-2 sm:p-3 md:p-4">
                      <span className="text-gray-900 text-xs sm:text-sm">
                        {formatPrice(product.price)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">{t.admin.pages.reports.noSalesData}</p>
        )}
      </div>
    </div>
  )
}


