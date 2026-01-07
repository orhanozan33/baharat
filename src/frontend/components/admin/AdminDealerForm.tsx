'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface AdminDealerFormProps {
  dealer?: any
}

export default function AdminDealerForm({ dealer }: AdminDealerFormProps) {
  const router = useRouter()
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    companyName: dealer?.companyName || '',
    fullName: dealer?.user?.name || '',
    taxNumber: dealer?.taxNumber || '',
    discountRate: dealer?.discountRate || 0,
    address: dealer?.address || '',
    phone: dealer?.phone || dealer?.user?.phone || '',
    isActive: dealer?.isActive ?? true,
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const url = dealer
        ? `/api/admin/dealers/${dealer.id}`
        : '/api/admin/dealers'
      const method = dealer ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('❌ Dealer creation failed:', data)
        throw new Error(data.error || t.admin.common.actions.error)
      }

      console.log('✅ Dealer created successfully:', data)

      showToast(
        dealer ? t.admin.forms.dealer.saved : t.admin.forms.dealer.created,
        'success'
      )
      
      // Kısa bir gecikme sonrası sayfayı tam yenile (cache'i bypass et)
      setTimeout(() => {
        window.location.href = '/admin/dealers'
      }, 500)
    } catch (err: any) {
      setError(err.message || t.admin.common.actions.error)
      showToast(err.message || t.admin.common.actions.error, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">
        {dealer ? t.admin.forms.dealer.edit : t.admin.forms.dealer.add}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.admin.forms.dealer.fullName}
            </label>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
              placeholder={t.admin.forms.dealer.fullNamePlaceholder}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t.admin.forms.dealer.fullNameHint}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.admin.forms.dealer.companyName}
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
              placeholder={t.admin.forms.dealer.companyNamePlaceholder}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t.admin.forms.dealer.companyNameHint}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.admin.forms.dealer.taxNumber}
            </label>
            <input
              type="text"
              value={formData.taxNumber}
              onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
              placeholder={t.admin.forms.dealer.taxNumberPlaceholder}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t.admin.forms.dealer.taxNumberHint}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.admin.forms.dealer.discountRate}
            </label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.discountRate}
              onChange={(e) =>
                setFormData({ ...formData, discountRate: parseFloat(e.target.value) || 0 })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation"
              placeholder={t.admin.forms.dealer.discountRatePlaceholder}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t.admin.forms.dealer.discountRateHint}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.admin.forms.dealer.phone}
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={t.admin.forms.dealer.phonePlaceholder}
          />
          <p className="mt-1 text-sm text-gray-500">
            {t.admin.forms.dealer.phoneHint}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.admin.forms.dealer.address}
          </label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder={t.admin.forms.dealer.addressPlaceholder}
          />
          <p className="mt-1 text-sm text-gray-500">
            {t.admin.forms.dealer.addressHint}
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
            {t.admin.forms.dealer.active}
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
          >
            {loading ? t.admin.forms.dealer.saving : dealer ? t.admin.forms.dealer.update : t.admin.forms.dealer.create}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/dealers')}
            className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            {t.admin.forms.dealer.cancel}
          </button>
        </div>
      </form>
    </div>
  )
}

