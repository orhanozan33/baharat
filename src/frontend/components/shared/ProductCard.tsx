'use client'

import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'
import { showToast } from '@/components/Toast'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    comparePrice?: number | null
    images?: string[] | null
    baseName?: string | null
    stock: number
    isFeatured?: boolean
    unit?: string
  }
  locale: string
}

export function ProductCard({ product, locale }: ProductCardProps) {
  const t = useTranslations()
  
  const discountPercent = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (product.stock <= 0) {
      showToast(t('product.outOfStock') || 'Stokta yok', 'error')
      return
    }

    // Sepeti al
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItemIndex = cart.findIndex((item: any) => item.productId === product.id)

    if (existingItemIndex > -1) {
      // Ürün zaten sepette, miktarı artır
      cart[existingItemIndex].quantity += 1
    } else {
      // Yeni ürün ekle
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.images?.[0],
        slug: product.slug,
        quantity: 1,
        unit: product.unit || 'g',
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

  return (
    <div className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg active:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Ürün Görseli */}
      <Link 
        href={`/${locale}/products/${product.slug}`} 
        className="block touch-manipulation"
        onClick={(e) => {
          // Eğer butona tıklanmışsa, link'i takip etme
          const target = e.target as HTMLElement
          if (target.closest('button')) {
            e.preventDefault()
          }
        }}
      >
        <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
          {product.images && product.images.length > 0 && product.images[0] ? (
            <>
              <img
                src={product.images[0].startsWith('http') || product.images[0].startsWith('/') 
                  ? product.images[0] 
                  : `/${product.images[0]}`}
                alt={product.name}
                className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.png'
                  e.currentTarget.className = 'w-full h-full object-cover'
                }}
              />
              {/* İndirim Rozeti - Sol Üst */}
              {product.comparePrice && discountPercent > 0 && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-sm">
                  %{discountPercent}
                </div>
              )}
              {/* Stok Durumu Overlay */}
              {product.stock === 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{t('product.outOfStock')}</span>
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-xs">Resim Yok</span>
            </div>
          )}
        </div>
      </Link>

      {/* Ürün Bilgileri */}
      <div className="p-2 md:p-3 flex flex-col flex-grow">
        {/* Ürün Adı */}
        <Link href={`/${locale}/products/${product.slug}`} className="block mb-1.5 md:mb-2 flex-grow">
          <h3 className="text-xs md:text-sm font-medium text-gray-900 line-clamp-2 min-h-[2rem] md:min-h-[2.5rem] hover:text-primary-600 transition">
            {product.baseName || product.name}
          </h3>
        </Link>

        {/* Fiyat Bölümü */}
        <div className="mb-2 md:mb-3">
          <div className="flex items-baseline gap-1.5 md:gap-2 mb-0.5 md:mb-1">
            <span className="text-sm md:text-base font-bold text-primary-600">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && (
              <span className="text-[10px] md:text-xs text-gray-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          {product.comparePrice && discountPercent > 0 && (
            <span className="text-[10px] md:text-xs text-green-600 font-semibold">
              {discountPercent}% {t('product.discount')}
            </span>
          )}
        </div>

        {/* Sepete Ekle Butonu - Makbul.com tarzı */}
        {product.stock > 0 ? (
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              handleAddToCart(e)
            }}
            className="w-full bg-primary-600 text-white text-[10px] md:text-xs font-bold py-2 md:py-2.5 px-2 md:px-4 rounded hover:bg-primary-700 active:bg-primary-800 transition-colors duration-200 uppercase tracking-wide mt-auto touch-manipulation"
          >
            {t('product.addToCart') || 'Sepete Ekle'}
          </button>
        ) : (
          <button
            disabled
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
            className="w-full bg-gray-300 text-gray-500 text-[10px] md:text-xs font-bold py-2 md:py-2.5 px-2 md:px-4 rounded cursor-not-allowed uppercase tracking-wide mt-auto"
          >
            {t('product.outOfStock')}
          </button>
        )}
      </div>
    </div>
  )
}
