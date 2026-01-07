import { defaultLocale, locales, type Locale } from '@/i18n'
import { notFound } from 'next/navigation'

// Static imports for translation files
import trMessages from '@/messages/tr.json'
import enMessages from '@/messages/en.json'
import frMessages from '@/messages/fr.json'

const translations: Record<string, any> = {
  tr: trMessages,
  en: enMessages,
  fr: frMessages,
}

export function getTranslations(locale: Locale) {
  const translationsObj = translations[locale] || translations[defaultLocale]
  if (!translationsObj) {
    notFound()
  }
  return translationsObj
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale)
}

export function getLocale(locale: string | undefined): Locale {
  if (!locale || !isValidLocale(locale)) {
    return defaultLocale
  }
  return locale
}


