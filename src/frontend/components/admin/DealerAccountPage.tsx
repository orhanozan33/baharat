'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'
import { formatPrice } from '@/lib/utils'
import OrderDetailModal from '@/components/admin/OrderDetailModal'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface DealerAccountPageProps {
  dealer: any
}

type TabType = 'all' | 'paid' | 'unpaid' | 'settings'

export default function DealerAccountPage({
  dealer: initialDealer,
}: DealerAccountPageProps) {
  const router = useRouter()
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [dealer, setDealer] = useState(initialDealer)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [payments, setPayments] = useState<any[]>([])
  const [checks, setChecks] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Settings form state
  const [companyName, setCompanyName] = useState(dealer.companyName || '')
  const [phone, setPhone] = useState(dealer.phone || '')
  const [address, setAddress] = useState(dealer.address || '')

  const [totalDebt, setTotalDebt] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    setCompanyName(dealer.companyName || '')
    setPhone(dealer.phone || '')
    setAddress(dealer.address || '')
  }, [dealer])

  useEffect(() => {
    if (dealer) {
      loadData()
      loadDebt()
    }
  }, [dealer])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load payments
      const paymentsRes = await fetch(`/api/admin/dealers/${dealer.id}/payments`)
      const paymentsData = await paymentsRes.json()
      setPayments(paymentsData.payments || [])

      // Load checks
      const checksRes = await fetch(`/api/admin/dealers/${dealer.id}/checks`)
      const checksData = await checksRes.json()
      setChecks(checksData.checks || [])

    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDebt = async () => {
    try {
      const ordersRes = await fetch(`/api/admin/orders?dealerId=${dealer.id}&limit=1000`)
      const ordersData = await ordersRes.json()
      const ordersList = ordersData.orders || []
      setOrders(ordersList)
      const debt = ordersList.reduce((sum: number, order: any) => {
        // Only count unpaid orders (PENDING, CONFIRMED, PROCESSING)
        if (['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)) {
          return sum + (order.total || 0)
        }
        return sum
      }, 0)
      setTotalDebt(debt)
    } catch (error) {
      console.error('Load debt error:', error)
    }
  }

  // Calculate totals
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalChecks = checks.filter(c => c.status === 'CLEARED').reduce((sum, c) => sum + c.amount, 0)
  const totalReceived = totalPayments + totalChecks

  // Calculate which orders are paid/unpaid and paid amounts
  const { paidOrders, unpaidOrders, orderPaidAmounts } = useMemo(() => {
    const paid: any[] = []
    const unpaid: any[] = []
    const paidAmounts: Record<string, number> = {}
    
    // Calculate cumulative payments and checks over time
    const paymentChecks = [
      ...payments.map(p => ({ date: new Date(p.paymentDate), amount: p.amount })),
      ...checks.filter(c => c.status === 'CLEARED').map(c => ({ date: new Date(c.dueDate), amount: c.amount }))
    ].sort((a, b) => a.date.getTime() - b.date.getTime())
    
    // Sort orders by date
    const sortedOrders = [...orders].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    
    let cumulativePaid = 0
    let paymentIndex = 0
    
    sortedOrders.forEach(order => {
      const orderTotal = order.total || 0
      
      // Add payments that occurred before or on this order date
      while (paymentIndex < paymentChecks.length) {
        const payment = paymentChecks[paymentIndex]
        if (payment.date <= new Date(order.createdAt)) {
          cumulativePaid += payment.amount
          paymentIndex++
        } else {
          break
        }
      }
      
      // Calculate total of all previous orders including this one
      const ordersUpToThis = sortedOrders.filter(o => new Date(o.createdAt).getTime() <= new Date(order.createdAt).getTime())
      const totalOrdersUpToThis = ordersUpToThis.reduce((sum, o) => sum + (o.total || 0), 0)
      
      // Calculate paid amount for this order
      const previousOrdersTotal = ordersUpToThis.slice(0, -1).reduce((sum, o) => sum + (o.total || 0), 0)
      const paidForPrevious = Math.min(cumulativePaid, previousOrdersTotal)
      const paidForThisOrder = Math.min(cumulativePaid - paidForPrevious, orderTotal)
      paidAmounts[order.id] = paidForThisOrder
      
      // Check if this order is paid (cumulative payments >= total orders up to this point)
      if (cumulativePaid >= totalOrdersUpToThis) {
        paid.push(order)
      } else {
        unpaid.push(order)
      }
    })
    
    return { paidOrders: paid, unpaidOrders: unpaid, orderPaidAmounts: paidAmounts }
  }, [orders, payments, checks])

  // "Order" dealer kontrolü
  const isOrderDealer = dealer.companyName === 'Order'

  // Filter orders based on active tab
  const filteredOrdersByTab = useMemo(() => {
    if (activeTab === 'paid') return paidOrders
    if (activeTab === 'unpaid') return unpaidOrders
    return orders // 'all' shows all orders
  }, [activeTab, orders, paidOrders, unpaidOrders])

  // Filter orders by search term (for Order dealer)
  const filteredOrders = useMemo(() => {
    if (!isOrderDealer || !searchTerm) return filteredOrdersByTab
    const searchLower = searchTerm.toLowerCase()
    return filteredOrdersByTab.filter(order => 
      order.orderNumber?.toLowerCase().includes(searchLower)
    )
  }, [filteredOrdersByTab, searchTerm, isOrderDealer])

  const balance = totalDebt - totalReceived

  // "Order" dealer'ı için toplam satış hesapla
  const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0)
  
  // Ödenmeyen tutar hesapla (unpaid orders için)
  const unpaidAmount = unpaidOrders.reduce((sum, order) => {
    const orderTotal = order.total || 0
    const paidAmount = orderPaidAmounts[order.id] || 0
    return sum + (orderTotal - paidAmount)
  }, 0)
  
  // Aylık ve haftalık satış hesapla
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const weeklySales = orders
    .filter(order => new Date(order.createdAt) >= oneWeekAgo)
    .reduce((sum, order) => sum + (order.total || 0), 0)
  
  const monthlySales = orders
    .filter(order => new Date(order.createdAt) >= oneMonthAgo)
    .reduce((sum, order) => sum + (order.total || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{dealer.companyName}</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{dealer.user?.email}</p>
          </div>
          <button
            onClick={() => router.push('/admin/dealers')}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition touch-manipulation text-sm sm:text-base whitespace-nowrap"
            style={{ minHeight: '44px' }}
          >
            {t.admin.dealerAccount.back}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto mt-4 sm:mt-6 mb-4 sm:mb-6 px-3 sm:px-0">
        <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
          {/* Left Sidebar Menu */}
          <div className="w-full md:w-64 bg-white shadow-lg rounded-lg p-3 sm:p-4 h-fit md:sticky md:top-6">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`w-full text-left px-3 sm:px-4 py-3 rounded-lg font-medium transition touch-manipulation ${
                  activeTab === 'all'
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                }`}
                style={{ minHeight: '44px' }}
              >
                {t.admin.dealerAccount.currentAccount}
              </button>
              {!isOrderDealer && (
                <>
                  <button
                    onClick={() => setActiveTab('paid')}
                    className={`w-full text-left px-3 sm:px-4 py-3 rounded-lg font-medium transition touch-manipulation ${
                      activeTab === 'paid'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {t.admin.dealerAccount.paid}
                  </button>
                  <button
                    onClick={() => setActiveTab('unpaid')}
                    className={`w-full text-left px-3 sm:px-4 py-3 rounded-lg font-medium transition touch-manipulation ${
                      activeTab === 'unpaid'
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {t.admin.dealerAccount.unpaid}
                  </button>
                </>
              )}
              <div className="pt-4 border-t mt-4">
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-3 sm:px-4 py-3 rounded-lg font-medium transition touch-manipulation ${
                    activeTab === 'settings'
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                  style={{ minHeight: '44px' }}
                >
                  {t.admin.dealerAccount.settings}
                </button>
              </div>
            </nav>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 bg-white shadow-lg rounded-lg overflow-hidden">
            {loading ? (
              <div className="text-center py-12">{t.admin.dealerAccount.loading}</div>
            ) : activeTab === 'settings' ? (
              <div className="p-3 sm:p-4 md:p-6">
                <h3 className="font-semibold mb-4 sm:mb-6 text-lg sm:text-xl">{t.admin.dealerAccount.dealerSettings}</h3>
                
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    setSaving(true)
                    try {
                      const response = await fetch(`/api/admin/dealers/${dealer.id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          companyName,
                          phone,
                          address,
                        }),
                      })

                      if (response.ok) {
                        const data = await response.json()
                        setDealer(data.dealer)
                        showToast(t.admin.dealerAccount.dealerUpdated, 'success')
                      } else {
                        const error = await response.json()
                        showToast(error.error || t.admin.dealerAccount.updateFailed, 'error')
                      }
                    } catch (error) {
                      console.error('Update dealer error:', error)
                      showToast(t.admin.dealerAccount.error, 'error')
                    } finally {
                      setSaving(false)
                    }
                  }}
                  className="space-y-4 sm:space-y-6 max-w-2xl"
                >
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.admin.dealerAccount.companyName}
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.admin.dealerAccount.phone}
                    </label>
                    <input
                      type="text"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                    />
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.admin.dealerAccount.address}
                    </label>
                    <textarea
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 sm:flex-none px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation font-medium"
                      style={{ minHeight: '44px' }}
                    >
                      {saving ? t.admin.dealerAccount.saving : t.admin.dealerAccount.save}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCompanyName(dealer.companyName || '')
                        setPhone(dealer.phone || '')
                        setAddress(dealer.address || '')
                      }}
                      className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition touch-manipulation font-medium"
                      style={{ minHeight: '44px' }}
                    >
                      {t.admin.dealerAccount.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!confirm(t.admin.dealerAccount.deleteConfirm)) {
                          return
                        }
                        
                        try {
                          const response = await fetch(`/api/admin/dealers/${dealer.id}`, {
                            method: 'DELETE',
                          })

                          if (response.ok) {
                            showToast(t.admin.dealerAccount.deleted, 'success')
                            router.push('/admin/dealers')
                          } else {
                            const error = await response.json()
                            showToast(error.error || t.admin.dealerAccount.deleteError, 'error')
                          }
                        } catch (error) {
                          console.error('Delete dealer error:', error)
                          showToast(t.admin.dealerAccount.error, 'error')
                        }
                      }}
                      className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      {t.admin.dealerAccount.delete}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
                {/* Summary Cards */}
                {isOrderDealer ? (
                  // "Order" dealer'ı için toplam, aylık ve haftalık satış göster
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">{t.admin.dealerAccount.totalSales}</p>
                      <p className="text-2xl font-bold text-blue-700">{formatPrice(totalSales)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">{t.admin.dealerAccount.monthlySales}</p>
                      <p className="text-2xl font-bold text-green-700">{formatPrice(monthlySales)}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">{t.admin.dealerAccount.weeklySales}</p>
                      <p className="text-2xl font-bold text-yellow-700">{formatPrice(weeklySales)}</p>
                    </div>
                  </div>
                ) : (
                  // Diğer dealer'lar için normal kartlar
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">{t.admin.dealerAccount.total}</p>
                      <p className="text-2xl font-bold text-blue-700">{formatPrice(totalSales)}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">{t.admin.dealerAccount.totalPayments}</p>
                      <p className="text-2xl font-bold text-green-700">{formatPrice(totalPayments)}</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">{t.admin.dealerAccount.remainingBalance}</p>
                      <p className="text-2xl font-bold text-yellow-700">
                        {formatPrice(unpaidAmount)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Orders List */}
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h3 className="font-semibold text-xl">
                      {activeTab === 'paid' ? t.admin.dealerAccount.paidOrders : activeTab === 'unpaid' ? t.admin.dealerAccount.unpaidOrders : t.admin.dealerAccount.orders} ({filteredOrders.length})
                    </h3>
                    {isOrderDealer && (
                      <div className="w-full md:w-64">
                        <input
                          type="text"
                          placeholder={t.admin.dealerAccount.searchPlaceholder}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                        />
                      </div>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3 text-sm font-semibold">{t.admin.dealerAccount.table.orderNo}</th>
                          <th className="text-left p-3 text-sm font-semibold">{t.admin.dealerAccount.table.date}</th>
                          <th className="text-left p-3 text-sm font-semibold">{t.admin.dealerAccount.table.status}</th>
                          <th className="text-left p-3 text-sm font-semibold">{t.admin.dealerAccount.table.amount}</th>
                          <th className="text-left p-3 text-sm font-semibold">{t.admin.dealerAccount.table.productCount}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr 
                            key={order.id} 
                            className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedOrder(order)
                              setIsModalOpen(true)
                            }}
                          >
                            <td className="p-3 font-medium">{order.orderNumber}</td>
                            <td className="p-3">{new Date(order.createdAt).toLocaleDateString('en-CA')}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                (() => {
                                  if (activeTab === 'paid') return 'bg-green-100 text-green-800'
                                  if (activeTab === 'unpaid') return 'bg-yellow-100 text-yellow-800'
                                  if (activeTab === 'all') {
                                    const isPaid = paidOrders.some(po => po.id === order.id)
                                    return isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }
                                  return order.status === 'SHIPPED' ? 'bg-green-100 text-green-800' :
                                         order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                                         order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                         order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                                         order.status === 'CONFIRMED' ? 'bg-purple-100 text-purple-800' :
                                         'bg-yellow-100 text-yellow-800'
                                })()
                              }`}>
                                {(() => {
                                  if (activeTab === 'paid') return t.admin.dealerAccount.status.paid
                                  if (activeTab === 'unpaid') return t.admin.dealerAccount.status.unpaid
                                  if (activeTab === 'all') {
                                    const isPaid = paidOrders.some(po => po.id === order.id)
                                    return isPaid ? t.admin.dealerAccount.status.paid : t.admin.dealerAccount.status.unpaid
                                  }
                                  return order.status === 'SHIPPED' ? t.admin.dealerAccount.status.shipped :
                                         order.status === 'PENDING' ? t.admin.dealerAccount.status.pending :
                                         order.status === 'CONFIRMED' ? t.admin.dealerAccount.status.confirmed :
                                         order.status === 'PROCESSING' ? t.admin.dealerAccount.status.processing :
                                         order.status === 'DELIVERED' ? t.admin.dealerAccount.status.delivered :
                                         order.status === 'CANCELLED' ? t.admin.dealerAccount.status.cancelled : order.status
                                })()}
                              </span>
                            </td>
                            <td className="p-3 font-semibold">{formatPrice(order.total || 0)}</td>
                            <td className="p-3">{order.items?.length || 0}</td>
                          </tr>
                        ))}
                        {filteredOrders.length === 0 && (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-gray-500">
                              {activeTab === 'paid' ? t.admin.dealerAccount.noPaidOrders : activeTab === 'unpaid' ? t.admin.dealerAccount.noUnpaidOrders : t.admin.dealerAccount.noOrders}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedOrder(null)
        }}
        isPaid={selectedOrder ? (orderPaidAmounts[selectedOrder.id] || 0) >= (selectedOrder.total || 0) : false}
        dealerId={dealer.id}
        paidAmount={selectedOrder ? (orderPaidAmounts[selectedOrder.id] || 0) : 0}
        onPaymentAdded={() => {
          loadData()
          loadDebt()
        }}
      />
    </div>
  )
}
