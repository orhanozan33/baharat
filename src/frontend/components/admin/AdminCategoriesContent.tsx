'use client'

import { useState } from 'react'
import Link from 'next/link'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface AdminCategoriesContentProps {
  categories: any[]
}

export default function AdminCategoriesContent({ categories: initialCategories }: AdminCategoriesContentProps) {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [categories, setCategories] = useState(initialCategories)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (categoryId: string) => {
    if (!confirm(t.admin.pages.categories.actions.deleteConfirm)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCategories(categories.filter((c) => c.id !== categoryId))
        showToast(t.admin.pages.categories.actions.deleted, 'success')
      } else {
        showToast(t.admin.pages.categories.actions.deleteError, 'error')
      }
    } catch (error) {
      console.error('Delete error:', error)
      showToast(t.admin.common.actions.error, 'error')
    }
  }

  const handleToggleActive = async (category: any) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...category,
          isActive: !category.isActive,
        }),
      })

      if (response.ok) {
        setCategories(
          categories.map((c) =>
            c.id === category.id ? { ...c, isActive: !c.isActive } : c
          )
        )
      }
    } catch (error) {
      console.error('Toggle error:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.admin.pages.categories.title}</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t.admin.pages.categories.totalCategories.replace('{count}', filteredCategories.length.toString())}
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-primary-600 text-white px-3 md:px-6 py-1.5 md:py-2 rounded-lg hover:bg-primary-700 transition font-medium text-xs md:text-base whitespace-nowrap w-full md:w-auto text-center"
        >
          {t.admin.pages.categories.addNew}
        </Link>
      </div>

      {/* Arama */}
      <div className="mb-4 md:mb-6">
        <input
          type="text"
          placeholder={t.admin.pages.categories.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
        />
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.categories.table.category}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">{t.admin.pages.categories.table.slug}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">{t.admin.pages.categories.table.parent}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">{t.admin.pages.categories.table.order}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.categories.table.status}</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700">{t.admin.pages.categories.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.length > 0 ? (
              filteredCategories.map((category) => (
                <tr key={category.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                          📦
                        </div>
                      )}
                      <span className="font-semibold text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{category.slug}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {category.parent?.name || '-'}
                  </td>
                  <td className="p-4 text-sm text-gray-600">{category.order}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(category)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${
                        category.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {category.isActive ? t.admin.common.status.active : t.admin.common.status.inactive}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/categories/${category.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        {t.admin.pages.categories.actions.edit}
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        {t.admin.pages.categories.actions.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  {t.admin.pages.categories.notFound}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


