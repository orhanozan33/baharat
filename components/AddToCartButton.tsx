'use client'

import { useState } from 'react'
import { showToast } from '@/components/Toast'
import { useTranslations } from '@/hooks/useTranslations'

export function AddToCartButton({ product, locale }: { product: any; locale?: string }) {
  const [quantity, setQuantity] = useState(1)
  const t = useTranslations()

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItemIndex = cart.findIndex((item: any) => item.productId === product.id)

    // Stok kontrolü - sepetteki mevcut miktar + yeni eklenecek miktar
    const existingQuantity = existingItemIndex > -1 ? cart[existingItemIndex].quantity : 0
    const totalQuantity = existingQuantity + quantity

    // Stoktan fazla talep edilemez
    if (product.stock > 0 && totalQuantity > product.stock) {
      const availableQuantity = product.stock - existingQuantity
      if (availableQuantity <= 0) {
        showToast(
          t('product.insufficientStock') || `Bu üründen maksimum ${product.stock} adet alabilirsiniz. Sepetinizde zaten ${existingQuantity} adet var.`,
          'error'
        )
        return
      }
      showToast(
        t('product.maxStockExceeded') || `Bu üründen maksimum ${product.stock} adet alabilirsiniz. Sepetinizde ${existingQuantity} adet var, sadece ${availableQuantity} adet daha ekleyebilirsiniz.`,
        'error'
      )
      return
    }

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += quantity
    } else {
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        slug: product.slug,
        quantity,
        maxStock: product.stock, // Stok bilgisini sakla
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    
    // Modern 3D toast bildirimi
    showToast(
      t('cart.addedToCart') || `${product.name} ${t('cart.added') || 'sepete eklendi!'}`,
      'success'
    )

    // Update cart count in navbar
    window.dispatchEvent(new Event('cartUpdated'))
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <label className="font-semibold">Adet:</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const newQty = parseInt(e.target.value) || 1
              // Stok kontrolü
              if (product.stock > 0 && newQty > product.stock) {
                showToast(
                  t('product.maxStockExceeded') || `Maksimum ${product.stock} adet alabilirsiniz`,
                  'warning'
                )
                setQuantity(product.stock)
                return
              }
              setQuantity(Math.max(1, newQty))
            }}
            min="1"
            max={product.stock > 0 ? product.stock : undefined}
            className="w-16 text-center border rounded"
          />
          <button
            onClick={() => {
              const newQty = quantity + 1
              // Stok kontrolü
              if (product.stock > 0 && newQty > product.stock) {
                showToast(
                  t('product.maxStockExceeded') || `Maksimum ${product.stock} adet alabilirsiniz`,
                  'warning'
                )
                return
              }
              setQuantity(newQty)
            }}
            className="w-8 h-8 bg-gray-200 rounded hover:bg-gray-300"
            disabled={product.stock > 0 && quantity >= product.stock}
          >
            +
          </button>
        </div>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={!product.stock || product.stock === 0}
        className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
      >
        {t('product.addToCart') || 'Sepete Ekle'}
      </button>
    </div>
  )
}


