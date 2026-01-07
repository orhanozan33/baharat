'use client'

import { useState, useEffect } from 'react'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface ContactSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

export default function ContactSettingsModal({ isOpen, onClose, onSave }: ContactSettingsModalProps) {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    contactLocation: '',
    contactPhone: '',
    contactEmail: '',
    contactHours: '',
  })

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/contact')
      if (response.ok) {
        const data = await response.json()
        setSettings({
          contactLocation: data.settings.contactLocation || '',
          contactPhone: data.settings.contactPhone || '',
          contactEmail: data.settings.contactEmail || '',
          contactHours: data.settings.contactHours || '',
        })
      }
    } catch (error) {
      console.error('Load contact settings error:', error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/settings/contact', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t.admin.modals.contactSettings.saveError)
      }

      showToast(t.admin.modals.contactSettings.saved, 'success')
      if (onSave) onSave()
      onClose()
    } catch (error: any) {
      console.error('Save contact settings error:', error)
      showToast(error.message || t.admin.modals.contactSettings.saveError, 'error')
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
          <h2 className="text-lg font-bold text-gray-900">{t.admin.modals.contactSettings.title}</h2>
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
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t.admin.modals.contactSettings.location}
              </label>
              <input
                type="text"
                value={settings.contactLocation}
                onChange={(e) => setSettings((prev) => ({ ...prev, contactLocation: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t.admin.modals.contactSettings.locationPlaceholder}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t.admin.modals.contactSettings.phone}
              </label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings((prev) => ({ ...prev, contactPhone: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t.admin.modals.contactSettings.phonePlaceholder}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t.admin.modals.contactSettings.email}
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings((prev) => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t.admin.modals.contactSettings.emailPlaceholder}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t.admin.modals.contactSettings.hours}
              </label>
              <input
                type="text"
                value={settings.contactHours}
                onChange={(e) => setSettings((prev) => ({ ...prev, contactHours: e.target.value }))}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t.admin.modals.contactSettings.hoursPlaceholder}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={saving}
            >
              {t.admin.modals.contactSettings.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? t.admin.modals.contactSettings.saving : t.admin.modals.contactSettings.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

