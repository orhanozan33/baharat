'use client'

import { useState, useEffect } from 'react'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface TaxSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

export default function TaxSettingsModal({ isOpen, onClose, onSave }: TaxSettingsModalProps) {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    federalTaxRate: '5',
    provincialTaxRate: '8',
  })

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Load settings error:', error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t.admin.modals.taxSettings.saveError)
      }

      showToast(t.admin.modals.taxSettings.saved, 'success')
      if (onSave) onSave()
      onClose()
    } catch (error: any) {
      console.error('Save settings error:', error)
      showToast(error.message || t.admin.modals.taxSettings.saveError, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{t.admin.modals.taxSettings.title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          <p className="text-sm text-gray-600">
            {t.admin.modals.taxSettings.description}
          </p>

          <div className="space-y-4">
            {/* Federal Tax Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.admin.modals.taxSettings.federalTax}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.federalTaxRate}
                onChange={(e) =>
                  setSettings({ ...settings, federalTaxRate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="5.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {t.admin.modals.taxSettings.federalTaxHint}
              </p>
            </div>

            {/* Provincial Tax Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.admin.modals.taxSettings.provincialTax}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={settings.provincialTaxRate}
                onChange={(e) =>
                  setSettings({ ...settings, provincialTaxRate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="8.00"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                {t.admin.modals.taxSettings.provincialTaxHint}
              </p>
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
              {t.admin.modals.taxSettings.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? t.admin.modals.taxSettings.saving : t.admin.modals.taxSettings.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

