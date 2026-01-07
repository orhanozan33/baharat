'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

export default function ReceiptSettingsPage() {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [settings, setSettings] = useState({
    receiptLogo: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    tpsEnabled: false,
    tpsNumber: '',
    tpsRate: 5,
    tvqEnabled: false,
    tvqNumber: '',
    tvqRate: 9.975,
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/receipt')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          receiptLogo: data.settings.receiptLogo || '',
          companyName: data.settings.companyName || '',
          companyAddress: data.settings.companyAddress || '',
          companyPhone: data.settings.companyPhone || '',
          companyEmail: data.settings.companyEmail || '',
          tpsEnabled: data.settings.tpsEnabled || false,
          tpsNumber: data.settings.tpsNumber || '',
          tpsRate: parseFloat(data.settings.tpsRate) || 5,
          tvqEnabled: data.settings.tvqEnabled || false,
          tvqNumber: data.settings.tvqNumber || '',
          tvqRate: parseFloat(data.settings.tvqRate) || 9.975,
        })
        setLogoPreview(data.settings.receiptLogo || null)
      }
    } catch (error) {
      console.error('Load settings error:', error)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // File type validation
    if (!file.type.startsWith('image/')) {
      showToast(t.admin.modals.receiptSettings.invalidFileType, 'error')
      return
    }

    // File size validation (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast(t.admin.modals.receiptSettings.fileTooLarge, 'error')
      return
    }

    setUploading(true)

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        
        // Update settings with base64 string
        setSettings((prev) => ({ ...prev, receiptLogo: base64String }))
        setLogoPreview(base64String)
        setUploading(false)
        showToast(t.admin.modals.receiptSettings.logoUploaded, 'success')
      }
      reader.onerror = () => {
        showToast(t.admin.modals.receiptSettings.uploadError, 'error')
        setUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      console.error('Upload error:', error)
      showToast(t.admin.modals.receiptSettings.uploadError2, 'error')
      setUploading(false)
    }
  }

  const handleRemoveLogo = () => {
    setSettings((prev) => ({ ...prev, receiptLogo: '' }))
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/settings/receipt', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t.admin.modals.receiptSettings.saveError)
      }

      showToast(t.admin.modals.receiptSettings.saved, 'success')
      router.push('/admin/settings')
    } catch (error: any) {
      console.error('Save settings error:', error)
      showToast(error.message || t.admin.modals.receiptSettings.saveError, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4">
      <div className="bg-white rounded-lg shadow-lg p-3 sm:p-4 md:p-6">
        {/* Header */}
        <div className="border-b pb-3 sm:pb-4 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.admin.modals.receiptSettings.title}</h1>
            <button
              onClick={() => router.push('/admin/settings')}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition touch-manipulation text-sm sm:text-base whitespace-nowrap w-full sm:w-auto"
              style={{ minHeight: '44px' }}
            >
              {t.admin.modals.receiptSettings.cancel}
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-6">
          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.admin.modals.receiptSettings.logo}
              </label>
              <div className="space-y-3">
                {logoPreview ? (
                  <div className="relative inline-block">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-w-xs max-h-32 object-contain border border-gray-300 rounded-lg p-2"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition text-xs"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <p className="text-gray-500 mb-2">{t.admin.modals.receiptSettings.logoUpload}</p>
                    <p className="text-xs text-gray-400">{t.admin.modals.receiptSettings.logoUploadHint}</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {uploading && (
                  <p className="text-sm text-gray-500">{t.admin.modals.receiptSettings.uploading}</p>
                )}
              </div>
            </div>

            {/* Firma Bilgileri */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.admin.modals.receiptSettings.companyInfo}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.admin.modals.receiptSettings.companyName}
                  </label>
                  <input
                    type="text"
                    value={settings.companyName}
                    onChange={(e) => setSettings((prev) => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                    placeholder={t.admin.modals.receiptSettings.companyNamePlaceholder}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.admin.modals.receiptSettings.address}
                  </label>
                  <textarea
                    value={settings.companyAddress}
                    onChange={(e) => setSettings((prev) => ({ ...prev, companyAddress: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                    rows={3}
                    placeholder={t.admin.modals.receiptSettings.addressPlaceholder}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.admin.modals.receiptSettings.phone}
                    </label>
                    <input
                      type="text"
                      value={settings.companyPhone}
                      onChange={(e) => setSettings((prev) => ({ ...prev, companyPhone: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                      placeholder={t.admin.modals.receiptSettings.phonePlaceholder}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.admin.modals.receiptSettings.email}
                    </label>
                    <input
                      type="email"
                      value={settings.companyEmail}
                      onChange={(e) => setSettings((prev) => ({ ...prev, companyEmail: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                      placeholder={t.admin.modals.receiptSettings.emailPlaceholder}
                    />
                  </div>
                </div>

                {/* GST (Federal Tax) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="tpsEnabled"
                      checked={settings.tpsEnabled}
                      onChange={(e) => setSettings((prev) => ({ ...prev, tpsEnabled: e.target.checked }))}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="tpsEnabled" className="block text-sm font-medium text-gray-700 min-w-[150px]">
                      TPS
                    </label>
                  </div>
                  {settings.tpsEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          TPS Registration Number
                        </label>
                        <input
                          type="text"
                          value={settings.tpsNumber}
                          onChange={(e) => setSettings((prev) => ({ ...prev, tpsNumber: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                          placeholder="N° d'inscription à la TPS/TVH"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          TPS Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={settings.tpsRate}
                          onChange={(e) => setSettings((prev) => ({ ...prev, tpsRate: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                          placeholder="5.00"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* PST/HST/QST (Provincial Tax) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="tvqEnabled"
                      checked={settings.tvqEnabled}
                      onChange={(e) => setSettings((prev) => ({ ...prev, tvqEnabled: e.target.checked }))}
                      className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="tvqEnabled" className="block text-sm font-medium text-gray-700 min-w-[150px]">
                      TVQ - Provincial
                    </label>
                  </div>
                  {settings.tvqEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          TVQ
                        </label>
                        <input
                          type="text"
                          value={settings.tvqNumber}
                          onChange={(e) => setSettings((prev) => ({ ...prev, tvqNumber: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                          placeholder="N° d'enregistrement de la TVQ"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          TVQ Rate (%)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={settings.tvqRate}
                          onChange={(e) => setSettings((prev) => ({ ...prev, tvqRate: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
                          placeholder="9.975"
                        />
                      </div>
                    </div>
                  )}
                </div>
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
              {t.admin.modals.receiptSettings.cancel}
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation font-medium"
              style={{ minHeight: '44px' }}
            >
              {saving ? t.admin.modals.receiptSettings.saving : t.admin.modals.receiptSettings.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

