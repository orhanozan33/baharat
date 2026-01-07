'use client'

import { useState, useMemo, memo } from 'react'
import { OrderStatus } from '@/entities/enums/OrderStatus'
import { showToast } from '@/components/Toast'
import OrderDetailModal from '@/components/admin/OrderDetailModal'
import { formatPrice } from '@/lib/utils'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface AdminOrdersContentProps {
  orders: any[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

type TabType = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'CANCELLED'

function AdminOrdersContent({ orders: initialOrders }: AdminOrdersContentProps) {
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
  
  const [orders, setOrders] = useState(initialOrders)
  const [activeTab, setActiveTab] = useState<TabType>('PENDING')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const matchesStatus = order.status === activeTab
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  }), [orders, activeTab, searchTerm])

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: 'PENDING', label: statusLabels.PENDING, count: orders.filter(o => o.status === 'PENDING').length },
    { key: 'CONFIRMED', label: statusLabels.CONFIRMED, count: orders.filter(o => o.status === 'CONFIRMED').length },
    { key: 'SHIPPED', label: statusLabels.SHIPPED, count: orders.filter(o => o.status === 'SHIPPED').length },
    { key: 'CANCELLED', label: statusLabels.CANCELLED, count: orders.filter(o => o.status === 'CANCELLED').length },
  ]

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedOrders = orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
        setOrders(updatedOrders)
        showToast(t.admin.pages.orders.statusUpdated || 'Status updated', 'success')
      } else {
        showToast(t.admin.pages.orders.statusUpdateError || 'Error updating status', 'error')
      }
    } catch (error) {
      console.error('Status update error:', error)
      showToast(t.admin.pages.orders.error, 'error')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.admin.pages.orders.title}</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t.admin.pages.orders.ordersCount.replace('{status}', statusLabels[activeTab]).replace('{count}', filteredOrders.length.toString())}
          </p>
        </div>
      </div>

      {/* Tab'lar */}
      <div className="border-b border-gray-200 mb-4 md:mb-6 overflow-x-auto">
        <nav className="flex space-x-4 md:space-x-8 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab.key
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === tab.key
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Arama */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t.admin.pages.orders.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
        />
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.orders.table.orderNo}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.orders.table.customer}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">{t.admin.pages.orders.table.products}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.orders.table.total}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">{t.admin.pages.orders.table.status}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">{t.admin.pages.orders.table.date}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.orders.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {order.user?.name || '-'}
                      </div>
                      <div className="text-gray-500">{order.user?.email}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600">
                      {order.items?.length || 0} {t.admin.pages.orders.productsCount}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-gray-900">
                      {formatPrice(order.total)}
                    </span>
                  </td>
                  <td className="p-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className={`px-3 py-1 rounded text-xs font-semibold border-0 ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {Object.entries(statusLabels).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => {
                        setSelectedOrder(order)
                        setIsModalOpen(true)
                      }}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      {t.admin.pages.orders.detail}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  {t.admin.pages.orders.notFound}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedOrder(null)
        }}
      />
    </div>
  )
}

export default memo(AdminOrdersContent)
