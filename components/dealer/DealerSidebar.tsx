'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export function DealerSidebar() {
  const [pathname, setPathname] = useState<string | null>(null)
  const router = useRouter()
  
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

  const handleLogout = () => {
    localStorage.removeItem('auth-token')
    router.push('/dealer/login')
  }

  const navItems = [
    { href: '/dealer/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/dealer/products', label: 'Ürünler', icon: '📦' },
    { href: '/dealer/orders', label: 'Siparişlerim', icon: '🛒' },
  ]

  return (
    <aside className="w-64 bg-gray-800 text-white min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold">Bayi Panel</h2>
      </div>
      <nav className="p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 p-3 rounded-lg transition ${
                  pathname === item.href
                    ? 'bg-primary-600 text-white'
                    : 'hover:bg-gray-700'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="w-full text-left p-3 rounded-lg hover:bg-gray-700 transition"
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}


