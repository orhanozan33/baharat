'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { locales, type Locale } from '@/i18n'

interface AdminLocaleContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const AdminLocaleContext = createContext<AdminLocaleContextType | undefined>(undefined)

export function AdminLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('tr')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('admin-locale') as Locale
      if (savedLocale && locales.includes(savedLocale)) {
        setLocaleState(savedLocale)
      }
    }
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-locale', newLocale)
    }
  }

  return (
    <AdminLocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </AdminLocaleContext.Provider>
  )
}

export function useAdminLocale() {
  const context = useContext(AdminLocaleContext)
  if (context === undefined) {
    throw new Error('useAdminLocale must be used within AdminLocaleProvider')
  }
  return context
}



