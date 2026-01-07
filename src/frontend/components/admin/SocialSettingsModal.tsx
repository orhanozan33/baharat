'use client'

import { useState, useEffect } from 'react'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface SocialSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: () => void
}

export default function SocialSettingsModal({ isOpen, onClose, onSave }: SocialSettingsModalProps) {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    facebook: '',
    instagram: '',
  })

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/social')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || {
          facebook: '',
          instagram: '',
        })
      }
    } catch (error) {
      console.error('Load settings error:', error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch('/api/admin/settings/social', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t.admin.modals.socialSettings.saveError)
      }

      showToast(t.admin.modals.socialSettings.saved, 'success')
      if (onSave) onSave()
      onClose()
    } catch (error: any) {
      console.error('Save settings error:', error)
      showToast(error.message || t.admin.modals.socialSettings.saveError, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        {/* Header */}
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">{t.admin.modals.socialSettings.title}</h2>
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
            {t.admin.modals.socialSettings.description}
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.admin.modals.socialSettings.facebook}
              </label>
              <input
                type="url"
                value={settings.facebook}
                onChange={(e) => setSettings({ ...settings, facebook: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t.admin.modals.socialSettings.facebookPlaceholder}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.admin.modals.socialSettings.instagram}
              </label>
              <input
                type="url"
                value={settings.instagram}
                onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder={t.admin.modals.socialSettings.instagramPlaceholder}
              />
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
              {t.admin.modals.socialSettings.cancel}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? t.admin.modals.socialSettings.saving : t.admin.modals.socialSettings.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

