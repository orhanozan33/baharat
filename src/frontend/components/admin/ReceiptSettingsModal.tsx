'use client'

import { useState, useEffect, useRef } from 'react'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface ReceiptSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

export default function ReceiptSettingsModal({ isOpen, onClose, onSave }: ReceiptSettingsModalProps) {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [settings, setSettings] = useState({
    receiptLogo: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyTaxNumber: '',
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

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
          companyTaxNumber: data.settings.companyTaxNumber || '',
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
      if (onSave) onSave()
      onClose()
    } catch (error: any) {
      console.error('Save settings error:', error)
      showToast(error.message || t.admin.modals.receiptSettings.saveError, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b px-4 py-3 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-lg font-bold text-gray-900">{t.admin.modals.receiptSettings.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-4 space-y-4">
          <div className="space-y-3">
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
            <div className="border-t pt-4">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder={t.admin.modals.receiptSettings.emailPlaceholder}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.admin.modals.receiptSettings.taxNumber}
                  </label>
                  <input
                    type="text"
                    value={settings.companyTaxNumber}
                    onChange={(e) => setSettings((prev) => ({ ...prev, companyTaxNumber: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder={t.admin.modals.receiptSettings.taxNumberPlaceholder}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={saving}
            >
              {t.admin.modals.receiptSettings.cancel}
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? t.admin.modals.receiptSettings.saving : t.admin.modals.receiptSettings.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

