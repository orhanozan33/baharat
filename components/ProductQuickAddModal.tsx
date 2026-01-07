'use client'

import { useState, useEffect } from 'react'
import { showToast } from './Toast'
import { useTranslations } from '@/hooks/useTranslations'

interface ProductQuickAddModalProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice?: number | null
    images?: string[] | null
    stock: number
    unit?: string // 'kg', 'gr', 'adet' vs.
  }
  locale: string
  isOpen: boolean
  onClose: () => void
}

export function ProductQuickAddModal({ product, locale, isOpen, onClose }: ProductQuickAddModalProps) {
  const t = useTranslations()
  
  // Varsayılan birim: kg (kilogram)
  const defaultUnit = product.unit || 'kg'
  const pricePerUnit = product.price // Fiyat birim başına
  
  const [quantity, setQuantity] = useState(1)
  const [priceAmount, setPriceAmount] = useState(pricePerUnit)
  const [wantMore, setWantMore] = useState(false)

  // Modal açıldığında değerleri resetle
  useEffect(() => {
    if (isOpen) {
      setQuantity(1)
      setPriceAmount(pricePerUnit)
      setWantMore(false)
    }
  }, [isOpen, pricePerUnit])

  // Önceden tanımlı miktar seçenekleri
  const predefinedQuantities = [
    { value: 0.5, label: '0.5 Kg', price: pricePerUnit * 0.5 },
    { value: 0.75, label: '0.75 Kg', price: pricePerUnit * 0.75 },
    { value: 1, label: '1 Kg', price: pricePerUnit },
    { value: 1.5, label: '1.5 Kg', price: pricePerUnit * 1.5 },
    { value: 2, label: '2 Kg', price: pricePerUnit * 2 },
  ]

  // Miktar değiştiğinde fiyatı güncelle
  useEffect(() => {
    // Stok kontrolü - stoktan fazla ise stok miktarına sınırla
    if (quantity > product.stock && product.stock > 0) {
      setQuantity(product.stock)
      showToast(
        t('product.maxStockExceeded') || `Maksimum ${product.stock} ${defaultUnit} alabilirsiniz`,
        'warning'
      )
    }
    const finalQuantity = product.stock > 0 ? Math.min(quantity, product.stock) : quantity
    setPriceAmount(Math.round(finalQuantity * pricePerUnit * 100) / 100)
  }, [quantity, pricePerUnit, product.stock, defaultUnit, t])

  const handleAddToCart = () => {
    if (quantity <= 0) {
      showToast(t('product.invalidQuantity') || 'Geçersiz miktar', 'error')
      return
    }

    // Stok kontrolü
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItemIndex = cart.findIndex((item: any) => item.productId === product.id)
    
    // Sepetteki mevcut miktar + yeni eklenecek miktar
    const existingQuantity = existingItemIndex > -1 ? cart[existingItemIndex].quantity : 0
    const totalQuantity = existingQuantity + quantity

    // Stoktan fazla talep edilemez
    if (product.stock > 0 && totalQuantity > product.stock) {
      const availableQuantity = product.stock - existingQuantity
      if (availableQuantity <= 0) {
        showToast(
          t('product.insufficientStock') || `Bu üründen maksimum ${product.stock} ${defaultUnit} alabilirsiniz. Sepetinizde zaten ${existingQuantity} ${defaultUnit} var.`,
          'error'
        )
        return
      }
      showToast(
        t('product.maxStockExceeded') || `Bu üründen maksimum ${product.stock} ${defaultUnit} alabilirsiniz. Sepetinizde ${existingQuantity} ${defaultUnit} var, sadece ${availableQuantity} ${defaultUnit} daha ekleyebilirsiniz.`,
        'error'
      )
      return
    }

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: pricePerUnit, // Birim fiyat
      totalPrice: priceAmount, // Toplam fiyat
      quantity: quantity,
      unit: defaultUnit,
      image: product.images?.[0],
      slug: product.slug,
      maxStock: product.stock, // Stok bilgisini de sakla
    }

    if (existingItemIndex > -1) {
      // Varsa mevcut ürünün miktarını artır
      const newQuantity = cart[existingItemIndex].quantity + quantity
      cart[existingItemIndex].quantity = newQuantity
      cart[existingItemIndex].totalPrice = Math.round(newQuantity * pricePerUnit * 100) / 100
      cart[existingItemIndex].maxStock = product.stock
    } else {
      cart.push(cartItem)
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    
    showToast(
      `${quantity} ${defaultUnit} ${product.name} ${t('cart.added') || 'sepete eklendi!'}`,
      'success'
    )
    
    window.dispatchEvent(new Event('cartUpdated'))
    
    // Modal'ı kapat
    if (!wantMore) {
      onClose()
    } else {
      // "Daha fazla almak istiyorum" seçiliyse modal açık kalır, değerleri sıfırla
      setQuantity(1)
      setPriceAmount(pricePerUnit)
    }
  }

  const handlePredefinedQuantity = (qty: number, price: number) => {
    setQuantity(qty)
    setPriceAmount(price)
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-900">{product.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
          >
            <span className="text-gray-600 text-xl">×</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Ürün Görseli ve Fiyat */}
          <div className="mb-6">
            {product.images && product.images.length > 0 && (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-CA', {
                  style: 'currency',
                  currency: 'CAD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(pricePerUnit)} / {defaultUnit}
              </p>
            </div>
          </div>

          {/* Miktar Seçimi */}
          <div className="mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xl">📦</span>
                </div>
                <div className="flex-1">
                  <input
                    type="range"
                    min="0.1"
                    max={product.stock > 0 ? Math.min(product.stock, 10) : 10}
                    step="0.1"
                    value={Math.min(quantity, product.stock > 0 ? product.stock : quantity)}
                    onChange={(e) => {
                      const newQty = parseFloat(e.target.value)
                      const maxQty = product.stock > 0 ? product.stock : Infinity
                      setQuantity(Math.min(newQty, maxQty))
                    }}
                    className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>
                <div className="flex items-center gap-2 w-32">
                  <input
                    type="number"
                    min="0.1"
                    max={product.stock > 0 ? product.stock : undefined}
                    step="0.1"
                    value={quantity.toFixed(2)}
                    onChange={(e) => {
                      const newQty = parseFloat(e.target.value) || 0.1
                      const maxQty = product.stock > 0 ? product.stock : Infinity
                      const finalQty = Math.min(newQty, maxQty)
                      setQuantity(finalQty)
                      if (newQty > maxQty && product.stock > 0) {
                        showToast(
                          t('product.maxStockExceeded') || `Maksimum ${product.stock} ${defaultUnit} alabilirsiniz`,
                          'warning'
                        )
                      }
                    }}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-gray-600 font-medium">{defaultUnit.toUpperCase()}</span>
                </div>
              </div>
              <div className="text-center text-lg font-semibold text-primary-600">
                {new Intl.NumberFormat('en-CA', {
                  style: 'currency',
                  currency: 'CAD',
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(priceAmount)}
              </div>
            </div>
          </div>

          {/* Önceden Tanımlı Miktarlar */}
          <div className="mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              {t('product.predefinedQuantities') || 'Hızlı Seçim:'}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {predefinedQuantities.map((pq) => (
                <button
                  key={pq.value}
                  onClick={() => handlePredefinedQuantity(pq.value, pq.price)}
                  className={`py-3 px-2 rounded-lg border-2 transition ${
                    quantity === pq.value
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 mb-1">{pq.label}</div>
                  <div className="text-sm text-green-600 font-medium">
                    {new Intl.NumberFormat('en-CA', {
                      style: 'currency',
                      currency: 'CAD',
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(pq.price)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Daha Fazla Almak İstiyorum */}
          <div className="mb-6 flex items-center gap-3">
            <input
              type="checkbox"
              id="wantMore"
              checked={wantMore}
              onChange={(e) => setWantMore(e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="wantMore" className="text-gray-700 cursor-pointer">
              {t('product.wantMore') || 'Daha fazla almak istiyorum'}
            </label>
          </div>

          {/* Sepete Ekle Butonu */}
          <button
            onClick={handleAddToCart}
            disabled={quantity <= 0 || (product.stock > 0 && quantity > product.stock)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 px-6 rounded-lg font-bold text-lg transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
          >
            <span className="text-2xl">📦</span>
            <span>
              {quantity <= 0 || (product.stock > 0 && quantity > product.stock)
                ? (t('product.insufficientStock') || 'Stok yetersiz')
                : (t('product.addQuantityToCart') || 'Miktarı Sepete Ekle')}
            </span>
          </button>

          {/* Stok Bilgisi */}
          <p className="text-center text-sm text-gray-500 mt-4">
            {t('product.stockAvailable') || 'Stokta var'}: {product.stock} {defaultUnit}
          </p>
        </div>
      </div>
    </div>
  )
}

