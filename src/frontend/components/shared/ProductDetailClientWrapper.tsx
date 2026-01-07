'use client'

import { useState } from 'react'
import { ProductDetailWithVariants } from './ProductDetailWithVariants'
import { formatPrice } from '@/lib/utils'

interface Variant {
  id: string
  slug: string
  weight: number
  price: number
  comparePrice?: number | null
  stock: number
  unit: string
  name: string
}

interface ProductDetailClientWrapperProps {
  product: {
    id: string
    slug: string
    name: string
    baseName?: string | null
    price: number
    comparePrice?: number | null
    images?: string[] | null
    stock: number
    unit?: string
    weight?: number
    shortDescription?: string
    description?: string
    category?: {
      id: string
      name: string
      slug: string
    } | null
  }
  variants?: Variant[]
  locale: string
  discountPercent: number
  t: any
}

export function ProductDetailClientWrapper({ product, variants, locale, discountPercent, t }: ProductDetailClientWrapperProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.id)

  // Seçili varyantı bul
  const selectedVariant = variants && variants.length > 1 && selectedVariantId
    ? variants.find(v => v.id === selectedVariantId)
    : null

  // Fiyat ve stok için gösterilecek ürün (seçili varyant varsa onu, yoksa ana ürünü)
  const displayProduct = selectedVariant
    ? {
        ...product,
        price: selectedVariant.price,
        // Varyantın kendi comparePrice'ını kullan, yoksa null (ana ürünün comparePrice'ını kullanma)
        comparePrice: selectedVariant.comparePrice ?? null,
        stock: selectedVariant.stock,
        weight: selectedVariant.weight,
        unit: selectedVariant.unit,
      }
    : product

  return (
    <>
      {/* Price */}
      <div className="mb-5 pb-5 border-b border-gray-200">
        <div className="flex items-baseline gap-3 mb-1.5">
            <span className="text-3xl font-bold text-primary-600">
              {formatPrice(displayProduct.price)}
            </span>
            {displayProduct.comparePrice && displayProduct.comparePrice > displayProduct.price && (
              <span className="text-xl text-gray-400 line-through">
                {formatPrice(displayProduct.comparePrice)}
              </span>
            )}
        </div>
        {/* Gramaj Bilgisi */}
        {displayProduct.weight && displayProduct.weight > 0 && (
          <div className="mb-2">
            <span className="inline-block px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              {displayProduct.unit === 'ml' 
                ? `${displayProduct.weight}ml` 
                : `${displayProduct.weight}${displayProduct.unit === 'g' ? 'GR' : displayProduct.unit === 'kg' ? 'KG' : displayProduct.unit?.toUpperCase() || 'GR'}`}
            </span>
          </div>
        )}
        {(() => {
          const currentDiscountPercent = displayProduct.comparePrice && displayProduct.comparePrice > displayProduct.price
            ? Math.round(((displayProduct.comparePrice - displayProduct.price) / displayProduct.comparePrice) * 100)
            : 0
          return currentDiscountPercent > 0 ? (
            <span className="inline-block px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              {currentDiscountPercent}% {t.product.discount}
            </span>
          ) : null
        })()}
      </div>

      {/* Stock Status */}
      <div className="mb-5">
        {displayProduct.stock > 0 ? (
          <div className="flex items-center gap-1.5 text-green-600 mb-3">
            <span className="text-xl">✓</span>
            <span className="font-semibold text-sm">{t.product.inStock} ({displayProduct.stock} {t.common.items})</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-red-600 mb-3">
            <span className="text-xl">✕</span>
            <span className="font-semibold text-sm">{t.product.outOfStock}</span>
          </div>
        )}
      </div>

      {/* Variant Selector ve Add to Cart */}
      <ProductDetailWithVariants 
        product={product} 
        variants={variants} 
        locale={locale}
        onVariantChange={setSelectedVariantId}
      />
    </>
  )
}

