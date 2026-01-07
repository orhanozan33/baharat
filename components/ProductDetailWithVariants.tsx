'use client'

import { useState, createContext, useContext } from 'react'
import { ProductVariantSelector } from './ProductVariantSelector'
import { ProductDetailAddToCart } from './ProductDetailAddToCart'

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

interface ProductDetailWithVariantsProps {
  product: {
    id: string
    slug: string
    name: string
    price: number
    comparePrice?: number | null
    images?: string[] | null
    stock: number
    unit?: string
    weight?: number
  }
  variants?: Variant[]
  locale: string
  onVariantChange?: (variantId: string) => void
}

// Context for sharing selected variant
const VariantContext = createContext<{
  selectedVariantId: string
  setSelectedVariantId: (id: string) => void
}>({
  selectedVariantId: '',
  setSelectedVariantId: () => {},
})

export function useVariantContext() {
  return useContext(VariantContext)
}

export function ProductDetailWithVariants({ product, variants, locale, onVariantChange }: ProductDetailWithVariantsProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.id)

  // Seçili varyantı bul
  const selectedVariant = variants && variants.length > 1
    ? variants.find(v => v.id === selectedVariantId) || product
    : product

  // Sepete eklenecek ürün bilgileri (seçili varyant veya ana ürün)
  const productForCart = variants && variants.length > 1 && selectedVariant && selectedVariant.id !== product.id
    ? {
        id: selectedVariant.id,
        slug: selectedVariant.slug,
        name: selectedVariant.name,
        price: selectedVariant.price,
        comparePrice: selectedVariant.comparePrice ?? product.comparePrice,
        images: product.images,
        stock: selectedVariant.stock,
        unit: selectedVariant.unit,
        weight: selectedVariant.weight,
      }
    : product

  const handleVariantChange = (variantId: string) => {
    setSelectedVariantId(variantId)
    if (onVariantChange) {
      onVariantChange(variantId)
    }
  }

  return (
    <VariantContext.Provider value={{ selectedVariantId, setSelectedVariantId: handleVariantChange }}>
      {/* Variant Selector */}
      {variants && variants.length > 1 && (
        <div className="mb-6">
          <ProductVariantSelector
            currentProduct={product}
            variants={variants}
            locale={locale}
            onVariantChange={handleVariantChange}
          />
        </div>
      )}

      {/* Add to Cart - seçili varyant ile */}
      <div className="mb-6">
        <ProductDetailAddToCart product={productForCart} locale={locale} />
      </div>
    </VariantContext.Provider>
  )
}

