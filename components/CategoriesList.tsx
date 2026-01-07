'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  parent: { id: string; name: string; slug: string } | null
}

interface CategoriesListProps {
  categories: Category[]
  selectedCategory: string | null
  locale: string
  t: any
}

export default function CategoriesList({
  categories,
  selectedCategory,
  locale,
  t,
}: CategoriesListProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Parent kategorileri al
  const parentCategories = categories.filter((c) => !c.parent)

  if (!mounted) {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4">{t?.nav?.categories || 'Kategoriler'}</h2>
          <div className="space-y-2">
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
            <div className="h-12 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobilde Toggle Butonu */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden w-full bg-white p-4 flex items-center justify-between font-semibold text-gray-900 hover:bg-gray-50 transition border-b border-gray-200"
        aria-label="Kategorileri Aç/Kapat"
        aria-expanded={isExpanded}
      >
        <span className="flex items-center gap-2">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          {t?.nav?.categories || 'Kategoriler'}
        </span>
        <svg
          className={`w-5 h-5 transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Kategori Listesi */}
      <div
        className={`${
          isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
        } md:max-h-none md:opacity-100 overflow-hidden transition-all duration-300 ease-in-out`}
      >
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold mb-4 hidden md:block">
            {t?.nav?.categories || 'Kategoriler'}
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                href={`/${locale}/categories`}
                onClick={() => setIsExpanded(false)}
                className={`block p-3 rounded-lg transition min-h-[44px] flex items-center touch-manipulation ${
                  !selectedCategory
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'bg-gray-100 hover:bg-primary-100 active:bg-primary-200 text-gray-700 hover:text-primary-600'
                }`}
              >
                {t?.common?.all || 'Tümü'}
              </Link>
            </li>
            {parentCategories.map((categoryItem: any) => (
              <li key={categoryItem.id}>
                <Link
                  href={`/${locale}/categories?category=${categoryItem.slug}`}
                  onClick={() => setIsExpanded(false)}
                  className={`block p-3 rounded-lg transition min-h-[44px] flex items-center touch-manipulation ${
                    selectedCategory === categoryItem.slug
                      ? 'bg-primary-600 text-white font-semibold'
                      : 'bg-gray-100 hover:bg-primary-100 active:bg-primary-200 text-gray-700 hover:text-primary-600'
                  }`}
                >
                  {categoryItem.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

