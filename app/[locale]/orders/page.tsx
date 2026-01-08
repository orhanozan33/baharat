'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'

const statusLabels: Record<string, string> = {
  PENDING: 'Beklemede',
  CONFIRMED: 'Onaylandı',
  CANCELLED: 'İptal Edildi',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export default function OrdersPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setOrder(null)

    if (!orderNumber.trim()) {
      setError('Lütfen sipariş numarası girin')
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderNumber.trim())}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sipariş bulunamadı')
      }

      setOrder(data.order)
    } catch (err: any) {
      setError(err.message || 'Sipariş sorgulanırken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sipariş Sorgulama</h1>

        {/* Arama Formu */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Sipariş Numarası
              </label>
              <div className="flex gap-2">
                <input
                  id="orderNumber"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Örn: ORD-1767558260640-YGK2GBJZT"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? 'Sorgulanıyor...' : 'Sorgula'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Sipariş Detayları */}
        {order && (
          <div className="bg-white rounded-lg shadow">
            {/* Sipariş Özeti */}
            <div className="p-6 border-b">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Sipariş Detayı</h2>
                  <p className="text-gray-600">Sipariş No: <span className="font-semibold">{order.orderNumber}</span></p>
                  <p className="text-sm text-gray-500 mt-1">
                    Tarih: {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <span
                  className={`px-4 py-2 rounded-full font-semibold text-sm ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}
                >
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              {order.trackingNumber && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-700">Takip Numarası:</p>
                  <p className="text-primary-600 font-semibold">{order.trackingNumber}</p>
                </div>
              )}
            </div>

            {/* Sipariş Kalemleri */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Kalemleri</h3>
              <div className="space-y-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                    {item.product?.images?.[0] && (
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{item.product?.name || 'Ürün adı bulunamadı'}</h4>
                      {item.sku && (
                        <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">Adet: {item.quantity}</p>
                      <p className="text-primary-600 font-bold mt-1">{formatPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fiyat Özeti */}
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fiyat Özeti</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span className="font-medium">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim:</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                {order.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Vergi:</span>
                    <span className="font-medium">{formatPrice(order.tax)}</span>
                  </div>
                )}
                {order.shipping > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kargo:</span>
                    <span className="font-medium">{formatPrice(order.shipping)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
                  <span>Toplam:</span>
                  <span className="text-primary-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Teslimat Bilgileri */}
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Teslimat Bilgileri</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium text-gray-700">Ad:</span> {order.shippingName}</p>
                <p><span className="font-medium text-gray-700">Telefon:</span> {order.shippingPhone}</p>
                {order.shippingEmail && (
                  <p><span className="font-medium text-gray-700">E-posta:</span> {order.shippingEmail}</p>
                )}
                <p><span className="font-medium text-gray-700">Adres:</span> {order.shippingAddress}</p>
                <p>
                  <span className="font-medium text-gray-700">Şehir:</span> {order.shippingCity}
                  {order.shippingProvince && `, ${order.shippingProvince}`}
                </p>
                {order.shippingPostalCode && (
                  <p><span className="font-medium text-gray-700">Posta Kodu:</span> {order.shippingPostalCode}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}



