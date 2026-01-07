'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface AdminCategoryFormProps {
  category?: any
  categories: any[] // Tüm kategoriler (parent seçimi için)
}

export default function AdminCategoryForm({ category, categories }: AdminCategoryFormProps) {
  const router = useRouter()
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: category?.name || '',
    slug: category?.slug || '',
    description: category?.description || '',
    image: category?.image || '',
    parentId: category?.parentId || '',
    order: category?.order || 0,
    isActive: category?.isActive ?? true,
  })
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(formData.image || null)

  useEffect(() => {
    // Slug'ı otomatik oluştur (sadece yeni kategori için)
    if (!category && formData.name && !formData.slug) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      setFormData({ ...formData, slug })
    }
  }, [formData.name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = category
        ? `/api/admin/categories/${category.id}`
        : '/api/admin/categories'
      const method = category ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t.admin.forms.category.error)
      }

      showToast(t.admin.forms.category.saved, 'success')
      router.push('/admin/categories')
      router.refresh()
    } catch (err: any) {
      setError(err.message || t.admin.forms.category.error)
      showToast(err.message || t.admin.forms.category.error, 'error')
    } finally {
      setLoading(false)
    }
  }

  // Mevcut kategoriyi parent olarak seçilemez hale getir
  const availableParents = categories.filter(
    (c) => !category || c.id !== category.id
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      setError(t.admin.forms.product.invalidFileType)
      e.target.value = ''
      return
    }

    // Dosya boyutu kontrolü (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      setError(t.admin.forms.product.fileTooLarge)
      e.target.value = ''
      return
    }

    setUploading(true)
    setError('')

    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('type', 'category') // Kategori görseli olduğunu belirt

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formDataUpload,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || t.admin.forms.product.uploadError)
      }

      const data = await response.json()

      // Yüklenen görseli form'a ekle
      setFormData({ ...formData, image: data.url })
      setImagePreview(data.url)
      showToast(t.admin.forms.product.imageUploaded, 'success')
    } catch (error: any) {
      setError(error.message || t.admin.forms.product.uploadError)
      showToast(error.message || t.admin.forms.product.uploadError, 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, image: url })
    setImagePreview(url)
  }

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: '' })
    setImagePreview(null)
  }

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
        {category ? t.admin.forms.category.edit : t.admin.forms.category.add}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.admin.forms.category.name}
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
            placeholder={t.admin.forms.category.namePlaceholder}
          />
          <p className="mt-1 text-sm text-gray-500">
            {t.admin.forms.category.nameHint}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.admin.forms.category.slug}
          </label>
          <input
            type="text"
            required
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
            placeholder={t.admin.forms.category.slugPlaceholder}
          />
          <p className="mt-1 text-sm text-gray-500">
            {t.admin.forms.category.slugHint}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.admin.forms.category.description}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
            placeholder={t.admin.forms.category.descriptionPlaceholder}
          />
          <p className="mt-1 text-sm text-gray-500">
            {t.admin.forms.category.descriptionHint}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.admin.forms.category.image}
          </label>
          <p className="mb-2 text-sm text-gray-500">
            {t.admin.forms.category.imageHint}
          </p>
          
          {/* Görsel Önizleme */}
          {imagePreview && (
            <div className="mb-4 relative inline-block">
              <img
                src={imagePreview.startsWith('http') || imagePreview.startsWith('/') 
                  ? imagePreview 
                  : `/${imagePreview}`}
                alt={t.admin.forms.category.categoryImage}
                className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.png'
                }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                title={t.admin.forms.category.removeImage}
              >
                ×
              </button>
            </div>
          )}

          {/* Manuel Dosya Yükleme */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.admin.forms.category.fileUpload}
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileUpload}
              disabled={uploading}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
                file:cursor-pointer
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {uploading && (
              <p className="mt-2 text-sm text-gray-500">{t.admin.forms.category.uploading}</p>
            )}
          </div>

          {/* Or Add by URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.admin.forms.category.orImageUrl}
            </label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
              placeholder={t.admin.forms.category.imageUrlPlaceholder}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.admin.forms.category.parentCategory}
          </label>
          <select
            value={formData.parentId}
            onChange={(e) =>
              setFormData({ ...formData, parentId: e.target.value || '' })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
          >
            <option value="">{t.admin.forms.category.noneMainCategory}</option>
            {availableParents.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-500">
            {t.admin.forms.category.parentCategoryHint}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.admin.forms.category.order}
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) =>
              setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
            min="0"
          />
          <p className="mt-1 text-sm text-gray-500">
            {t.admin.forms.category.orderHint}
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            {t.admin.forms.category.active}
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 active:bg-primary-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            {loading ? t.admin.forms.category.saving : category ? t.admin.forms.category.update : t.admin.forms.category.create}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/categories')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition touch-manipulation"
            style={{ minHeight: '44px' }}
          >
            {t.admin.forms.category.cancel}
          </button>
        </div>
      </form>
    </div>
  )
}

