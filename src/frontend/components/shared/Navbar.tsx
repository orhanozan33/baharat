'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { locales, localeNames, type Locale } from '@/i18n'

interface NavbarProps {
  locale: string
}

export function Navbar({ locale }: NavbarProps) {
  const [cartCount, setCartCount] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [mounted, setMounted] = useState(false)
  const [pathname, setPathname] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
    
    // Pathname'i window.location'dan al (SSR-safe)
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname)
      
      const updateCartCount = () => {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]')
        setCartCount(cart.reduce((sum: number, item: any) => sum + item.quantity, 0))
      }
      
      updateCartCount()
      window.addEventListener('cartUpdated', updateCartCount)
      
      // Pathname değişikliklerini dinle
      const handleLocationChange = () => {
        setPathname(window.location.pathname)
      }
      window.addEventListener('popstate', handleLocationChange)
      
      // Next.js router değişikliklerini dinle
      const handleRouteChange = () => {
        setPathname(window.location.pathname)
      }
      window.addEventListener('pushstate', handleRouteChange)
      window.addEventListener('replacestate', handleRouteChange)
      
      return () => {
        window.removeEventListener('cartUpdated', updateCartCount)
        window.removeEventListener('popstate', handleLocationChange)
        window.removeEventListener('pushstate', handleRouteChange)
        window.removeEventListener('replacestate', handleRouteChange)
      }
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/${locale}/products?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const currentPath = pathname ? pathname.replace(`/${locale}`, '') || '/' : '/'
  
  // Translations hook - React Hook rules: always call hooks unconditionally
  const t = useTranslations()

  return (
    <>
      {/* Üst Bar */}
      <div className="bg-gray-800 text-white text-sm py-2 relative z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex gap-6 items-center">
              <div className="flex gap-2 items-center">
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={`/${loc}${currentPath}`}
                    className={`px-2 py-1 rounded transition font-medium text-sm ${
                      locale === loc
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700'
                    }`}
                    title={localeNames[loc]}
                  >
                    {loc.toUpperCase()}
                  </Link>
                ))}
              </div>
              <span className="hidden sm:inline">📞 +1 (514) 726-7067</span>
            </div>
            <div className="hidden md:flex gap-4">
              <Link href={`/${locale}/orders`} className="hover:text-primary-400">{t('nav.orders')}</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Ana Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href={`/${locale}`} className="text-2xl font-bold text-primary-600 hover:text-primary-700 transition flex-shrink-0">
              Epice Buhara
            </Link>

            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('nav.search')}
                  className="w-full px-3 md:px-4 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 bg-primary-600 text-white px-3 md:px-4 py-1.5 rounded hover:bg-primary-700 active:bg-primary-800 transition touch-manipulation text-sm md:text-base"
                  aria-label={t('nav.search')}
                >
                  <span className="hidden md:inline">🔍 {t('nav.search')}</span>
                  <span className="md:hidden">🔍</span>
                </button>
              </div>
            </form>

            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">

              <Link
                href={`/${locale}/cart`}
                className="relative p-2 hover:text-primary-600 transition text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {mounted && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Giriş linki kaldırıldı - sadece admin var, admin /admin üzerinden giriş yapar */}
            </div>
          </div>

          <div className="border-t border-gray-200 py-2">
            <div className="flex items-center gap-6 overflow-x-auto">
              <Link href={`/${locale}`} className={`whitespace-nowrap py-2 text-sm font-medium transition ${mounted && pathname && (pathname === `/${locale}` || pathname === `/${locale}/`) ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
                {t('nav.allProducts')}
              </Link>
              <Link href={`/${locale}/categories`} className={`whitespace-nowrap py-2 text-sm font-medium transition ${mounted && pathname && (pathname === `/${locale}/categories` || pathname.startsWith(`/${locale}/categories`)) ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
                {t('nav.categories')}
              </Link>
              <Link href={`/${locale}/campaigns`} className={`whitespace-nowrap py-2 text-sm font-medium transition ${mounted && pathname && (pathname === `/${locale}/campaigns` || pathname.startsWith(`/${locale}/campaigns`)) ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
                {t('nav.campaigns')}
              </Link>
              <Link href={`/${locale}/new-products`} className={`whitespace-nowrap py-2 text-sm font-medium transition ${mounted && pathname && (pathname === `/${locale}/new-products` || pathname.startsWith(`/${locale}/new-products`)) ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-700 hover:text-primary-600'}`}>
                {t('nav.newProducts')}
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
