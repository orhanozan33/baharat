'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface AdminSidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function AdminSidebar({ isOpen, onToggle }: AdminSidebarProps) {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [pathname, setPathname] = useState<string | null>(null)
  
  const menuItems = [
    { href: '/admin/products', label: t.admin.products, icon: '📦' },
    { href: '/admin/categories', label: t.admin.categories, icon: '📂' },
    { href: '/admin/orders', label: t.admin.orders, icon: '🛒' },
    { href: '/admin/dealers', label: t.admin.dealers, icon: '🏢' },
    { href: '/admin/users', label: t.admin.users, icon: '👥' },
    { href: '/admin/reports', label: t.admin.reports, icon: '📈' },
    { href: '/admin/settings', label: t.admin.settings, icon: '⚙️' },
  ]
  
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
  
  return (
    <>
      {/* Overlay - Mobilde sidebar açıkken */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity"
          aria-label="Sidebar'ı kapat"
        />
      )}
      
      {/* Toggle Button - Her zaman göster (mobilde header'da, desktop'ta sidebar içinde) */}
      <button
        onClick={onToggle}
        className={`fixed md:hidden left-3 top-3 z-50 bg-primary-600 text-white p-3 rounded-lg shadow-lg hover:bg-primary-700 active:bg-primary-800 transition-colors touch-manipulation ${
          isOpen ? 'hidden' : 'block'
        }`}
        aria-label={isOpen ? "Sidebar'ı kapat" : "Sidebar'ı aç"}
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <aside
        className={`${
          isOpen ? 'w-56 md:w-56 translate-x-0' : '-translate-x-full md:-translate-x-full w-0 md:w-0'
        } bg-white shadow-lg min-h-screen fixed top-0 left-0 z-40 transition-transform duration-200 ease-in-out overflow-hidden will-change-transform ${
          isOpen ? 'md:relative' : ''
        }`}
      >

      <nav className="p-2 md:p-4">
        <ul className="space-y-1 md:space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname && (pathname === item.href || pathname.startsWith(`${item.href}/`))
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => {
                    // Sayfayı en üste scroll et
                    if (typeof window !== 'undefined') {
                      window.scrollTo({ top: 0, behavior: 'instant' })
                    }
                    // Mobilde sidebar'ı kapat
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      onToggle()
                    }
                  }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-base touch-manipulation ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                  }`}
                  style={{ minHeight: '48px' }}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
    </>
  )
}
