'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from '@/hooks/useTranslations'
import { showToast } from '@/components/Toast'
import { formatPrice } from '@/lib/utils'

export default function CartPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const t = useTranslations()

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
    setCart(cartData)

    // Cart updated event listener
    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(updatedCart)
    }
    window.addEventListener('cartUpdated', handleCartUpdate)
    return () => window.removeEventListener('cartUpdated', handleCartUpdate)
  }, [])

  const updateCart = (newCart: any[]) => {
    setCart(newCart)
    localStorage.setItem('cart', JSON.stringify(newCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (productId: string) => {
    const newCart = cart.filter((item) => item.productId !== productId)
    updateCart(newCart)
    showToast(t('cart.removed') || 'Ürün sepetten kaldırıldı', 'success')
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(productId)
      return
    }

    // Stok kontrolü için ürün bilgisini API'den al
    try {
      const response = await fetch(`/api/products/by-id/${productId}`)
      if (response.ok) {
        const data = await response.json()
        const product = data.product
        
        // Stok kontrolü - stoktan fazla talep edilemez
        if (product.trackStock && product.stock > 0 && quantity > product.stock) {
          showToast(
            t('product.maxStockExceeded') || `Bu üründen maksimum ${product.stock} ${product.unit || 'g'} alabilirsiniz. Sistem stoktan fazla ürün eklemenize izin vermez.`,
            'error'
          )
          // Miktarı stok miktarına sınırla
          quantity = product.stock
        }
      }
    } catch (error) {
      console.error('Stock check error:', error)
    }

    const newCart = cart.map((item) =>
      item.productId === productId 
        ? { 
            ...item, 
            quantity: Math.max(0.1, quantity), // Minimum 0.1g veya 0.1ml
            maxStock: cart.find((i: any) => i.productId === productId)?.maxStock || item.maxStock
          } 
        : item
    )
    updateCart(newCart)
  }

  const [taxRates, setTaxRates] = useState({ federalTaxRate: 5, provincialTaxRate: 8 })

  useEffect(() => {
    // Vergi oranlarını al
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setTaxRates({
          federalTaxRate: parseFloat(data.settings.federalTaxRate) || 5,
          provincialTaxRate: parseFloat(data.settings.provincialTaxRate) || 8,
        })
      })
      .catch((error) => {
        console.error('Load tax rates error:', error)
      })
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  // Kanada için vergi hesaplama (federal + eyalet)
  const federalTax = (subtotal * taxRates.federalTaxRate) / 100
  const provincialTax = (subtotal * taxRates.provincialTaxRate) / 100
  const tax = federalTax + provincialTax
  const total = subtotal + tax

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast(t('cart.empty') || 'Sepetiniz boş', 'warning')
      return
    }

    // Direkt checkout sayfasına yönlendir - giriş gerektirmiyor
    router.push(`/${locale}/checkout`)
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">{t('cart.title') || 'Sepetim'}</h1>
        <p className="text-gray-600 mb-8">{t('cart.empty') || 'Sepetiniz boş.'}</p>
        <Link
          href={`/${locale}/products`}
          className="inline-block bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition"
        >
          {t('cart.startShopping') || 'Alışverişe Başla'}
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('cart.title') || 'Sepetim'}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.productId}
              className="bg-white rounded-lg shadow p-6 flex gap-4"
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
              ) : (
                <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400">📦</span>
                </div>
              )}
              <div className="flex-1">
                <Link
                  href={`/${locale}/products/${item.slug}`}
                  className="text-lg font-semibold hover:text-primary-600"
                >
                  {item.name}
                </Link>
                <p className="text-primary-600 font-bold mt-2">
                  {new Intl.NumberFormat('en-CA', {
                    style: 'currency',
                    currency: 'CAD',
                  }).format(item.price)}
                </p>
                <div className="flex items-center gap-4 mt-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition"
                      aria-label="Azalt"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      max={item.maxStock > 0 ? item.maxStock : undefined}
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = parseFloat(e.target.value) || 0.1
                        updateQuantity(item.productId, newQty)
                      }}
                      className="w-20 text-center border rounded py-1"
                    />
                    <span className="text-xs text-gray-500">{item.unit || 'g'}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300 transition disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Artır"
                      disabled={item.maxStock > 0 && item.quantity >= item.maxStock}
                    >
                      +
                    </button>
                  </div>
                  {item.maxStock > 0 && (
                    <span className="text-xs text-gray-500">
                      Max: {item.maxStock} {item.unit || 'g'}
                    </span>
                  )}
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-red-600 hover:text-red-700 ml-4 font-medium"
                  >
                    {t('cart.remove') || 'Kaldır'}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">
                  {formatPrice(item.totalPrice || (item.price * item.quantity))}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">{t('cart.orderSummary') || 'Sipariş Özeti'}</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>{t('cart.subtotal') || 'Subtotal'}</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST:</span>
                <span className="font-semibold">{formatPrice(federalTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>PST/HST:</span>
                <span className="font-semibold">{formatPrice(provincialTax)}</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-xl font-bold">
                <span>{t('cart.total') || 'Total'}</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? t('cart.processing') || 'İşleniyor...' : t('cart.completeOrder') || 'Siparişi Tamamla'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

