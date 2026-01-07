'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface AdminProductFormProps {
  product?: any
  categories: any[]
}

export default function AdminProductForm({ product, categories }: AdminProductFormProps) {
  const router = useRouter()
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [loading, setLoading] = useState(false)
  
  // Birim gösterimi için format fonksiyonu
  const formatUnitForDisplay = (unit: string) => {
    if (unit === 'g') return 'GR'
    if (unit === 'kg') return 'KG'
    return unit // ml için aynı kalır
  }
  
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    sku: product?.sku || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    price: product?.price || 0,
    comparePrice: product?.comparePrice || null,
    stock: product?.stock || 0,
    categoryId: product?.category?.id || '',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    trackStock: product?.trackStock ?? true,
    unit: product?.unit || 'g',
    weight: product?.weight ?? null,
    baseName: product?.baseName || '',
    images: Array.isArray(product?.images) ? product.images : (product?.images ? [product.images] : []),
  })

  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Slug'ı otomatik oluştur - ürün adı değiştiğinde
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }, [formData.name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('Submitting form data:', formData)
    console.log('Images to save:', formData.images)

    try {
      const url = product ? `/api/admin/products/${product.id}` : '/api/admin/products'
      const method = product ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || t.admin.forms.product.saveError)
      }

      showToast(
        product ? t.admin.forms.product.saved : t.admin.forms.product.created,
        'success'
      )

      router.push('/admin/products')
      router.refresh()
    } catch (error: any) {
      setError(error.message || t.admin.common.actions.error)
      setLoading(false)
    }
  }

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      // Maksimum 5 görsel kontrolü
      const currentImages = Array.isArray(formData.images) ? formData.images : []
      if (currentImages.length >= 5) {
        setError(t.admin.forms.product.maxImages)
        return
      }

      setFormData(prev => ({
        ...prev,
        images: [...(Array.isArray(prev.images) ? prev.images : []), imageUrl.trim()],
      }))
      setImageUrl('')
      setError('')
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Maksimum 5 görsel kontrolü
    const currentImages = Array.isArray(formData.images) ? formData.images : []
    if (currentImages.length >= 5) {
      setError(t.admin.forms.product.maxImages)
      e.target.value = '' // Input'u temizle
      return
    }

    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError(t.admin.forms.product.invalidFileType)
      e.target.value = '' // Input'u temizle
      return
    }

    // Dosya boyutu kontrolü (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError(t.admin.forms.product.fileTooLarge)
      e.target.value = '' // Input'u temizle
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || t.admin.forms.product.uploadError)
      }

      const data = await response.json()

      console.log('Upload response:', data)
      console.log('Current images before update:', formData.images)
      
      // Yüklenen görseli listeye ekle - functional update kullan
      setFormData(prev => {
        const currentImages = Array.isArray(prev.images) ? prev.images : []
        const updatedImages = [...currentImages, data.url]
        console.log('Updated images:', updatedImages)
        return {
          ...prev,
          images: updatedImages,
        }
      })

      showToast(t.admin.forms.product.imageUploaded, 'success')
    } catch (error: any) {
      setError(error.message || t.admin.forms.product.uploadError)
    } finally {
      setUploading(false)
      // Input'u temizle
      e.target.value = ''
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {product ? t.admin.forms.product.edit : t.admin.forms.product.add}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          {product ? t.admin.forms.product.editDesc.replace('{name}', product.name) : t.admin.forms.product.addDesc}
        </p>
      </div>

      {error && (
        <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Temel Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.admin.forms.product.baseName}
                </label>
                <input
                  type="text"
                  required
                  value={formData.baseName}
                  onChange={(e) => {
                    const baseName = e.target.value
                    // Ürün adını otomatik oluştur: baseName + gramaj
                    const displayUnit = formatUnitForDisplay(formData.unit || 'g')
                    const name = baseName && formData.weight
                      ? `${baseName} ${formData.weight}${displayUnit}`
                      : baseName
                    
                    setFormData({ 
                      ...formData, 
                      baseName,
                      name
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                  placeholder={t.admin.forms.product.baseNamePlaceholder}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.admin.forms.product.baseNameHint}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.admin.forms.product.weight}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.weight || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    let weight = value === '' ? null : (parseFloat(value) || 0)
                    let unit = formData.unit || 'g'
                    
                    // 1000g yazıldığında otomatik olarak 1 KG'ye dönüştür
                    if (weight === 1000 && unit === 'g') {
                      weight = 1
                      unit = 'kg'
                    }
                    
                    // Ürün adını güncelle: baseName + gramaj
                    const displayUnit = formatUnitForDisplay(unit)
                    const name = formData.baseName && weight
                      ? `${formData.baseName} ${weight}${displayUnit}`
                      : formData.baseName || formData.name
                    
                    setFormData({ 
                      ...formData, 
                      weight,
                      unit,
                      name
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                  placeholder={t.admin.forms.product.weightPlaceholder}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t.admin.forms.product.weightHint}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t.admin.forms.product.unit}
                </label>
                <select
                  value={formData.unit}
                  onChange={(e) => {
                    const unit = e.target.value
                    // Ürün adını güncelle: baseName + gramaj
                    const displayUnit = formatUnitForDisplay(unit)
                    const name = formData.baseName && formData.weight
                      ? `${formData.baseName} ${formData.weight}${displayUnit}`
                      : formData.baseName || formData.name
                    
                    setFormData({ 
                      ...formData, 
                      unit,
                      name
                    })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                >
                  <option value="g">Gram (GR)</option>
                  <option value="kg">Kilogram (KG)</option>
                  <option value="ml">Mililitre (ml)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {t.admin.forms.product.unitHint}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.admin.forms.product.productNameAuto} *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-50"
              placeholder={t.admin.forms.product.productNameAutoPlaceholder}
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1">
              {t.admin.forms.product.productNameAutoHint}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.admin.forms.product.slug}
            </label>
            <input
              type="text"
              required
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t.admin.forms.product.slugPlaceholder}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t.admin.forms.product.slugHint}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.admin.forms.product.sku}
            </label>
            <input
              type="text"
              required
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t.admin.forms.product.skuPlaceholder}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t.admin.forms.product.skuHint}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.admin.forms.product.category}
            </label>
            <select
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">{t.admin.forms.product.selectCategory}</option>
              {categories
                .filter((c) => !c.parent)
                .map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {t.admin.forms.product.categoryHint}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.admin.forms.product.price}
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t.admin.forms.product.pricePlaceholder}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t.admin.forms.product.priceHint}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.admin.forms.product.comparePrice}
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.comparePrice || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  comparePrice: e.target.value ? parseFloat(e.target.value) : null,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t.admin.forms.product.comparePricePlaceholder}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t.admin.forms.product.comparePriceHint}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              {t.admin.forms.product.stock}
            </label>
            <input
              type="number"
              required
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder={t.admin.forms.product.stockPlaceholder}
            />
            <p className="text-xs text-gray-500 mt-1">
              {t.admin.forms.product.stockHint}
            </p>
          </div>

        </div>

        {/* Descriptions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.admin.forms.product.shortDescription}
          </label>
          <textarea
            value={formData.shortDescription}
            onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={2}
            placeholder={t.admin.forms.product.shortDescriptionPlaceholder}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.admin.forms.product.description}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={6}
            placeholder={t.admin.forms.product.descriptionPlaceholder}
          />
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t.admin.forms.product.productImages}
          </label>
          <p className="text-xs text-gray-500 mb-3">
            {t.admin.forms.product.productImagesHint}
          </p>
          
          {/* File Upload */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">
              {t.admin.forms.product.uploadImageFromComputer}
              <span className="ml-2 text-xs text-gray-500">
                ({formData.images?.length || 0}/5)
              </span>
            </label>
            <p className="text-xs text-gray-500 mb-2">
              {t.admin.forms.product.uploadImageFromComputerHint}
            </p>
            <div className="flex gap-2">
              <label className={`flex-1 cursor-pointer ${(formData.images?.length || 0) >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  onChange={handleFileUpload}
                  disabled={uploading || (formData.images?.length || 0) >= 5}
                  className="hidden"
                />
                <div className={`px-4 py-2 border-2 border-dashed rounded-lg transition text-center ${
                  (formData.images?.length || 0) >= 5 
                    ? 'border-gray-200 bg-gray-50' 
                    : 'border-gray-300 hover:border-primary-500'
                }`}>
                  {uploading ? (
                    <span className="text-gray-600">{t.admin.forms.product.uploading}</span>
                  ) : (formData.images?.length || 0) >= 5 ? (
                    <span className="text-gray-400">{t.admin.forms.product.maxImagesReached}</span>
                  ) : (
                    <span className="text-gray-700">{t.admin.forms.product.selectFile}</span>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Add by URL */}
          <div className="mb-4">
            <label className="block text-sm text-gray-600 mb-2">
              {t.admin.forms.product.addImageByUrl}
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                disabled={(formData.images?.length || 0) >= 5}
                className={`flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  (formData.images?.length || 0) >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder={(formData.images?.length || 0) >= 5 
                  ? t.admin.forms.product.maxImagesReached
                  : t.admin.forms.product.addImageUrlPlaceholder
                }
              />
              <button
                type="button"
                onClick={handleAddImage}
                disabled={(formData.images?.length || 0) >= 5}
                className={`px-4 py-2 rounded-lg transition ${
                  (formData.images?.length || 0) >= 5
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
                title={t.admin.forms.product.addUrlHint}
              >
                {t.admin.forms.product.addUrl}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {t.admin.forms.product.addUrlHint}
            </p>
          </div>
          {formData.images && Array.isArray(formData.images) && formData.images.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((img: string, index: number) => (
                <div key={index} className="relative group">
                  <img
                    src={img.startsWith('http') || img.startsWith('/') ? img : `/${img}`}
                    alt={`${formData.name} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-image.png'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition">
                    {img}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
              {t.admin.forms.product.noImagesAdded}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="font-semibold">{t.admin.forms.product.active}</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                {t.admin.forms.product.activeHint}
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="font-semibold">{t.admin.forms.product.featured}</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                {t.admin.forms.product.featuredHint}
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.trackStock}
                  onChange={(e) => setFormData({ ...formData, trackStock: e.target.checked })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="font-semibold">{t.admin.forms.product.trackStock}</span>
              </label>
              <p className="text-xs text-gray-500 mt-1 ml-7">
                {t.admin.forms.product.trackStockHint}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t">
          <div className="flex gap-4">
            <div className="flex-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                {loading ? t.admin.forms.product.saving : product ? t.admin.forms.product.update : t.admin.forms.product.create}
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {product ? t.admin.forms.product.updateHint : t.admin.forms.product.createHint}
              </p>
            </div>
            <div className="flex-1">
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                className="w-full px-6 py-3 sm:py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 active:bg-gray-400 transition font-semibold touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                {t.admin.forms.product.cancel}
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">
                {t.admin.forms.product.cancelHint}
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

