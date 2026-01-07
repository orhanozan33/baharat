'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'
import { formatPrice } from '@/lib/utils'

interface AdminDashboardContentProps {
  stats: {
    totalProducts: number
    totalCategories: number
    totalOrders: number
    totalDealers: number
    pendingOrders: number
    totalRevenue: number
    activeProducts: number
    activeDealers: number
  }
}

export default function AdminDashboardContent({ stats }: AdminDashboardContentProps) {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const pathname = usePathname()
  
  // Akordeon durumları - desktop'ta kullanılacak
  const [expandedStats, setExpandedStats] = useState<{ [key: string]: boolean }>({
    products: true,
    categories: true,
    orders: true,
    revenue: true,
  })
  
  const [expandedManagement, setExpandedManagement] = useState<{ [key: string]: boolean }>({
    products: true,
    categories: true,
    orders: true,
    dealers: true,
    users: true,
    reports: true,
  })

  // Scroll davranışını kaldırdık - sayfa doğal konumunda kalacak
  
  const toggleStat = (key: string) => {
    setExpandedStats(prev => ({ ...prev, [key]: !prev[key] }))
  }
  
  const toggleManagement = (key: string) => {
    setExpandedManagement(prev => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="w-full overflow-x-hidden">
      <div className="max-w-7xl xl:max-w-[1400px] mx-auto">
        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8 mb-3 sm:mb-4 md:mb-6 lg:mb-8 overflow-x-hidden mt-0 md:mt-8 lg:mt-10">
          {/* Products Stat */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-visible">
            <button
              onClick={() => toggleStat('products')}
              className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 md:p-5 lg:p-6 cursor-pointer hover:bg-gray-50 transition-colors md:block"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex-1 min-w-0 overflow-visible text-left">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{t.admin.stats.totalProducts}</p>
                  <div className={`transition-all duration-300 overflow-hidden ${expandedStats.products ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'} md:max-h-20 md:opacity-100`}>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalProducts}</p>
                    <p className="text-xs sm:text-sm text-green-600 mt-1 truncate">{stats.activeProducts} {t.admin.stats.activeProducts}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                    <span className="text-lg sm:text-xl md:text-2xl block">📦</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 hidden md:block ${expandedStats.products ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Categories Stat */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-visible">
            <button
              onClick={() => toggleStat('categories')}
              className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 md:p-5 lg:p-6 cursor-pointer hover:bg-gray-50 transition-colors md:block"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex-1 min-w-0 overflow-visible text-left">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{t.admin.stats.totalCategories}</p>
                  <div className={`transition-all duration-300 overflow-hidden ${expandedStats.categories ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'} md:max-h-20 md:opacity-100`}>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalCategories}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 rounded-full p-2 sm:p-2.5 md:p-3 flex-shrink-0">
                    <span className="text-lg sm:text-xl md:text-2xl block">📂</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 hidden md:block ${expandedStats.categories ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Orders Stat */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-visible">
            <button
              onClick={() => toggleStat('orders')}
              className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 md:p-5 lg:p-6 cursor-pointer hover:bg-gray-50 transition-colors md:block"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex-1 min-w-0 overflow-visible text-left">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{t.admin.stats.totalOrders}</p>
                  <div className={`transition-all duration-300 overflow-hidden ${expandedStats.orders ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'} md:max-h-20 md:opacity-100`}>
                    <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{stats.totalOrders}</p>
                    <p className="text-xs sm:text-sm text-orange-600 mt-1 truncate">{stats.pendingOrders} {t.admin.stats.pendingOrders}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-yellow-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                    <span className="text-lg sm:text-xl md:text-2xl block">🛒</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 hidden md:block ${expandedStats.orders ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>

          {/* Revenue Stat */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-visible">
            <button
              onClick={() => toggleStat('revenue')}
              className="w-full flex items-center justify-between gap-2 p-3 sm:p-4 md:p-5 lg:p-6 cursor-pointer hover:bg-gray-50 transition-colors md:block"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <div className="flex-1 min-w-0 overflow-visible text-left">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{t.admin.stats.totalRevenue}</p>
                  <div className={`transition-all duration-300 overflow-hidden ${expandedStats.revenue ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'} md:max-h-20 md:opacity-100`}>
                    <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 mt-1 sm:mt-2 break-all overflow-hidden">
                      {formatPrice(stats.totalRevenue)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-green-100 rounded-full p-2 sm:p-3 flex-shrink-0">
                    <span className="text-lg sm:text-xl md:text-2xl block">💰</span>
                  </div>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform duration-300 hidden md:block ${expandedStats.revenue ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Management Menu */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 lg:gap-8 overflow-x-hidden mt-0 md:mt-10 lg:mt-12">
          {/* Product Management */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 border-blue-500 overflow-hidden">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6">
              <div className="bg-blue-100 rounded-lg p-2 sm:p-2.5 md:p-3 flex-shrink-0">
                <span className="text-xl sm:text-2xl md:text-3xl block">📦</span>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Link
                    href="/admin/products"
                    className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors flex-1"
                    onClick={(e) => {
                      if (window.innerWidth >= 768) {
                        e.preventDefault()
                        toggleManagement('products')
                      }
                    }}
                  >
                    {t.admin.management.products}
                  </Link>
                  <button
                    onClick={() => toggleManagement('products')}
                    className="hidden md:flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <svg 
                      className={`w-5 h-5 transition-transform duration-300 ${expandedManagement.products ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${expandedManagement.products ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} md:block md:max-h-40 md:opacity-100`}>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 overflow-hidden">
                    {t.admin.management.productsDesc}
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5 sm:mt-2 truncate">{stats.totalProducts} {t.admin.productsCount}</p>
                  <Link
                    href="/admin/products"
                    className="inline-block mt-2 text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t.admin.management.viewDetails || 'Detayları Gör →'}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Category Management */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 border-green-500 overflow-hidden">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6">
              <div className="bg-green-100 rounded-lg p-2 sm:p-2.5 md:p-3 flex-shrink-0">
                <span className="text-xl sm:text-2xl md:text-3xl block">📂</span>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Link
                    href="/admin/categories"
                    className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate hover:text-green-600 transition-colors flex-1"
                    onClick={(e) => {
                      if (window.innerWidth >= 768) {
                        e.preventDefault()
                        toggleManagement('categories')
                      }
                    }}
                  >
                    {t.admin.management.categories}
                  </Link>
                  <button
                    onClick={() => toggleManagement('categories')}
                    className="hidden md:flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <svg 
                      className={`w-5 h-5 transition-transform duration-300 ${expandedManagement.categories ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${expandedManagement.categories ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} md:block md:max-h-40 md:opacity-100`}>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 overflow-hidden">
                    {t.admin.management.categoriesDesc}
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5 sm:mt-2 truncate">{stats.totalCategories} {t.admin.categoriesCount}</p>
                  <Link
                    href="/admin/categories"
                    className="inline-block mt-2 text-xs sm:text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    {t.admin.management.viewDetails || 'Detayları Gör →'}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Order Management */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 border-yellow-500 overflow-hidden">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6">
              <div className="bg-yellow-100 rounded-lg p-2 sm:p-2.5 md:p-3 flex-shrink-0">
                <span className="text-xl sm:text-2xl md:text-3xl block">🛒</span>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Link
                    href="/admin/orders"
                    className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate hover:text-yellow-600 transition-colors flex-1"
                    onClick={(e) => {
                      if (window.innerWidth >= 768) {
                        e.preventDefault()
                        toggleManagement('orders')
                      }
                    }}
                  >
                    {t.admin.management.orders}
                  </Link>
                  <button
                    onClick={() => toggleManagement('orders')}
                    className="hidden md:flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <svg 
                      className={`w-5 h-5 transition-transform duration-300 ${expandedManagement.orders ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${expandedManagement.orders ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} md:block md:max-h-40 md:opacity-100`}>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 overflow-hidden">
                    {t.admin.management.ordersDesc}
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5 sm:mt-2 truncate">{stats.pendingOrders} {t.admin.pendingOrdersCount}</p>
                  <Link
                    href="/admin/orders"
                    className="inline-block mt-2 text-xs sm:text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                  >
                    {t.admin.management.viewDetails || 'Detayları Gör →'}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Dealer Management */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 border-purple-500 overflow-hidden">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6">
              <div className="bg-purple-100 rounded-lg p-2 sm:p-2.5 md:p-3 flex-shrink-0">
                <span className="text-xl sm:text-2xl md:text-3xl block">🏢</span>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Link
                    href="/admin/dealers"
                    className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate hover:text-purple-600 transition-colors flex-1"
                    onClick={(e) => {
                      if (window.innerWidth >= 768) {
                        e.preventDefault()
                        toggleManagement('dealers')
                      }
                    }}
                  >
                    {t.admin.management.dealers}
                  </Link>
                  <button
                    onClick={() => toggleManagement('dealers')}
                    className="hidden md:flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <svg 
                      className={`w-5 h-5 transition-transform duration-300 ${expandedManagement.dealers ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${expandedManagement.dealers ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} md:block md:max-h-40 md:opacity-100`}>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 overflow-hidden">
                    {t.admin.management.dealersDesc}
                  </p>
                  <p className="text-xs text-gray-500 mt-1.5 sm:mt-2 truncate">{stats.activeDealers} {t.admin.stats.activeDealers}</p>
                  <Link
                    href="/admin/dealers"
                    className="inline-block mt-2 text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    {t.admin.management.viewDetails || 'Detayları Gör →'}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* User Management */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 border-indigo-500 overflow-hidden">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6">
              <div className="bg-indigo-100 rounded-lg p-2 sm:p-2.5 md:p-3 flex-shrink-0">
                <span className="text-xl sm:text-2xl md:text-3xl block">👥</span>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Link
                    href="/admin/users"
                    className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate hover:text-indigo-600 transition-colors flex-1"
                    onClick={(e) => {
                      if (window.innerWidth >= 768) {
                        e.preventDefault()
                        toggleManagement('users')
                      }
                    }}
                  >
                    {t.admin.management.users}
                  </Link>
                  <button
                    onClick={() => toggleManagement('users')}
                    className="hidden md:flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <svg 
                      className={`w-5 h-5 transition-transform duration-300 ${expandedManagement.users ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${expandedManagement.users ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} md:block md:max-h-40 md:opacity-100`}>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 overflow-hidden">
                    {t.admin.management.usersDesc}
                  </p>
                  <Link
                    href="/admin/users"
                    className="inline-block mt-2 text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    {t.admin.management.viewDetails || 'Detayları Gör →'}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all border-l-4 border-red-500 overflow-hidden">
            <div className="flex items-start gap-2 sm:gap-3 md:gap-4 p-3 sm:p-4 md:p-6">
              <div className="bg-red-100 rounded-lg p-2 sm:p-2.5 md:p-3 flex-shrink-0">
                <span className="text-xl sm:text-2xl md:text-3xl block">📊</span>
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Link
                    href="/admin/reports"
                    className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 truncate hover:text-red-600 transition-colors flex-1"
                    onClick={(e) => {
                      if (window.innerWidth >= 768) {
                        e.preventDefault()
                        toggleManagement('reports')
                      }
                    }}
                  >
                    {t.admin.management.reports}
                  </Link>
                  <button
                    onClick={() => toggleManagement('reports')}
                    className="hidden md:flex items-center justify-center w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    <svg 
                      className={`w-5 h-5 transition-transform duration-300 ${expandedManagement.reports ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                <div className={`transition-all duration-300 overflow-hidden ${expandedManagement.reports ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} md:block md:max-h-40 md:opacity-100`}>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2 overflow-hidden">
                    {t.admin.management.reportsDesc}
                  </p>
                  <Link
                    href="/admin/reports"
                    className="inline-block mt-2 text-xs sm:text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    {t.admin.management.viewDetails || 'Detayları Gör →'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


