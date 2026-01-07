'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'
import { formatPrice } from '@/lib/utils'

interface DealerSalePageProps {
  dealer: any
}

interface CartItem {
  productId: string
  productName: string
  productSku: string
  pricePerUnit: number
  quantity: number
  calculatedPrice: number
  productImage?: string
  unit: string
}

type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'CHECK' | 'UNPAID'
type PaymentStatus = 'PAID' | 'UNPAID'

export default function DealerSalePage({ dealer }: DealerSalePageProps) {
  const router = useRouter()
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState('0')
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('UNPAID')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: string }>({})
  const [taxRates, setTaxRates] = useState({ federalTaxRate: 5, provincialTaxRate: 8 })

  useEffect(() => {
    if (dealer) {
      loadProducts()
      loadCategories()
      loadTaxRates()
      resetForm()
    }
  }, [dealer])

  const loadTaxRates = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setTaxRates({
          federalTaxRate: parseFloat(data.settings.federalTaxRate) || 5,
          provincialTaxRate: parseFloat(data.settings.provincialTaxRate) || 8,
        })
      }
    } catch (error) {
      console.error('Load tax rates error:', error)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/products?limit=1000')
      if (response.ok) {
        const data = await response.json()
        setAllProducts(data.products || [])
      }
    } catch (error) {
      console.error('Load products error:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Load categories error:', error)
    }
  }

  const resetForm = () => {
    setProductSearch('')
    setSelectedCategory(null)
    setCart([])
    setDiscount('0')
    setPaymentStatus('UNPAID')
    setPaymentMethod('CASH')
    setShowPaymentMethodModal(false)
    setProductQuantities({})
  }

  const getFilteredProducts = () => {
    let filtered = allProducts.filter((product) => product.isActive)

    if (selectedCategory) {
      filtered = filtered.filter((product) => product.categoryId === selectedCategory)
    }

    if (productSearch) {
      const searchLower = productSearch.toLowerCase()
      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(searchLower) ||
          product.sku?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }

  const filteredProducts = getFilteredProducts()

  const calculatePrice = (pricePerUnit: number, quantity: number): number => {
    return pricePerUnit * quantity
  }

  const handleAddToCart = (product: any) => {
    const quantityStr = productQuantities[product.id] || ''
    const quantityNum = parseFloat(quantityStr)

    if (!quantityStr || isNaN(quantityNum) || quantityNum <= 0 || !Number.isInteger(quantityNum)) {
      showToast('Lütfen geçerli bir adet girin', 'warning')
      return
    }

    const pricePerUnit = product.price || 0
    const calculatedPrice = calculatePrice(pricePerUnit, quantityNum)
    const unit = product.unit || 'g'

    const newItem: CartItem = {
      productId: product.id,
      productName: product.name,
      productSku: product.sku || '',
      pricePerUnit,
      quantity: quantityNum,
      calculatedPrice,
      productImage: product.images?.[0],
      unit,
    }

    setCart([...cart, newItem])
    setProductQuantities({ ...productQuantities, [product.id]: '' })
    showToast('Ürün sepete eklendi', 'success')
  }

  const handleRemoveFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    setCart(newCart)
    showToast('Ürün sepetten kaldırıldı', 'success')
  }

  const calculateSubtotal = (): number => {
    return cart.reduce((sum, item) => sum + item.calculatedPrice, 0)
  }

  const calculateDiscountAmount = (): number => {
    const subtotal = calculateSubtotal()
    const discountPercent = parseFloat(discount) || 0
    return (subtotal * discountPercent) / 100
  }

  const calculateTaxes = () => {
    const subtotal = calculateSubtotal()
    const discountAmount = calculateDiscountAmount()
    const subtotalAfterDiscount = subtotal - discountAmount
    
    const federalTax = (subtotalAfterDiscount * taxRates.federalTaxRate) / 100
    const provincialTax = (subtotalAfterDiscount * taxRates.provincialTaxRate) / 100
    
    return {
      federalTax,
      provincialTax,
      totalTax: federalTax + provincialTax,
    }
  }

  const calculateTotal = (): number => {
    const subtotal = calculateSubtotal()
    const discountAmount = calculateDiscountAmount()
    const { totalTax } = calculateTaxes()
    return subtotal - discountAmount + totalTax
  }

  const handleCreateSale = async () => {
    if (cart.length === 0) {
      showToast('Sepete ürün ekleyin', 'warning')
      return
    }

    setLoading(true)
    try {
      const orderNumber = `ADMIN-SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      const subtotal = calculateSubtotal()
      const discountAmount = calculateDiscountAmount()
      const taxes = calculateTaxes()
      const total = calculateTotal()

      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.pricePerUnit,
        total: item.calculatedPrice,
        sku: item.productSku,
      }))

      const orderResponse = await fetch('/api/admin/dealers/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dealerId: dealer.id,
          orderNumber,
          items,
          subtotal,
          discount: discountAmount,
          tax: taxes.totalTax,
          total,
          shippingName: dealer.companyName,
          shippingPhone: dealer.phone || '',
          shippingAddress: dealer.address || '',
          shippingCity: '',
          shippingPostalCode: '',
          billingName: dealer.companyName,
          billingAddress: dealer.address || '',
          billingTaxNumber: dealer.taxNumber || '',
          notes: `Bayi satışı - Ödeme: ${paymentStatus === 'PAID' ? paymentMethod : 'Ödenmedi'}`,
        }),
      })

      if (!orderResponse.ok) {
        const error = await orderResponse.json()
        throw new Error(error.error || 'Sipariş oluşturulamadı')
      }

      const orderData = await orderResponse.json()
      const order = orderData.order

      if (paymentStatus === 'PAID') {
        const paymentTypeMap: { [key: string]: string } = {
          CASH: 'CASH',
          CREDIT_CARD: 'CREDIT_CARD',
          CHECK: 'CHECK',
        }

        const paymentResponse = await fetch(`/api/admin/dealers/${dealer.id}/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: total,
            type: paymentTypeMap[paymentMethod] || 'CASH',
            paymentDate: new Date().toISOString().split('T')[0],
            description: `Sipariş ödemesi: ${orderNumber}`,
            referenceNumber: orderNumber,
          }),
        })

        if (!paymentResponse.ok) {
          console.error('Payment creation failed')
        }
      }

      showToast('Satış başarıyla oluşturuldu!', 'success')
      router.push('/admin/dealers')
    } catch (error: any) {
      console.error('Create sale error:', error)
      showToast(error.message || 'Satış oluşturulurken hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = calculateSubtotal()
  const discountAmount = calculateDiscountAmount()
  const taxes = calculateTaxes()
  const total = calculateTotal()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Bayi Satışı</h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{dealer.companyName}</p>
          </div>
          <button
            onClick={() => router.push('/admin/dealers')}
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition touch-manipulation text-sm sm:text-base whitespace-nowrap w-full sm:w-auto"
            style={{ minHeight: '44px' }}
          >
            Geri Dön
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto h-[calc(100vh-80px)] flex flex-col md:flex-row overflow-hidden">
        {/* Sol: Kategoriler */}
        <div className="w-full md:w-40 border-r bg-gray-50 overflow-y-auto flex-shrink-0 md:flex-shrink-0">
          <div className="p-3">
            <h3 className="font-semibold text-gray-900 mb-2 text-xs sm:text-sm">Kategoriler</h3>
            <div className="flex md:flex-col gap-2 md:gap-1 overflow-x-auto md:overflow-x-visible">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`flex-shrink-0 md:w-full text-left px-3 md:px-2 py-2 md:py-1.5 rounded text-xs transition touch-manipulation ${
                  selectedCategory === null
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                }`}
                style={{ minHeight: '36px' }}
              >
                Tümü
              </button>
              {categories
                .filter((cat) => cat.isActive)
                .map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex-shrink-0 md:w-full text-left px-3 md:px-2 py-2 md:py-1.5 rounded text-xs transition touch-manipulation ${
                      selectedCategory === category.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                    }`}
                    style={{ minHeight: '36px' }}
                  >
                    {category.name}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Orta: Ürünler */}
        <div className="flex-1 flex flex-col overflow-hidden border-r bg-white">
          {/* Arama */}
          <div className="border-b p-3 sm:p-4 flex-shrink-0">
            <input
              type="text"
              placeholder="Ürün ara..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
            />
          </div>

          {/* Ürün Kartları */}
          <div className="flex-1 overflow-y-auto p-2 sm:p-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {filteredProducts.map((product) => {
                const quantityValue = productQuantities[product.id] || ''
                const quantityNum = parseFloat(quantityValue) || 0
                const calculatedPrice = quantityNum > 0 ? calculatePrice(product.price, quantityNum) : 0

                return (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
                  >
                    {/* Ürün Resmi */}
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg
                            className="w-8 h-8"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Ürün Bilgileri */}
                    <div className="p-2">
                      <div className="font-medium text-xs mb-1 line-clamp-2 min-h-[2rem]">
                        {product.name}
                      </div>
                      <div className="font-semibold text-primary-600 text-xs mb-2">
                        {formatPrice(product.price)}
                      </div>

                      {/* Adet Girişi */}
                      <div className="space-y-1.5">
                        <input
                          type="number"
                          placeholder="Adet"
                          value={quantityValue}
                          onChange={(e) =>
                            setProductQuantities({ ...productQuantities, [product.id]: e.target.value })
                          }
                          className="w-full px-2 py-2 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 touch-manipulation"
                          min="1"
                          step="1"
                          style={{ minHeight: '36px' }}
                        />
                        {calculatedPrice > 0 && (
                          <div className="text-xs text-gray-600 font-medium">
                            {formatPrice(calculatedPrice)}
                          </div>
                        )}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="w-full bg-primary-600 text-white px-2 py-2 rounded text-xs hover:bg-primary-700 active:bg-primary-800 transition touch-manipulation"
                          style={{ minHeight: '36px' }}
                        >
                          Ekle
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                Ürün bulunamadı
              </div>
            )}
          </div>
        </div>

        {/* Sağ: Sepet ve Ödeme */}
        <div className="w-full md:w-80 bg-gray-50 flex flex-col overflow-hidden border-t md:border-t-0">
          {/* Sepet */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
            <h3 className="font-semibold text-gray-900 mb-3">Sepet ({cart.length})</h3>
            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">Sepet boş</div>
            ) : (
              <div className="space-y-3">
                {cart.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex gap-2 mb-2">
                      {item.productImage && (
                        <img
                          src={item.productImage}
                          alt={item.productName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm line-clamp-2">
                          {item.productName}
                        </div>
                        <div className="text-xs text-gray-500">{item.productSku}</div>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(index)}
                        className="text-red-600 hover:text-red-700 active:text-red-800 text-lg font-bold flex-shrink-0 touch-manipulation"
                        title="Kaldır"
                        style={{ minWidth: '32px', minHeight: '32px' }}
                      >
                        ×
                      </button>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        {item.quantity} adet × {formatPrice(item.pricePerUnit)}
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatPrice(item.calculatedPrice)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ödeme Özeti */}
          <div className="border-t bg-white p-3 sm:p-4 space-y-3 flex-shrink-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  İskonto (%)
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                  min="0"
                  max="100"
                  step="0.1"
                  style={{ minHeight: '44px' }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Ödeme Yöntemi
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) => {
                    const status = e.target.value as PaymentStatus
                    setPaymentStatus(status)
                    if (status === 'PAID') {
                      setShowPaymentMethodModal(true)
                    } else {
                      setPaymentMethod('CASH')
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                  style={{ minHeight: '44px' }}
                >
                  <option value="UNPAID">Ödenmedi</option>
                  <option value="PAID">Ödendi</option>
                </select>
              </div>
            </div>
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Ara Toplam:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>İskonto ({discount}%):</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Federal Vergi (GST) ({taxRates.federalTaxRate}%):</span>
                <span>{formatPrice(taxes.federalTax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Eyalet Vergisi (PST/HST) ({taxRates.provincialTaxRate}%):</span>
                <span>{formatPrice(taxes.provincialTax)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Toplam:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => router.push('/admin/dealers')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition touch-manipulation font-medium"
                style={{ minHeight: '44px' }}
              >
                İptal
              </button>
              <button
                onClick={handleCreateSale}
                disabled={loading || cart.length === 0}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition disabled:opacity-50 touch-manipulation font-medium"
                style={{ minHeight: '44px' }}
              >
                {loading ? '...' : 'Tamamla'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Ödeme Yöntemi Seçim Modal */}
      {showPaymentMethodModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
          <div className="bg-white rounded-none md:rounded-lg p-4 sm:p-6 max-w-md w-full h-full md:h-auto">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Ödeme Yöntemi Seçin</h3>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setPaymentMethod('CASH')
                  setShowPaymentMethodModal(false)
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 active:bg-primary-100 transition text-left touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                <span className="font-medium text-gray-900">Nakit</span>
              </button>
              <button
                onClick={() => {
                  setPaymentMethod('CREDIT_CARD')
                  setShowPaymentMethodModal(false)
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 active:bg-primary-100 transition text-left touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                <span className="font-medium text-gray-900">Kart</span>
              </button>
              <button
                onClick={() => {
                  setPaymentMethod('CHECK')
                  setShowPaymentMethodModal(false)
                }}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-primary-600 hover:bg-primary-50 active:bg-primary-100 transition text-left touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                <span className="font-medium text-gray-900">Çek</span>
              </button>
            </div>
            <button
              onClick={() => {
                setPaymentStatus('UNPAID')
                setShowPaymentMethodModal(false)
              }}
              className="mt-4 w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition text-gray-700 touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              İptal
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

