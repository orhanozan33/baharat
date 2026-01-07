'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'
import Link from 'next/link'
import InvoicePage from '@/components/admin/InvoicePage'

export default function InvoiceDetailPage() {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      loadInvoice()
    }
  }, [params.id])

  const loadInvoice = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/invoices/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setInvoice(data.invoice)
      } else {
        console.error('Invoice not found')
      }
    } catch (error) {
      console.error('Load invoice error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center py-8">Yükleniyor...</div>
        </div>
      </div>
    )
  }

  if (!invoice || !invoice.order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Fatura bulunamadı</p>
              <Link
                href="/admin/settings/invoices"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition inline-block"
              >
                Faturalar Listesine Dön
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-4">
          <Link
            href="/admin/settings/invoices"
            className="text-primary-600 hover:text-primary-700 transition inline-flex items-center gap-2"
          >
            ← Faturalar Listesine Dön
          </Link>
        </div>
        <InvoicePage order={invoice.order} />
      </div>
    </div>
  )
}

