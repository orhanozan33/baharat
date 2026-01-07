'use client'

import { useState, useMemo, memo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface AdminProductsContentProps {
  products: any[]
}

function AdminProductsContent({ products: initialProducts }: AdminProductsContentProps) {
  const router = useRouter()
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [products, setProducts] = useState(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredProducts = useMemo(() => products.filter((product) => {
    // Arama filtresi
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.sku && product.sku.toLowerCase().includes(searchTerm.toLowerCase()))
    
    // Durum filtresi
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && product.isActive === true) ||
      (statusFilter === 'inactive' && product.isActive === false)
    
    return matchesSearch && matchesStatus
  }), [products, searchTerm, statusFilter])

  const handleDelete = async (productId: string) => {
    if (!confirm(t.admin.pages.products.actions.deleteConfirm)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== productId))
        showToast(t.admin.pages.products.actions.deleted, 'success')
      } else {
        showToast(t.admin.pages.products.actions.deleteError, 'error')
      }
    } catch (error) {
      console.error('Delete error:', error)
      showToast(t.admin.common.actions.error, 'error')
    }
  }

  const handleToggleActive = async (product: any) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...product,
          isActive: !product.isActive,
        }),
      })

      if (response.ok) {
        setProducts(
          products.map((p) =>
            p.id === product.id ? { ...p, isActive: !p.isActive } : p
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
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.admin.pages.products.title}</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t.admin.pages.products.totalProducts.replace('{count}', filteredProducts.length.toString())}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-primary-600 text-white px-3 md:px-6 py-1.5 md:py-2 rounded-lg hover:bg-primary-700 transition font-medium text-xs md:text-base whitespace-nowrap w-full md:w-auto text-center"
        >
          {t.admin.pages.products.addNew}
        </Link>
      </div>

      {/* Arama ve Filtreler */}
      <div className="mb-4 md:mb-6 flex flex-col md:flex-row gap-3 md:gap-4">
        <input
          type="text"
          placeholder={t.admin.pages.products.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 touch-manipulation"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition touch-manipulation ${
              statusFilter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            style={{ minHeight: '44px' }}
          >
            {t.admin.pages.products.filters.all} ({products.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition touch-manipulation ${
              statusFilter === 'active'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            style={{ minHeight: '44px' }}
          >
            {t.admin.pages.products.filters.active} ({products.filter(p => p.isActive === true).length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition touch-manipulation ${
              statusFilter === 'inactive'
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            style={{ minHeight: '44px' }}
          >
            {t.admin.pages.products.filters.inactive} ({products.filter(p => p.isActive === false).length})
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full min-w-[800px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.products.table.product}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">{t.admin.pages.products.table.sku}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">{t.admin.pages.products.table.category}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden lg:table-cell">{t.admin.pages.products.table.weight}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.products.table.price}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">{t.admin.pages.products.table.stock}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">{t.admin.pages.products.table.status}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.products.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <tr key={product.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {product.images && product.images.length > 0 && product.images[0] ? (
                        <img
                          src={product.images[0].startsWith('http') || product.images[0].startsWith('/') 
                            ? product.images[0] 
                            : `/${product.images[0]}`}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.png'
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                          {t.admin.pages.products.noImage}
                        </div>
                      )}
                      <div>
                        <span className="font-semibold text-gray-900">{product.name}</span>
                        {product.isFeatured && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                            ⭐ {t.admin.pages.products.featured}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{product.sku}</td>
                  <td className="p-4 text-sm text-gray-600">
                    {product.category?.name || '-'}
                  </td>
                  <td className="p-4">
                    {product.weight && product.weight > 0 ? (
                      <span className="text-sm font-medium text-gray-700">
                        {product.weight}{product.unit || 'g'}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-semibold text-gray-900">
                        {new Intl.NumberFormat('en-CA', {
                          style: 'currency',
                          currency: 'CAD',
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(product.price)}
                      </div>
                      {product.comparePrice && product.comparePrice > product.price && (
                        <div className="text-xs text-gray-400 line-through">
                          {new Intl.NumberFormat('en-CA', {
                            style: 'currency',
                            currency: 'CAD',
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }).format(product.comparePrice)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className={`text-sm font-semibold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock}
                      </span>
                      <span className="text-xs text-gray-500">{product.unit || 'g'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleActive(product)}
                      className={`px-3 py-1 rounded text-xs font-semibold transition ${
                        product.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {product.isActive ? t.admin.common.status.active : t.admin.common.status.inactive}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        {t.admin.pages.products.actions.edit}
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                      >
                        {t.admin.pages.products.actions.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-500">
                  {t.admin.pages.products.notFound}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default memo(AdminProductsContent)


