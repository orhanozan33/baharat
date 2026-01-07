'use client'

import { ReactNode, useState, useEffect, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname as useNextPathname } from 'next/navigation'
import { ToastContainer } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { locales, localeNames, type Locale } from '@/i18n'
import { AdminLocaleProvider, useAdminLocale } from '@/contexts/AdminLocaleContext'

function AdminLayoutContent({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { locale: adminLocale, setLocale } = useAdminLocale()
  const nextPathname = useNextPathname()
  const [pathname, setPathname] = useState<string | null>(null)
  const [dashboardExpanded, setDashboardExpanded] = useState<boolean>(false)
  
  // Next.js pathname'i kullan
  useEffect(() => {
    if (nextPathname) {
      setPathname(nextPathname)
    }
  }, [nextPathname])
  
  // Sayfa yüklendiğinde ve route değiştiğinde en üste scroll yap
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
      
      // İlk yüklemede scroll yap
      scrollToTop()
      // DOM yüklendikten sonra tekrar scroll yap
      setTimeout(scrollToTop, 0)
      setTimeout(scrollToTop, 100)
    }
  }, [pathname])
  
  const isLoginPage = useMemo(() => {
    if (typeof window === 'undefined' || !pathname) return false
    return pathname.includes('/admin/login') || pathname === '/admin/login'
  }, [pathname])
  
  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
    // Sayfayı yenile
    router.refresh()
  }
  
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }
  
  const t = getTranslations(adminLocale)
  
  // Dashboard alt menü öğeleri - useMemo ile memoize edildi
  const dashboardSubItems = useMemo(() => [
    { href: '/admin/products', label: t.admin.products, icon: '📦' },
    { href: '/admin/categories', label: t.admin.categories, icon: '📂' },
    { href: '/admin/orders', label: t.admin.orders, icon: '🛒' },
    { href: '/admin/dealers', label: t.admin.dealers, icon: '🏢' },
    { href: '/admin/users', label: t.admin.users, icon: '👥' },
    { href: '/admin/reports', label: t.admin.reports, icon: '📈' },
    { href: '/admin/settings', label: t.admin.settings, icon: '⚙️' },
  ], [t.admin])
  
  // Dashboard dropdown'u sadece butona tıklandığında açılır/kapanır
  // Otomatik açılma kaldırıldı
  
  // Dropdown dışına tıklandığında kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (dashboardExpanded && !target.closest('.dashboard-dropdown')) {
        setDashboardExpanded(false)
      }
    }
    
    if (dashboardExpanded) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dashboardExpanded])
  
  // Login sayfası için sadece children render et - sidebar yok
  if (isLoginPage) {
    return <>{children}</>
  }
  
  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden admin-layout">
      {/* Header */}
      <header className="transition-all duration-200 h-14 md:h-20">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 h-full flex justify-between items-center max-w-full">
          <div className="flex items-center min-w-0 flex-1 relative">
            {/* Dashboard Akordeon Butonu */}
            <div className="relative dashboard-dropdown flex-shrink-0">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setDashboardExpanded(prev => !prev)
                }}
                className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 rounded transition-colors text-xs sm:text-sm md:text-base font-semibold text-gray-900 hover:text-gray-700 cursor-pointer z-10 relative whitespace-nowrap"
                type="button"
              >
                <span className="text-sm sm:text-base md:text-lg">📊</span>
                <span className="hidden sm:inline">{t.admin.dashboard}</span>
                <svg 
                  className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-400 transition-transform duration-300 ${dashboardExpanded ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dashboard Alt Menü - Mobil ve Desktop'ta dropdown */}
              <div className={`absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px] md:min-w-[200px] w-full md:w-auto transition-all duration-300 overflow-hidden ${
                dashboardExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
              }`}>
                <ul className="py-1">
                  {dashboardSubItems.map((subItem) => {
                    const isSubActive = pathname && (pathname === subItem.href || pathname.startsWith(`${subItem.href}/`))
                    return (
                      <li key={subItem.href}>
                        <Link
                          href={subItem.href}
                          onClick={() => {
                            setDashboardExpanded(false)
                          }}
                          className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                            isSubActive
                              ? 'text-primary-700 font-semibold bg-primary-50'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="text-base">{subItem.icon}</span>
                          <span>{subItem.label}</span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0">
            {/* Dil Seçici - Mobilde de görünür, küçültülmüş */}
            <div className="flex items-center gap-0.5 sm:gap-1 md:gap-2 border border-gray-300 rounded-md overflow-hidden scale-[0.7] sm:scale-100 origin-right">
              {locales.map((locale) => {
                const localeShort: Record<Locale, string> = {
                  tr: 'TR',
                  en: 'EN',
                  fr: 'FR',
                }
                return (
                  <button
                    key={locale}
                    onClick={() => handleLocaleChange(locale)}
                    className={`px-1 sm:px-1.5 md:px-2.5 py-0.5 sm:py-1 md:py-1.5 text-[10px] sm:text-xs md:text-sm font-medium transition ${
                      adminLocale === locale
                        ? 'bg-primary-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {localeShort[locale]}
                  </button>
                )
              })}
            </div>
            
            <Link
              href="/"
              className="hidden md:block text-gray-600 hover:text-gray-900 px-2 md:px-3 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium"
            >
              {t.admin.backToSite}
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-md text-xs md:text-sm font-medium hover:bg-red-700 whitespace-nowrap"
            >
              <span className="hidden sm:inline">{t.auth.logout}</span>
              <span className="sm:hidden">Çıkış</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="p-3 sm:p-4 md:p-6 lg:p-8 xl:p-10 transition-all duration-200 overflow-x-hidden">
        {/* Geri Butonu - Dashboard hariç tüm sayfalarda */}
        {pathname && pathname !== '/admin/dashboard' && (
          <div className="mb-3 sm:mb-4 md:mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm sm:text-base font-medium touch-manipulation"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>{t.admin.back || 'Geri'}</span>
            </button>
          </div>
        )}
        {children}
      </main>
      <ToastContainer />
    </div>
  )
}

export default function AdminLayoutClient({ children }: { children: ReactNode }) {
  return (
    <AdminLocaleProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminLocaleProvider>
  )
}

