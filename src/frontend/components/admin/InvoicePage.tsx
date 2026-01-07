'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface InvoicePageProps {
  order: any
}

export default function InvoicePage({ order }: InvoicePageProps) {
  const { locale } = useAdminLocale()
  // Fatura her zaman Fransızca gösterilir
  const t = getTranslations('fr')
  const [receiptLogo, setReceiptLogo] = useState<string>('')
  const [taxRates, setTaxRates] = useState({ federalTaxRate: 5, provincialTaxRate: 8 })
  const [invoiceNumber, setInvoiceNumber] = useState<string>('')
  const [receiptSettings, setReceiptSettings] = useState({
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyTaxNumber: '',
    tpsEnabled: false,
    tpsNumber: '',
    tpsRate: 5,
    tvqEnabled: false,
    tvqNumber: '',
    tvqRate: 9.975,
  })

  useEffect(() => {
    // Load receipt settings
    fetch('/api/admin/settings/receipt')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setReceiptLogo(data.settings.receiptLogo || '')
          setReceiptSettings({
            companyName: data.settings.companyName || '',
            companyAddress: data.settings.companyAddress || '',
            companyPhone: data.settings.companyPhone || '',
            companyEmail: data.settings.companyEmail || '',
            companyTaxNumber: data.settings.companyTaxNumber || '',
            tpsEnabled: data.settings.tpsEnabled || false,
            tpsNumber: data.settings.tpsNumber || '',
            tpsRate: parseFloat(data.settings.tpsRate) || 5,
            tvqEnabled: data.settings.tvqEnabled || false,
            tvqNumber: data.settings.tvqNumber || '',
            tvqRate: parseFloat(data.settings.tvqRate) || 9.975,
          })
        }
      })
      .catch((error) => {
        console.error('Load receipt settings error:', error)
      })

    // Load tax rates
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setTaxRates({
            federalTaxRate: parseFloat(data.settings.federalTaxRate) || 5,
            provincialTaxRate: parseFloat(data.settings.provincialTaxRate) || 8,
          })
        }
      })
      .catch((error) => {
        console.error('Load tax rates error:', error)
      })

    // Get next invoice number
    fetch('/api/admin/invoices/next-number')
      .then((res) => res.json())
      .then((data) => {
        if (data.invoiceNumber) {
          setInvoiceNumber(data.invoiceNumber)
        }
      })
      .catch((error) => {
        console.error('Get invoice number error:', error)
      })
  }, [])

  const statusLabels: Record<string, string> = {
    PENDING: t.orders.status.PENDING,
    CONFIRMED: t.orders.status.CONFIRMED,
    PROCESSING: t.orders.status.PROCESSING,
    SHIPPED: t.orders.status.SHIPPED,
    DELIVERED: t.orders.status.DELIVERED,
    CANCELLED: t.orders.status.CANCELLED,
  }

  // Helper function to clean order number (remove prefixes and timestamps)
  const cleanOrderNumber = (orderNumber: string) => {
    if (!orderNumber) return ''
    // Remove ADMIN-SALE- prefix
    let cleaned = orderNumber.replace(/^ADMIN-SALE-/, '')
    // Remove DEALER- prefix if exists
    cleaned = cleaned.replace(/^DEALER-/, '')
    // Remove ORD- prefix if exists
    cleaned = cleaned.replace(/^ORD-/, '')
    // Remove timestamp part (numbers followed by dash, e.g., "1767724302515-")
    cleaned = cleaned.replace(/^\d+-/, '')
    return cleaned
  }

  const handlePrint = async () => {
    // Get next invoice number before printing
    let currentInvoiceNumber = invoiceNumber
    if (!currentInvoiceNumber) {
      try {
        const response = await fetch('/api/admin/invoices/next-number')
        if (response.ok) {
          const data = await response.json()
          if (data.invoiceNumber) {
            currentInvoiceNumber = data.invoiceNumber
            setInvoiceNumber(currentInvoiceNumber)
            // Wait a bit for state to update, then print
            setTimeout(() => window.print(), 100)
            // Save invoice after getting number
            saveInvoice(currentInvoiceNumber)
            return
          }
        }
      } catch (error) {
        console.error('Get invoice number error:', error)
      }
    } else {
      // Save invoice if number already exists
      saveInvoice(currentInvoiceNumber)
    }
    window.print()
  }

  const saveInvoice = async (invNumber: string) => {
    try {
      await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: invNumber,
          orderId: order.id,
          subtotal: order.subtotal,
          tax: order.tax,
          shipping: order.shipping,
          discount: order.discount,
          total: order.total,
          currency: order.currency || 'CAD',
          customerName: order.billingName || order.shippingName || '',
          customerPhone: order.shippingPhone || null,
          customerAddress: order.shippingAddress || null,
          customerCity: order.shippingCity || null,
          customerPostalCode: order.shippingPostalCode || null,
          billingName: order.billingName || null,
          billingAddress: order.billingAddress || null,
          billingTaxNumber: order.billingTaxNumber || null,
        }),
      })
    } catch (error) {
      console.error('Save invoice error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-4">
          {/* Print Button */}
          <div className="mb-6 flex justify-end">
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {t.admin.modals.orderDetail.print.print}
            </button>
          </div>

          {/* Invoice Content */}
          <div className="invoice-content">
            {/* Header */}
            <div className="flex justify-between items-start border-b-3 border-black pb-5 mb-8">
              <div className="flex-1">
                {receiptLogo && (
                  <img
                    src={receiptLogo}
                    alt="Logo"
                    className="max-w-[150px] max-h-[60px] mb-3"
                  />
                )}
                {receiptSettings.companyName && (
                  <div className="text-2xl font-bold mb-2">{receiptSettings.companyName}</div>
                )}
                <div className="text-xs leading-relaxed text-gray-700">
                  {receiptSettings.companyAddress && <div>{receiptSettings.companyAddress}</div>}
                  {receiptSettings.companyPhone && <div>Tel: {receiptSettings.companyPhone}</div>}
                  {receiptSettings.companyEmail && <div>Email: {receiptSettings.companyEmail}</div>}
                  {receiptSettings.tpsEnabled && receiptSettings.tpsNumber && (
                    <div>TPS: {receiptSettings.tpsNumber}</div>
                  )}
                  {receiptSettings.tvqEnabled && receiptSettings.tvqNumber && (
                    <div>TVQ: {receiptSettings.tvqNumber}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Customer and Invoice Info */}
            <div className="flex justify-between gap-8 mb-8">
              <div className="flex-1 bg-gray-50 p-4 border border-gray-300">
                <div className="text-sm font-bold mb-3 pb-2 border-b-2 border-black">
                  {t.admin.modals.orderDetail.print.customerInfo}
                </div>
                <div className="text-xs space-y-2">
                  <div>
                    <span className="font-bold">{t.admin.modals.orderDetail.print.customerName}:</span>{' '}
                    <span>{order.billingName || order.shippingName || '-'}</span>
                  </div>
                  {order.shippingPhone && (
                    <div>
                      <span className="font-bold">{t.admin.modals.orderDetail.print.customerPhone}:</span>{' '}
                      <span>{order.shippingPhone}</span>
                    </div>
                  )}
                  {order.shippingAddress && (
                    <div>
                      <span className="font-bold">{t.admin.modals.orderDetail.print.customerAddress}:</span>{' '}
                      <span>{order.shippingAddress}</span>
                    </div>
                  )}
                  {order.shippingCity && (
                    <div>
                      <span className="font-bold">{t.admin.modals.orderDetail.print.customerCity}:</span>{' '}
                      <span>{order.shippingCity}</span>
                    </div>
                  )}
                  {order.shippingPostalCode && (
                    <div>
                      <span className="font-bold">
                        {t.admin.modals.orderDetail.print.customerPostalCode}:
                      </span>{' '}
                      <span>{order.shippingPostalCode}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 bg-gray-50 p-4 border border-gray-300">
                <div className="text-sm font-bold mb-3 pb-2 border-b-2 border-black">
                  {t.admin.modals.orderDetail.print.billingInfo}
                </div>
                <div className="text-xs space-y-2">
                  <div>
                    <span className="font-bold">{t.admin.modals.orderDetail.print.invoiceNumber}:</span>{' '}
                    <span>{invoiceNumber || order.orderNumber}</span>
                  </div>
                  <div>
                    <span className="font-bold">{t.admin.modals.orderDetail.print.orderNumber}:</span>{' '}
                    <span>{cleanOrderNumber(order.orderNumber)}</span>
                  </div>
                  <div>
                    <span className="font-bold">{t.admin.modals.orderDetail.print.invoiceDate}:</span>{' '}
                    <span>
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border border-black mb-5">
              <thead className="bg-black text-white">
                <tr>
                  <th className="p-3 text-xs font-bold text-left w-[5%]">#</th>
                  <th className="p-3 text-xs font-bold text-left w-[35%]">
                    {t.admin.modals.orderDetail.print.product}
                  </th>
                  <th className="p-3 text-xs font-bold text-center w-[15%]">
                    {t.admin.modals.orderDetail.print.sku}
                  </th>
                  <th className="p-3 text-xs font-bold text-center w-[10%]">
                    {t.admin.modals.orderDetail.print.quantity}
                  </th>
                  <th className="p-3 text-xs font-bold text-right w-[15%]">
                    {t.admin.modals.orderDetail.print.unit}
                  </th>
                  <th className="p-3 text-xs font-bold text-right w-[20%]">
                    {t.admin.modals.orderDetail.print.total}
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item: any, index: number) => (
                  <tr key={item.id} className="border-b border-gray-300 hover:bg-gray-50">
                    <td className="p-3 text-xs text-center">{index + 1}</td>
                    <td className="p-3 text-xs">
                      {item.product?.name || t.admin.modals.orderDetail.print.productNameNotFound}
                    </td>
                    <td className="p-3 text-xs text-center">{item.sku || '-'}</td>
                    <td className="p-3 text-xs text-center">{item.quantity}</td>
                    <td className="p-3 text-xs text-right">{formatPrice(item.price)}</td>
                    <td className="p-3 text-xs text-right">{formatPrice(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="ml-auto w-[300px] mt-5">
              <div className="flex justify-between py-2 text-sm border-b border-gray-300">
                <span className="font-bold">{t.admin.modals.orderDetail.print.subtotal}</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between py-2 text-sm border-b border-gray-300">
                  <span className="font-bold">{t.admin.modals.orderDetail.print.discount}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <>
                  <div className="flex justify-between py-2 text-sm border-b border-gray-300">
                    <span className="font-bold">
                      {t.admin.modals.orderDetail.print.gst.replace(
                        '{rate}',
                        taxRates.federalTaxRate.toString()
                      )}
                    </span>
                    <span>
                      {formatPrice(
                        order.tax *
                          (taxRates.federalTaxRate /
                            (taxRates.federalTaxRate + taxRates.provincialTaxRate))
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 text-sm border-b border-gray-300">
                    <span className="font-bold">
                      {t.admin.modals.orderDetail.print.pstHst.replace(
                        '{rate}',
                        taxRates.provincialTaxRate.toString()
                      )}
                    </span>
                    <span>
                      {formatPrice(
                        order.tax *
                          (taxRates.provincialTaxRate /
                            (taxRates.federalTaxRate + taxRates.provincialTaxRate))
                      )}
                    </span>
                  </div>
                </>
              )}
              {order.shipping > 0 && (
                <div className="flex justify-between py-2 text-sm border-b border-gray-300">
                  <span className="font-bold">{t.admin.modals.orderDetail.print.shipping}</span>
                  <span>{formatPrice(order.shipping)}</span>
                </div>
              )}
              <div className="flex justify-between py-3 text-base font-bold border-t-2 border-b-2 border-black mt-1">
                <span>{t.admin.modals.orderDetail.print.totalLabel}</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-10 pt-5 border-t-2 border-black flex justify-between" style={{ pageBreakInside: 'avoid' }}>
              <div className="w-[250px] text-center">
                <div className="text-sm font-semibold mb-2">
                  {order.billingName || order.shippingName || ''}
                </div>
                <div className="border-t border-black mt-16 pt-2 text-xs">
                  {t.admin.modals.orderDetail.print.signature}
                </div>
                {/* Thank You */}
                <div className="text-center mt-6 text-sm font-bold">
                  {t.admin.modals.orderDetail.print.thankYou}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .invoice-content {
            background: white;
            page-break-after: avoid;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  )
}

