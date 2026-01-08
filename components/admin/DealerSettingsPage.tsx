'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

export default function DealerSettingsPage() {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const router = useRouter()
  const searchParams = useSearchParams()
  const dealerId = searchParams.get('id')
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    companyName: '',
    fullName: '',
    taxNumber: '',
    discountRate: 0,
    isActive: true,
    address: '',
    phone: '',
    email: '',
    userEmail: '',
    userPhone: '',
    userAddress: '',
    userCity: '',
    userPostalCode: '',
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (dealerId) {
      loadDealer()
    }
  }, [dealerId])

  const loadDealer = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/dealers/${dealerId}`)
      if (response.ok) {
        const data = await response.json()
        const dealer = data.dealer
        setFormData({
          companyName: dealer.companyName || '',
          fullName: dealer.user?.name || '',
          taxNumber: dealer.taxNumber || '',
          discountRate: dealer.discountRate || 0,
          isActive: dealer.isActive ?? true,
          address: dealer.address || '',
          phone: dealer.phone || '',
          email: dealer.email || '',
          userEmail: dealer.user?.email || '',
          userPhone: dealer.user?.phone || '',
          userAddress: dealer.user?.address || '',
          userCity: dealer.user?.city || '',
          userPostalCode: dealer.user?.postalCode || '',
        })
      } else {
        showToast(t.admin.common.actions.error, 'error')
        router.push('/admin/settings')
      }
    } catch (error) {
      console.error('Load dealer error:', error)
      showToast(t.admin.common.actions.error, 'error')
      router.push('/admin/settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      if (!dealerId) {
        throw new Error('Bayi ID bulunamadı')
      }

      const response = await fetch(`/api/admin/dealers/${dealerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || t.admin.common.actions.error)
      }

      showToast(t.admin.forms.dealer.saved, 'success')
      router.push('/admin/settings')
    } catch (err: any) {
      setError(err.message || t.admin.common.actions.error)
      showToast(err.message || t.admin.common.actions.error, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-8">
            <p className="text-gray-600">{t.admin.common.actions.loading}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="border-b pb-4 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{t.admin.pages.settings.dealer.title}</h1>
            <button
              onClick={() => router.push('/admin/settings')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              {t.admin.forms.dealer.cancel}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Firma Bilgileri */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.admin.forms.dealer.companyInfo || 'Firma Bilgileri'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.admin.forms.dealer.companyName} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t.admin.forms.dealer.companyNamePlaceholder}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {t.admin.forms.dealer.companyNameHint}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.admin.forms.dealer.taxNumber}
                </label>
                <input
                  type="text"
                  value={formData.taxNumber}
                  onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t.admin.forms.dealer.taxNumberPlaceholder}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {t.admin.forms.dealer.taxNumberHint}
                </p>
              </div>
            </div>

            <div className="mt-4">
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={t.admin.forms.dealer.discountRatePlaceholder}
              />
              <p className="mt-1 text-sm text-gray-500">
                {t.admin.forms.dealer.discountRateHint}
              </p>
            </div>

            <div className="mt-4">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
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
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="firma@example.com"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center">
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
          </div>

          {/* Kullanıcı Bilgileri */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">{t.admin.forms.dealer.userInfo || 'Kullanıcı Bilgileri'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.admin.forms.dealer.fullName} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t.admin.forms.dealer.fullNamePlaceholder}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {t.admin.forms.dealer.fullNameHint}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.admin.forms.dealer.userEmail || 'Kullanıcı Email'}
                </label>
                <input
                  type="email"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="kullanici@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.admin.forms.dealer.userPhone || 'Kullanıcı Telefon'}
                </label>
                <input
                  type="tel"
                  value={formData.userPhone}
                  onChange={(e) => setFormData({ ...formData, userPhone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder={t.admin.forms.dealer.phonePlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.admin.forms.dealer.userCity || 'Şehir'}
                </label>
                <input
                  type="text"
                  value={formData.userCity}
                  onChange={(e) => setFormData({ ...formData, userCity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Şehir"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.admin.forms.dealer.userAddress || 'Kullanıcı Adresi'}
                </label>
                <textarea
                  value={formData.userAddress}
                  onChange={(e) => setFormData({ ...formData, userAddress: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Kullanıcı adresi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.admin.forms.dealer.userPostalCode || 'Posta Kodu'}
                </label>
                <input
                  type="text"
                  value={formData.userPostalCode}
                  onChange={(e) => setFormData({ ...formData, userPostalCode: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Posta kodu"
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/admin/settings')}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={saving}
            >
              {t.admin.forms.dealer.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? t.admin.forms.dealer.saving : t.admin.forms.dealer.update}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


