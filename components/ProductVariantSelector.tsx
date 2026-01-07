'use client'

import { useState, useMemo } from 'react'
import { formatPrice } from '@/lib/utils'
import trMessages from '@/messages/tr.json'
import enMessages from '@/messages/en.json'
import frMessages from '@/messages/fr.json'
import { defaultLocale } from '@/i18n'

const messages: Record<string, any> = {
  tr: trMessages,
  en: enMessages,
  fr: frMessages,
}

interface Variant {
  id: string
  slug: string
  weight: number
  price: number
  stock: number
  unit: string
  name: string
}

interface ProductVariantSelectorProps {
  currentProduct: {
    id: string
    slug: string
    weight?: number
    price: number
    stock: number
    unit?: string
  }
  variants: Variant[]
  locale: string
  onVariantChange?: (variantId: string) => void
}

export function ProductVariantSelector({ currentProduct, variants, locale, onVariantChange }: ProductVariantSelectorProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(currentProduct.id)
  
  // Locale prop'unu kullanarak çevirileri al (SSR-safe)
  const t = useMemo(() => {
    const translations = messages[locale] || messages[defaultLocale]
    return (key: string) => {
      const keys = key.split('.')
      let value: any = translations
      for (const k of keys) {
        value = value?.[k]
      }
      return value || key
    }
  }, [locale])

  if (!variants || variants.length <= 1) {
    return null // Sadece bir seçenek varsa gösterilmesin
  }

  const selectedVariant = variants.find(v => v.id === selectedVariantId) || variants[0]

  const formatWeight = (weight: number | null | undefined, unit: string | null | undefined) => {
    const normalizedWeight = weight || 0
    const normalizedUnit = (unit || 'g').toLowerCase()
    
    if (normalizedWeight === 0) {
      return 'N/A'
    }
    
    if (normalizedUnit === 'ml') {
      return `${normalizedWeight}ml`
    }
    
    // Gram cinsinden - her zaman gram olarak göster
    return `${normalizedWeight}g`
  }

  const handleVariantChange = (variant: Variant, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    // Sadece seçili varyantı güncelle, sayfa yenilenmesin
    // URL'i değiştirmiyoruz, sadece state'i güncelliyoruz
    setSelectedVariantId(variant.id)
    
    // Parent component'e bildir
    if (onVariantChange) {
      onVariantChange(variant.id)
    }
  }

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        {t('product.selectSize') || 'Gramaj Seçin'}
      </label>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
        {variants.map((variant) => {
          const isSelected = variant.id === selectedVariantId
          const isOutOfStock = variant.stock <= 0
          
          return (
            <button
              key={variant.id}
              type="button"
              onClick={(e) => {
                if (!isOutOfStock) {
                  handleVariantChange(variant, e)
                }
              }}
              disabled={isOutOfStock}
              className={`
                relative p-3 rounded-lg border-2 transition-all
                ${isSelected
                  ? 'border-primary-600 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-primary-300 bg-white'
                }
                ${isOutOfStock
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer hover:shadow-md'
                }
              `}
            >
              <div className="text-center">
                <div className={`font-bold text-sm mb-1 ${isSelected ? 'text-primary-600' : 'text-gray-900'}`}>
                  {variant.name || formatWeight(variant.weight || 0, variant.unit || 'g')}
                </div>
                <div className="text-xs font-semibold text-green-600">
                  {formatPrice(variant.price || 0)}
                </div>
                {variant.stock > 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    {t('product.stock') || 'Stok'}: {variant.stock} {t('common.piece') || 'adet'}
                  </div>
                )}
              </div>
              
              {isSelected && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              )}
              
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 rounded-lg">
                  <span className="text-xs text-red-600 font-semibold">
                    {t('product.outOfStock') || 'Stokta Yok'}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Seçili variant bilgisi */}
      <div className="p-3 bg-primary-50 rounded-lg border border-primary-200">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-600">
              {t('product.selectedSize') || 'Seçili Gramaj'}
            </span>
            <span className="ml-2 font-semibold text-primary-700">
              {formatWeight(selectedVariant.weight || 0, selectedVariant.unit || 'g')}
            </span>
          </div>
            <div className="text-lg font-bold text-primary-600">
              {formatPrice(selectedVariant.price)}
            </div>
        </div>
        {selectedVariant.stock > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            {t('product.stockAvailable') || 'Stokta var'}: {selectedVariant.stock} {t('common.piece') || 'adet'}
          </div>
        )}
      </div>
    </div>
  )
}

