'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from '@/hooks/useTranslations'
import { showToast } from '@/components/Toast'

interface ProductDetailAddToCartProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice?: number | null
    images?: string[] | null
    stock: number
    unit?: string
    weight?: number
  }
  locale: string
}

export function ProductDetailAddToCart({ product, locale }: ProductDetailAddToCartProps) {
  const t = useTranslations()
  const router = useRouter()

  const handleAddToCartOnly = () => {
    if (product.stock <= 0) {
      showToast(t('product.outOfStock') || 'Stokta yok', 'error')
      return
    }

    // Sepeti al
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItemIndex = cart.findIndex((item: any) => item.productId === product.id)

    if (existingItemIndex > -1) {
      // Ürün zaten sepette, adeti artır (1 adet daha)
      cart[existingItemIndex].quantity += 1
    } else {
      // Yeni ürün ekle - quantity adet olarak 1
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        slug: product.slug,
        quantity: 1, // Adet: 1
        unit: product.unit || 'g',
        weight: product.weight, // Ürünün gramajı (g veya ml)
      })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    showToast(
      `${product.name} ${t('cart.added') || 'sepete eklendi!'}`,
      'success'
    )
    
    // Navbar'daki sepet sayısını güncelle
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      showToast(t('product.outOfStock') || 'Stokta yok', 'error')
      return
    }

    // Sepeti al
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItemIndex = cart.findIndex((item: any) => item.productId === product.id)

    if (existingItemIndex === -1) {
      // Ürün sepette yoksa, 1 adet ekle
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        slug: product.slug,
        quantity: 1, // Adet: 1
        unit: product.unit || 'g',
        weight: product.weight, // Ürünün gramajı (g veya ml)
      })
      localStorage.setItem('cart', JSON.stringify(cart))
      // Navbar'daki sepet sayısını güncelle
      window.dispatchEvent(new Event('cartUpdated'))
    }
    // Ürün sepette varsa, ekleme yapma (zaten var)
    
    // Sepete yönlendir
    router.push(`/${locale}/cart`)
  }

  return (
    <div className="flex gap-3">
      {product.stock > 0 ? (
        <>
          <button
            onClick={handleAddToCartOnly}
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            {t('product.addToCart') || 'Sepete Ekle'}
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {t('product.buy') || 'Satın Al'}
          </button>
        </>
      ) : (
        <button
          disabled
          className="w-full bg-gray-400 text-white px-6 py-3 rounded-lg cursor-not-allowed font-semibold"
        >
          {t('product.outOfStock')}
        </button>
      )}
    </div>
  )
}

