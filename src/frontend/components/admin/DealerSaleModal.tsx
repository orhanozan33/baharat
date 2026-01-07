'use client'

import { useState, useEffect } from 'react'
import { showToast } from '@/components/Toast'
import { formatPrice } from '@/lib/utils'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface DealerSaleModalProps {
  dealer: any
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface CartItem {
  productId: string
  productName: string
  productSku: string
  pricePerUnit: number // Ürün birim fiyatı
  quantity: number // Adet
  calculatedPrice: number
  productImage?: string
  unit: string // 'g' veya 'ml'
}

type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'CHECK' | 'UNPAID'

export default function DealerSaleModal({
  dealer,
  isOpen,
  onClose,
  onSuccess,
}: DealerSaleModalProps) {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [discount, setDiscount] = useState('0')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UNPAID')
  const [loading, setLoading] = useState(false)
  const [productQuantities, setProductQuantities] = useState<{ [key: string]: string }>({})
  const [taxRates, setTaxRates] = useState({ federalTaxRate: 5, provincialTaxRate: 8 })

  useEffect(() => {
    if (isOpen && dealer) {
      loadProducts()
      loadCategories()
      loadTaxRates()
      resetForm()
    }
  }, [isOpen, dealer])

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
    setPaymentMethod('UNPAID')
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
    // pricePerUnit is product unit price, multiply by quantity
    return pricePerUnit * quantity
  }

  const handleAddToCart = (product: any) => {
    const quantityStr = productQuantities[product.id] || ''
    const quantityNum = parseFloat(quantityStr)

    if (!quantityStr || isNaN(quantityNum) || quantityNum <= 0 || !Number.isInteger(quantityNum)) {
      showToast(t.dealerSale.invalidQuantity, 'warning')
      return
    }

    // Ürün birim fiyatı
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
    showToast(t.dealerSale.addedToCart, 'success')
  }

  const handleRemoveFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index)
    setCart(newCart)
    showToast(t.dealerSale.removedFromCart, 'success')
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
      showToast(t.dealerSale.addToCart, 'warning')
      return
    }

    setLoading(true)
    try {
      const orderNumber = `DEALER-SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
      const subtotal = calculateSubtotal()
      const discountAmount = calculateDiscountAmount()
      const taxes = calculateTaxes()
      const total = calculateTotal()

      const items = cart.map((item) => ({
        productId: item.productId,
        quantity: item.quantity, // Adet
        price: item.pricePerUnit, // Birim fiyat
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
          notes: `Bayi satışı - Ödeme: ${paymentMethod}`,
        }),
      })

      if (!orderResponse.ok) {
        const error = await orderResponse.json()
        throw new Error(error.error || t.dealerSale.orderCreateError)
      }

      const orderData = await orderResponse.json()
      const order = orderData.order

      if (paymentMethod !== 'UNPAID') {
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

      showToast(t.dealerSale.saleCreated, 'success')
      resetForm()
      if (onSuccess) onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Create sale error:', error)
      showToast(error.message || t.dealerSale.saleCreateError, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const subtotal = calculateSubtotal()
  const discountAmount = calculateDiscountAmount()
  const taxes = calculateTaxes()
  const total = calculateTotal()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t.dealerSale.title}</h2>
            <p className="text-sm text-gray-600">{dealer.companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Categories */}
          <div className="w-40 border-r bg-gray-50 overflow-y-auto flex-shrink-0">
            <div className="p-3">
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">{t.dealerSale.categories}</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-2 py-1.5 rounded text-xs transition ${
                    selectedCategory === null
                      ? 'bg-primary-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {t.dealerSale.all}
                </button>
                {categories
                  .filter((cat) => cat.isActive)
                  .map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs transition ${
                        selectedCategory === category.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Middle: Products */}
          <div className="flex-1 flex flex-col overflow-hidden border-r">
            {/* Search */}
            <div className="border-b p-4 flex-shrink-0">
              <input
                type="text"
                placeholder={t.dealerSale.searchProducts}
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Product Cards */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
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

                        {/* Quantity Input */}
                        <div className="space-y-1.5">
                          <input
                            type="number"
                            placeholder={t.dealerSale.quantity}
                            value={quantityValue}
                            onChange={(e) =>
                              setProductQuantities({ ...productQuantities, [product.id]: e.target.value })
                            }
                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                            min="1"
                            step="1"
                          />
                          {calculatedPrice > 0 && (
                            <div className="text-xs text-gray-600 font-medium">
                              {formatPrice(calculatedPrice)}
                            </div>
                          )}
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full bg-primary-600 text-white px-2 py-1 rounded text-xs hover:bg-primary-700 transition"
                          >
                            {t.dealerSale.add}
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  {t.dealerSale.noProductsFound}
                </div>
              )}
            </div>
          </div>

          {/* Right: Cart and Payment */}
          <div className="w-80 bg-gray-50 flex flex-col overflow-hidden">
            {/* Cart */}
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="font-semibold text-gray-900 mb-3">{t.dealerSale.cart} ({cart.length})</h3>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">{t.dealerSale.cartEmpty}</div>
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
                          className="text-red-600 hover:text-red-700 text-lg font-bold flex-shrink-0"
                          title={t.dealerSale.remove}
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          {item.quantity} {t.dealerSale.piece} × {formatPrice(item.pricePerUnit)}
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

            {/* Payment Summary */}
            <div className="border-t bg-white p-4 space-y-3 flex-shrink-0">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t.dealerSale.discount}
                </label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t.dealerSale.paymentMethod}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="UNPAID">{t.dealerSale.unpaid}</option>
                  <option value="CASH">{t.dealerSale.cash}</option>
                  <option value="CREDIT_CARD">{t.dealerSale.creditCard}</option>
                  <option value="CHECK">{t.dealerSale.check}</option>
                </select>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t.dealerSale.subtotal}:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>{t.dealerSale.discountAmount.replace('{discount}', discount)}:</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>{t.dealerSale.federalTax.replace('{rate}', taxRates.federalTaxRate.toString())}:</span>
                  <span>{formatPrice(taxes.federalTax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t.dealerSale.provincialTax.replace('{rate}', taxRates.provincialTaxRate.toString())}:</span>
                  <span>{formatPrice(taxes.provincialTax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>{t.dealerSale.total}:</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  {t.dealerSale.cancel}
                </button>
                <button
                  onClick={handleCreateSale}
                  disabled={loading || cart.length === 0}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
                >
                  {loading ? '...' : t.dealerSale.complete}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
