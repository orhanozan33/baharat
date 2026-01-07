'use client'

import { useParams } from 'next/navigation'
import { getLocale } from '@/lib/i18n'
import { defaultLocale } from '@/i18n'
import { useMemo, useState, useEffect } from 'react'
import trMessages from '@/messages/tr.json'
import enMessages from '@/messages/en.json'
import frMessages from '@/messages/fr.json'

const messages: Record<string, any> = {
  tr: trMessages,
  en: enMessages,
  fr: frMessages,
}

export function useTranslations() {
  const params = useParams()
  const [pathname, setPathname] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname)
      
      const handleLocationChange = () => {
        setPathname(window.location.pathname)
      }
      
      window.addEventListener('popstate', handleLocationChange)
      window.addEventListener('pushstate', handleLocationChange)
      window.addEventListener('replacestate', handleLocationChange)
      
      return () => {
        window.removeEventListener('popstate', handleLocationChange)
        window.removeEventListener('pushstate', handleLocationChange)
        window.removeEventListener('replacestate', handleLocationChange)
      }
    }
  }, [])
  
  // Pathname'den locale çıkar (örn: /tr/products -> tr)
  const pathLocale = pathname?.split('/')[1]
  const locale = getLocale(pathLocale || params?.locale as string | undefined)
  
  return useMemo(() => {
    const translations = messages[locale] || messages[defaultLocale]
    return (key: string) => {
      const keys = key.split('.')
      let value: any = translations
      for (const k of keys) {
        value = value?.[k]
      }
      return value || key
    }
  }, [locale, pathname])
}

