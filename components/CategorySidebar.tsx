'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  parent: { id: string; name: string; slug: string } | null
}

interface CategorySidebarProps {
  categories: Category[]
  selectedCategory: string | null
  locale: string
  featured: string | null
  t: any
}

export default function CategorySidebar({
  categories,
  selectedCategory,
  locale,
  featured,
  t,
}: CategorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Mobilde seçili kategori varsa otomatik aç
  useEffect(() => {
    if (selectedCategory) {
      const cat = categories.find((c) => c.slug === selectedCategory)
      if (cat?.parent) {
        setExpandedCategories((prev) => new Set(prev).add(cat.parent!.id))
      }
    }
  }, [selectedCategory, categories])

  // Parent kategorileri al
  const parentCategories = categories.filter((c) => !c.parent)

  // Alt kategorileri al
  const getChildCategories = (parentId: string) => {
    return categories.filter((c) => c.parent?.id === parentId)
  }

  const toggleCategory = (categoryId: string, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setExpandedCategories((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  return (
    <>
      {/* Mobil Toggle Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden w-full bg-white rounded-lg shadow-md p-4 mb-4 flex items-center justify-between font-semibold text-gray-900 hover:bg-gray-50 transition"
        aria-label="Kategorileri Aç/Kapat"
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
          {t.nav.categories || 'Kategoriler'}
        </span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
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

      {/* Mobil Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'fixed inset-y-0 left-0 w-80 translate-x-0' : 'hidden -translate-x-full'
        } md:block md:relative w-full md:w-64 flex-shrink-0 z-50 md:z-auto transition-transform duration-300 ease-in-out`}
      >
        <div className="bg-white shadow-md md:rounded-lg p-4 md:p-6 md:sticky md:top-24 max-h-screen md:max-h-[calc(100vh-8rem)] overflow-y-auto h-full md:h-auto">
          {/* Mobil Kapatma Butonu */}
          {isOpen && (
            <div className="flex justify-between items-center mb-4 md:hidden">
              <h2 className="text-xl font-bold">{t.nav.categories || 'Kategoriler'}</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
                aria-label="Kapat"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Desktop Başlık */}
          <h2 className="text-xl font-bold mb-4 hidden md:block">{t.nav.categories || 'Kategoriler'}</h2>

          <ul className="space-y-2">
            {/* Tümü Linki */}
            <li>
              <Link
                href={`/${locale}/products`}
                onClick={() => setIsOpen(false)}
                className={`block p-3 rounded-lg transition min-h-[44px] flex items-center ${
                  !selectedCategory && !featured
                    ? 'bg-primary-600 text-white font-semibold'
                    : 'bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-600'
                }`}
              >
                {t.common.all || 'Tümü'}
              </Link>
            </li>

            {/* Parent Kategoriler */}
            {parentCategories.map((parentCat) => {
              const children = getChildCategories(parentCat.id)
              const hasChildren = children.length > 0
              const isExpanded = expandedCategories.has(parentCat.id)
              const isSelected = selectedCategory === parentCat.slug

              return (
                <li key={parentCat.id}>
                  <div>
                    <div className="flex items-center">
                      {hasChildren ? (
                        <>
                          <button
                            onClick={(e) => toggleCategory(parentCat.id, e)}
                            onTouchStart={(e) => {
                              // Touch için de çalışsın
                              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'
                            }}
                            onTouchEnd={(e) => {
                              e.currentTarget.style.backgroundColor = ''
                            }}
                            className={`flex-1 text-left p-3 rounded-lg transition min-h-[44px] touch-manipulation cursor-pointer select-none ${
                              isSelected
                                ? 'bg-primary-600 text-white font-semibold'
                                : 'bg-gray-100 hover:bg-primary-100 active:bg-primary-200 text-gray-700 hover:text-primary-600'
                            }`}
                            type="button"
                            aria-expanded={isExpanded}
                            aria-label={`${parentCat.name} kategorisini ${isExpanded ? 'kapat' : 'aç'}`}
                          >
                            <div className="flex items-center justify-between pointer-events-none">
                              <span className="pointer-events-none">{parentCat.name}</span>
                              <svg
                                className={`w-5 h-5 transition-transform duration-200 flex-shrink-0 ml-2 pointer-events-none ${
                                  isExpanded ? 'rotate-90' : 'rotate-0'
                                }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5l7 7-7 7"
                                />
                              </svg>
                            </div>
                          </button>
                          <Link
                            href={`/${locale}/products?category=${parentCat.slug}`}
                            onClick={() => setIsOpen(false)}
                            className={`hidden md:block p-2 ml-2 rounded transition touch-manipulation ${
                              isSelected
                                ? 'text-primary-600'
                                : 'text-gray-500 hover:text-primary-600'
                            }`}
                            aria-label={`${parentCat.name} kategorisine git`}
                          >
                            →
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={`/${locale}/products?category=${parentCat.slug}`}
                          onClick={() => setIsOpen(false)}
                          className={`block flex-1 p-3 rounded-lg transition min-h-[44px] ${
                            isSelected
                              ? 'bg-primary-600 text-white font-semibold'
                              : 'bg-gray-100 hover:bg-primary-100 text-gray-700 hover:text-primary-600'
                          }`}
                        >
                          {parentCat.name}
                        </Link>
                      )}
                    </div>

                    {/* Alt Kategoriler */}
                    {hasChildren && isExpanded && (
                      <ul className="mt-1 ml-4 space-y-1 border-l-2 border-gray-200 pl-2 animate-in slide-in-from-top-2 duration-200">
                        {children.map((childCat) => {
                          const isChildSelected = selectedCategory === childCat.slug
                          return (
                            <li key={childCat.id}>
                              <Link
                                href={`/${locale}/products?category=${childCat.slug}`}
                                onClick={() => setIsOpen(false)}
                                className={`block p-2.5 rounded transition text-sm min-h-[44px] flex items-center touch-manipulation ${
                                  isChildSelected
                                    ? 'bg-primary-600 text-white font-semibold'
                                    : 'bg-gray-50 hover:bg-primary-50 active:bg-primary-100 text-gray-700 hover:text-primary-600'
                                }`}
                              >
                                {childCat.name}
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Filters */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold mb-3 text-sm text-gray-700">{t.common.filter || 'Filtreler'}</h3>
            <Link
              href={`/${locale}/products?featured=true`}
              onClick={() => setIsOpen(false)}
              className={`block p-2.5 rounded text-sm transition min-h-[44px] flex items-center ${
                featured === 'true'
                  ? 'bg-primary-600 text-white font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              ⭐ {t.home.featuredProducts || 'Öne Çıkan Ürünler'}
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}

