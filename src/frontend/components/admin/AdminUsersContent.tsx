'use client'

import { useState } from 'react'
import Link from 'next/link'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface AdminUsersContentProps {
  users: any[]
}

const roleColors: Record<string, string> = {
  USER: 'bg-blue-100 text-blue-800',
  ADMIN: 'bg-red-100 text-red-800',
  DEALER: 'bg-purple-100 text-purple-800',
}

export default function AdminUsersContent({ users: initialUsers }: AdminUsersContentProps) {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [users, setUsers] = useState(initialUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('ALL')

  const roleLabels: Record<string, string> = {
    USER: t.admin.pages.users.filters.user,
    ADMIN: t.admin.pages.users.filters.admin,
    DEALER: t.admin.pages.users.filters.dealer,
  }

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === 'ALL' || user.role === roleFilter
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesRole && matchesSearch
  })

  const handleDelete = async (userId: string, userName: string) => {
    if (!confirm(t.admin.pages.users.actions.deleteConfirm.replace('{name}', userName))) {
      return
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== userId))
        showToast(t.admin.pages.users.actions.deleted, 'success')
      } else {
        const error = await response.json()
        showToast(error.error || t.admin.pages.users.actions.deleteError, 'error')
      }
    } catch (error) {
      console.error('Delete user error:', error)
      showToast(t.admin.pages.users.actions.deleteError, 'error')
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{t.admin.pages.users.title}</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {t.admin.pages.users.totalUsers.replace('{count}', filteredUsers.length.toString())}
          </p>
        </div>
        <Link
          href="/admin/dealers/new"
          className="bg-primary-600 text-white px-3 md:px-6 py-1.5 md:py-2 rounded-lg hover:bg-primary-700 transition font-medium text-xs md:text-base whitespace-nowrap w-full md:w-auto text-center"
        >
          {t.admin.pages.users.addNew}
        </Link>
      </div>

      {/* Filtreler */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder={t.admin.pages.users.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="ALL">{t.admin.pages.users.filters.allRoles}</option>
          <option value="USER">{t.admin.pages.users.filters.user}</option>
          <option value="ADMIN">{t.admin.pages.users.filters.admin}</option>
          <option value="DEALER">{t.admin.pages.users.filters.dealer}</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto -mx-3 sm:mx-0">
        <table className="w-full min-w-[640px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.users.table.name}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.users.table.email}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700 hidden md:table-cell">{t.admin.pages.users.table.phone}</th>
              <th className="text-left p-2 sm:p-3 md:p-4 text-xs sm:text-sm font-semibold text-gray-700">{t.admin.pages.users.table.role}</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700">{t.admin.pages.users.table.registrationDate}</th>
              <th className="text-left p-4 text-sm font-semibold text-gray-700">{t.admin.pages.users.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <div>
                      <span className="font-semibold text-gray-900">
                        {user.role === 'DEALER' ? (user.companyName || user.dealer?.companyName || user.name) : (user.name || '-')}
                      </span>
                      {user.role === 'DEALER' && user.name && user.name !== user.companyName && (
                        <span className="text-xs text-gray-500 block mt-1">{user.name}</span>
                      )}
                      {user.role === 'DEALER' && user.taxNumber && (
                        <span className="text-xs text-gray-500 block mt-1">{t.admin.pages.users.table.taxNumber}: {user.taxNumber}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{user.email}</td>
                  <td className="p-4 text-sm text-gray-600">{user.phone || '-'}</td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded text-xs font-semibold ${
                        roleColors[user.role] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {roleLabels[user.role] || user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(user.id, user.name || user.email)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                    >
                      {t.admin.pages.users.actions.delete}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">
                  {t.admin.pages.users.notFound}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}


