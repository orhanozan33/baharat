'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'
import { formatPrice } from '@/lib/utils'

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const locale = (params?.locale as string) || 'tr'
  const orderId = params?.id as string
  const t = useTranslations()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Guest order için authentication gerekmiyor
        const response = await fetch(`/api/orders/${orderId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError(t('orders.notFound') || 'Sipariş bulunamadı')
          } else {
            setError(t('orders.error') || 'Sipariş yüklenirken bir hata oluştu')
          }
          return
        }

        const data = await response.json()
        setOrder(data.order)
      } catch (error) {
        console.error('Error fetching order:', error)
        setError(t('orders.error') || 'Sipariş yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrder()
    }
  }, [orderId, t])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-lg">{t('common.loading') || 'Yükleniyor...'}</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">{t('orders.notFound') || 'Sipariş Bulunamadı'}</h1>
        <p className="text-gray-600 mb-6">{error || (t('orders.notFoundDesc') || 'Aradığınız sipariş bulunamadı.')}</p>
        <Link
          href={`/${locale}`}
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
        >
          {t('nav.backToHome') || 'Ana Sayfaya Dön'}
        </Link>
      </div>
    )
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDING: t('orders.status.PENDING') || 'Bekliyor',
      CONFIRMED: t('orders.status.CONFIRMED') || 'Onaylandı',
      PROCESSING: t('orders.status.PROCESSING') || 'Hazırlanıyor',
      SHIPPED: t('orders.status.SHIPPED') || 'Kargoya Verildi',
      DELIVERED: t('orders.status.DELIVERED') || 'Teslim Edildi',
      CANCELLED: t('orders.status.CANCELLED') || 'İptal Edildi',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      PROCESSING: 'bg-purple-100 text-purple-800',
      SHIPPED: 'bg-indigo-100 text-indigo-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colorMap[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Success Message */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">✅</div>
          <div>
            <h2 className="text-xl font-bold text-green-800 mb-1">
              {t('checkout.orderSuccess') || 'Siparişiniz Başarıyla Alındı!'}
            </h2>
            <p className="text-green-700">
              {t('checkout.orderNote') || 'Siparişiniz admin tarafından onaylandıktan sonra size bilgi verilecektir.'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">{t('orders.orderDetail') || 'Sipariş Detayı'}</h1>
            <p className="text-gray-600">
              {t('orders.orderNumber') || 'Sipariş No'}: <span className="font-semibold">{order.orderNumber}</span>
            </p>
          </div>
          <span
            className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(
              order.status
            )}`}
          >
            {getStatusText(order.status)}
          </span>
        </div>

        {order.trackingNumber && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold mb-1">Takip No:</p>
            <p className="text-primary-600 font-mono">{order.trackingNumber}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{t('orders.orderItems') || 'Sipariş Kalemleri'}</h2>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b last:border-0"
                >
                  {item.product?.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.product?.name}</h3>
                    <p className="text-sm text-gray-600">
                      {t('common.items') || 'Adet'}: {item.quantity}
                    </p>
                    <p className="text-primary-600 font-bold">
                      {formatPrice(item.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">{t('checkout.shippingInfo') || 'Teslimat Bilgileri'}</h2>
            <div className="space-y-2 text-sm">
              <p className="font-semibold">{order.shippingName}</p>
              <p>{order.shippingAddress}</p>
              <p>
                {order.shippingCity} {order.shippingProvince && `, ${order.shippingProvince}`} {order.shippingPostalCode}
              </p>
              <p>{order.shippingPhone}</p>
              {order.shippingEmail && (
                <p className="text-gray-600">{order.shippingEmail}</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{t('cart.orderSummary') || 'Fiyat Detayı'}</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t('cart.subtotal') || 'Ara Toplam'}</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('cart.tax') || 'Vergi (GST/HST)'}</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t('cart.shipping') || 'Kargo'}</span>
                <span>
                  {order.shipping === 0 ? (
                    <span className="text-green-600">{t('cart.free') || 'Ücretsiz'}</span>
                  ) : (
                    formatPrice(order.shipping)
                  )}
                </span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('cart.total') || 'Toplam'}</span>
                  <span className="text-primary-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Link
          href={`/${locale}`}
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
        >
          {t('nav.backToHome') || 'Ana Sayfaya Dön'}
        </Link>
      </div>
    </div>
  )
}

