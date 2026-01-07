'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { showToast } from '@/components/Toast'
import { getTranslations } from '@/lib/i18n'
import { useAdminLocale } from '@/contexts/AdminLocaleContext'

interface OrderDetailModalProps {
  order: any
  isOpen: boolean
  onClose: () => void
  isPaid?: boolean
  dealerId?: string
  onPaymentAdded?: () => void
  paidAmount?: number
}

export default function OrderDetailModal({ 
  order, 
  isOpen, 
  onClose, 
  isPaid = false, 
  dealerId,
  onPaymentAdded,
  paidAmount = 0
}: OrderDetailModalProps) {
  const { locale } = useAdminLocale()
  const t = getTranslations(locale)
  const [loading, setLoading] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showPrintModal, setShowPrintModal] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [paymentType, setPaymentType] = useState<string>('CASH')
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

  const statusLabels: Record<string, string> = {
    PENDING: t.orders.status.PENDING,
    CONFIRMED: t.orders.status.CONFIRMED,
    PROCESSING: t.orders.status.PROCESSING,
    SHIPPED: t.orders.status.SHIPPED,
    DELIVERED: t.orders.status.DELIVERED,
    CANCELLED: t.orders.status.CANCELLED,
  }

  useEffect(() => {
    if (isOpen) {
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
    }
  }, [isOpen])

  if (!isOpen || !order) return null

  const handleTakePaymentClick = () => {
    if (!dealerId) {
      showToast(t.admin.modals.orderDetail.payment.dealerNotFound, 'error')
      return
    }
    const remainingBalance = Math.max(0, order.total - paidAmount)
    setPaymentAmount(remainingBalance > 0 ? remainingBalance.toString() : order.total.toString())
    setShowConfirmModal(true)
  }

  const handleConfirmPayment = async () => {
    if (!dealerId) {
      showToast(t.admin.modals.orderDetail.payment.dealerNotFound, 'error')
      return
    }

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      showToast(t.admin.modals.orderDetail.payment.invalidAmount, 'error')
      return
    }

    const remainingBalance = Math.max(0, order.total - paidAmount)
    if (amount > remainingBalance) {
      showToast(t.admin.modals.orderDetail.payment.amountExceeds.replace('{balance}', formatPrice(remainingBalance)), 'error')
      return
    }

    setLoading(true)
    setShowConfirmModal(false)
    try {
      const response = await fetch(`/api/admin/dealers/${dealerId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount,
          type: paymentType,
          paymentDate: new Date().toISOString().split('T')[0],
          description: `${t.admin.modals.orderDetail.print.receiptTitle}: ${order.orderNumber}`,
        }),
      })

      if (response.ok) {
        showToast(t.admin.modals.orderDetail.payment.paymentReceived, 'success')
        if (onPaymentAdded) {
          onPaymentAdded()
        }
        onClose()
      } else {
        const error = await response.json()
        showToast(error.error || t.admin.modals.orderDetail.payment.paymentError, 'error')
      }
    } catch (error) {
      console.error('Take payment error:', error)
      showToast(t.admin.modals.orderDetail.payment.paymentError, 'error')
    } finally {
      setLoading(false)
    }
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
    // Get next invoice number before showing print modal
    try {
      const response = await fetch('/api/admin/invoices/next-number')
      if (response.ok) {
        const data = await response.json()
        if (data.invoiceNumber) {
          setInvoiceNumber(data.invoiceNumber)
        }
      }
    } catch (error) {
      console.error('Get invoice number error:', error)
    }
    setShowPrintModal(true)
  }

  const handlePrintConfirm = async () => {
    // Get invoice number if not exists
    let currentInvoiceNumber = invoiceNumber
    if (!currentInvoiceNumber) {
      try {
        const response = await fetch('/api/admin/invoices/next-number')
        if (response.ok) {
          const data = await response.json()
          if (data.invoiceNumber) {
            currentInvoiceNumber = data.invoiceNumber
            setInvoiceNumber(currentInvoiceNumber)
          }
        }
      } catch (error) {
        console.error('Get invoice number error:', error)
      }
    }

    // Save invoice
    if (currentInvoiceNumber) {
      try {
        await fetch('/api/admin/invoices', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            invoiceNumber: currentInvoiceNumber,
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

    // Clean order number
    const cleanedOrderNumber = cleanOrderNumber(order.orderNumber)
    
    // Fatura her zaman Fransızca gösterilir
    const tFr = getTranslations('fr')
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${tFr.admin.modals.orderDetail.print.receiptTitle} - ${order.orderNumber}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 15mm;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none;
              }
              .invoice-container {
                page-break-after: avoid;
              }
            }
            * {
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Arial', 'Helvetica', sans-serif;
              font-size: 12px;
              color: #000;
              background: #fff;
            }
            .invoice-container {
              max-width: 210mm;
              margin: 0 auto;
              background: #fff;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 3px solid #000;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .company-info {
              flex: 1;
            }
            .header-logo {
              max-width: 150px;
              max-height: 60px;
              margin-bottom: 10px;
            }
            .company-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 8px;
              color: #000;
            }
            .company-details {
              font-size: 11px;
              line-height: 1.6;
              color: #333;
            }
            .invoice-title {
              text-align: right;
              flex: 1;
            }
            .invoice-title h1 {
              font-size: 32px;
              font-weight: bold;
              margin: 0 0 10px 0;
              color: #000;
              letter-spacing: 2px;
            }
            .invoice-meta {
              font-size: 11px;
              text-align: right;
              line-height: 1.8;
            }
            .invoice-meta strong {
              font-weight: bold;
            }
            .content-section {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
              gap: 30px;
            }
            .customer-section, .billing-section {
              flex: 1;
              background: #f9f9f9;
              padding: 15px;
              border: 1px solid #ddd;
            }
            .section-title {
              font-size: 13px;
              font-weight: bold;
              margin-bottom: 12px;
              color: #000;
              border-bottom: 2px solid #000;
              padding-bottom: 5px;
            }
            .info-row {
              margin-bottom: 8px;
              font-size: 11px;
              line-height: 1.5;
            }
            .info-label {
              font-weight: bold;
              display: inline-block;
              min-width: 80px;
              color: #333;
            }
            .info-value {
              color: #000;
            }
            .items-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              border: 1px solid #000;
            }
            .items-table thead {
              background: #000;
              color: #fff;
            }
            .items-table th {
              padding: 12px 8px;
              text-align: left;
              font-size: 11px;
              font-weight: bold;
              border-right: 1px solid #fff;
            }
            .items-table th:last-child {
              border-right: none;
            }
            .items-table th.text-right {
              text-align: right;
            }
            .items-table th.text-center {
              text-align: center;
            }
            .items-table td {
              padding: 10px 8px;
              font-size: 11px;
              border-bottom: 1px solid #ddd;
              border-right: 1px solid #ddd;
              vertical-align: top;
            }
            .items-table td:last-child {
              border-right: none;
            }
            .items-table tbody tr:last-child td {
              border-bottom: none;
            }
            .items-table tbody tr:hover {
              background: #f5f5f5;
            }
            .items-table .text-right {
              text-align: right;
            }
            .items-table .text-center {
              text-align: center;
            }
            .total-section {
              margin-top: 20px;
              margin-left: auto;
              width: 300px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 12px;
              border-bottom: 1px solid #ddd;
            }
            .total-row.total-final {
              border-top: 2px solid #000;
              border-bottom: 2px solid #000;
              font-weight: bold;
              font-size: 16px;
              padding: 12px 0;
              margin-top: 5px;
            }
            .total-label {
              font-weight: bold;
            }
            .notes-section {
              margin-top: 30px;
              padding: 15px;
              background: #f9f9f9;
              border: 1px solid #ddd;
            }
            .notes-title {
              font-size: 13px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #000;
            }
            .notes-content {
              font-size: 11px;
              line-height: 1.6;
              color: #333;
            }
            .footer-section {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #000;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              width: 250px;
              text-align: center;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 60px;
              padding-top: 5px;
              font-size: 11px;
            }
            .thank-you {
              text-align: center;
              margin-top: 30px;
              font-size: 14px;
              font-weight: bold;
              color: #000;
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <!-- Header -->
            <div class="header">
              <div class="company-info">
                ${receiptLogo ? `<img src="${receiptLogo}" alt="Logo" class="header-logo" />` : ''}
                ${receiptSettings.companyName ? `<div class="company-name">${receiptSettings.companyName}</div>` : ''}
                <div class="company-details">
                  ${receiptSettings.companyAddress ? `<div>${receiptSettings.companyAddress}</div>` : ''}
                  ${receiptSettings.companyPhone ? `<div>Tel: ${receiptSettings.companyPhone}</div>` : ''}
                  ${receiptSettings.companyEmail ? `<div>Email: ${receiptSettings.companyEmail}</div>` : ''}
                  ${receiptSettings.tpsEnabled && receiptSettings.tpsNumber ? `<div>TPS: ${receiptSettings.tpsNumber}</div>` : ''}
                  ${receiptSettings.tvqEnabled && receiptSettings.tvqNumber ? `<div>TVQ: ${receiptSettings.tvqNumber}</div>` : ''}
                </div>
              </div>
            </div>

            <!-- Customer and Invoice Info -->
            <div class="content-section">
              <div class="customer-section">
                <div class="section-title">${tFr.admin.modals.orderDetail.print.customerInfo}</div>
                <div class="info-row">
                  <span class="info-label">${tFr.admin.modals.orderDetail.print.customerName}:</span>
                  <span class="info-value">${order.billingName || order.shippingName || '-'}</span>
                </div>
                ${order.shippingPhone ? `
                  <div class="info-row">
                    <span class="info-label">${tFr.admin.modals.orderDetail.print.customerPhone}:</span>
                    <span class="info-value">${order.shippingPhone}</span>
                  </div>
                ` : ''}
                ${order.shippingAddress ? `
                  <div class="info-row">
                    <span class="info-label">${tFr.admin.modals.orderDetail.print.customerAddress}:</span>
                    <span class="info-value">${order.shippingAddress}</span>
                  </div>
                ` : ''}
                ${order.shippingCity ? `
                  <div class="info-row">
                    <span class="info-label">${tFr.admin.modals.orderDetail.print.customerCity}:</span>
                    <span class="info-value">${order.shippingCity}</span>
                  </div>
                ` : ''}
                ${order.shippingPostalCode ? `
                  <div class="info-row">
                    <span class="info-label">${tFr.admin.modals.orderDetail.print.customerPostalCode}:</span>
                    <span class="info-value">${order.shippingPostalCode}</span>
                  </div>
                ` : ''}
              </div>
              <div class="billing-section">
                <div class="section-title">${tFr.admin.modals.orderDetail.print.billingInfo}</div>
                <div class="info-row">
                  <span class="info-label">${tFr.admin.modals.orderDetail.print.invoiceNumber}:</span>
                  <span class="info-value">${currentInvoiceNumber || order.orderNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">${tFr.admin.modals.orderDetail.print.orderNumber}:</span>
                  <span class="info-value">${cleanedOrderNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">${tFr.admin.modals.orderDetail.print.invoiceDate}:</span>
                  <span class="info-value">${new Date(order.createdAt).toLocaleDateString('fr-FR', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric'
                  })}</span>
                </div>
              </div>
            </div>

            <!-- Items Table -->
            <table class="items-table">
              <thead>
                <tr>
                  <th style="width: 5%;">#</th>
                  <th style="width: 35%;">${tFr.admin.modals.orderDetail.print.product}</th>
                  <th style="width: 15%;" class="text-center">${tFr.admin.modals.orderDetail.print.sku}</th>
                  <th style="width: 10%;" class="text-center">${tFr.admin.modals.orderDetail.print.quantity}</th>
                  <th style="width: 15%;" class="text-right">${tFr.admin.modals.orderDetail.print.unit}</th>
                  <th style="width: 20%;" class="text-right">${tFr.admin.modals.orderDetail.print.total}</th>
                </tr>
              </thead>
              <tbody>
                ${order.items?.map((item: any, index: number) => `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td>${item.product?.name || t.admin.modals.orderDetail.print.productNameNotFound}</td>
                    <td class="text-center">${item.sku || '-'}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">${formatPrice(item.price)}</td>
                    <td class="text-right">${formatPrice(item.total)}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>

            <!-- Totals -->
            <div class="total-section">
              <div class="total-row">
                <span class="total-label">${tFr.admin.modals.orderDetail.print.subtotal}</span>
                <span>${formatPrice(order.subtotal)}</span>
              </div>
              ${order.discount > 0 ? `
                <div class="total-row">
                  <span class="total-label">${tFr.admin.modals.orderDetail.print.discount}</span>
                  <span>-${formatPrice(order.discount)}</span>
                </div>
              ` : ''}
              ${order.tax > 0 ? `
                <div class="total-row">
                  <span class="total-label">${tFr.admin.modals.orderDetail.print.gst.replace('{rate}', taxRates.federalTaxRate.toString())}</span>
                  <span>${formatPrice(order.tax * (taxRates.federalTaxRate / (taxRates.federalTaxRate + taxRates.provincialTaxRate)))}</span>
                </div>
                <div class="total-row">
                  <span class="total-label">${tFr.admin.modals.orderDetail.print.pstHst.replace('{rate}', taxRates.provincialTaxRate.toString())}</span>
                  <span>${formatPrice(order.tax * (taxRates.provincialTaxRate / (taxRates.federalTaxRate + taxRates.provincialTaxRate)))}</span>
                </div>
              ` : ''}
              ${order.shipping > 0 ? `
                <div class="total-row">
                  <span class="total-label">${tFr.admin.modals.orderDetail.print.shipping}</span>
                  <span>${formatPrice(order.shipping)}</span>
                </div>
              ` : ''}
              <div class="total-row total-final">
                <span class="total-label">${tFr.admin.modals.orderDetail.print.totalLabel}</span>
                <span>${formatPrice(order.total)}</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="footer-section" style="page-break-inside: avoid;">
              <div class="signature-box">
                <div style="font-size: 13px; font-weight: bold; margin-bottom: 8px;">
                  ${order.billingName || order.shippingName || ''}
                </div>
                <div class="signature-line">${tFr.admin.modals.orderDetail.print.signature}</div>
                <!-- Thank You -->
                <div style="text-align: center; margin-top: 24px; font-size: 14px; font-weight: bold; color: #000;">
                  ${tFr.admin.modals.orderDetail.print.thankYou}
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      setShowPrintModal(false)
      
      setTimeout(() => {
        printWindow.focus()
        printWindow.print()
        printWindow.onafterprint = () => {
          printWindow.close()
        }
      }, 250)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-none md:rounded-lg shadow-xl max-w-4xl w-full h-full md:h-auto md:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t.orders.orderDetail}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 active:text-gray-900 text-3xl sm:text-2xl font-bold touch-manipulation"
            style={{ minWidth: '44px', minHeight: '44px', lineHeight: '1' }}
            aria-label="Kapat"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Sipariş Bilgileri */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">{t.admin.modals.orderDetail.orderInfo}</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">{t.admin.modals.orderDetail.orderNumber}</span> {order.orderNumber}</p>
                <p><span className="font-medium">{t.admin.modals.orderDetail.status}</span> {statusLabels[order.status] || order.status}</p>
                <p><span className="font-medium">{t.admin.modals.orderDetail.date}</span> {new Date(order.createdAt).toLocaleDateString('tr-TR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">{t.admin.modals.orderDetail.summary}</h3>
              <div className="space-y-1 text-sm">
                <p><span className="font-medium">{t.admin.modals.orderDetail.subtotal}</span> {formatPrice(order.subtotal)}</p>
                {order.discount > 0 && (
                  <p><span className="font-medium">{t.admin.modals.orderDetail.discount}</span> -{formatPrice(order.discount)}</p>
                )}
                {order.tax > 0 && (
                  <>
                    <p><span className="font-medium">{t.admin.modals.orderDetail.gst}</span> {formatPrice(order.tax * (5 / 18))}</p>
                    <p><span className="font-medium">{t.admin.modals.orderDetail.pstHst}</span> {formatPrice(order.tax * (13 / 18))}</p>
                  </>
                )}
                {order.shipping > 0 && (
                  <p><span className="font-medium">{t.admin.modals.orderDetail.shipping}</span> {formatPrice(order.shipping)}</p>
                )}
                <p className="text-lg font-bold text-primary-600">
                  <span className="font-medium">{t.admin.modals.orderDetail.total}</span> {formatPrice(order.total)}
                </p>
                {dealerId && (
                  <>
                    <p className="mt-2 pt-2 border-t">
                      <span className="font-medium text-green-600">{t.admin.modals.orderDetail.paidAmount}</span> {formatPrice(paidAmount)}
                    </p>
                    <p>
                      <span className="font-medium text-red-600">{t.admin.modals.orderDetail.remainingBalance}</span> {formatPrice(Math.max(0, order.total - paidAmount))}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sipariş Kalemleri */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">{t.admin.modals.orderDetail.orderItems}</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">{t.admin.modals.orderDetail.product}</th>
                    <th className="text-left p-3 text-sm font-semibold text-gray-700">{t.admin.modals.orderDetail.sku}</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">{t.admin.modals.orderDetail.quantity}</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">{t.admin.modals.orderDetail.unitPrice}</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">{t.admin.modals.orderDetail.total}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item: any) => (
                    <tr key={item.id} className="border-b">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {item.product?.images?.[0] && (
                            <img
                              src={item.product.images[0]}
                              alt={item.product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <span className="font-medium text-sm">{item.product?.name || t.admin.modals.orderDetail.productNameNotFound}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-600">{item.sku || '-'}</td>
                      <td className="p-3 text-sm text-right">{item.quantity}</td>
                      <td className="p-3 text-sm text-right">{formatPrice(item.price)}</td>
                      <td className="p-3 text-sm text-right font-medium">{formatPrice(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notlar */}
          {order.notes && (
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">{t.admin.modals.orderDetail.notes}</h3>
              <div className="bg-gray-50 p-4 rounded-lg text-sm">
                {order.notes}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-4 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {!isPaid && dealerId && (
              <button
                onClick={handleTakePaymentClick}
                disabled={loading}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation text-sm sm:text-base font-medium"
                style={{ minHeight: '44px' }}
              >
                {loading ? t.admin.modals.orderDetail.processing : t.admin.modals.orderDetail.payment.takePayment}
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 active:bg-gray-800 transition flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base font-medium"
              style={{ minHeight: '44px' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden sm:inline">{t.admin.modals.orderDetail.print.print}</span>
              <span className="sm:hidden">Yazdır</span>
            </button>
            <a
              href={`/admin/orders/${order.id}/invoice`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:bg-blue-800 transition flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base font-medium"
              style={{ minHeight: '44px' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="hidden sm:inline">{t.admin.modals.orderDetail.print.invoiceLink || 'Fatura Linki'}</span>
              <span className="sm:hidden">Fatura</span>
            </a>
            <button
              onClick={() => {
                const invoiceUrl = `${window.location.origin}/admin/orders/${order.id}/invoice`
                navigator.clipboard.writeText(invoiceUrl)
                showToast(t.admin.modals.orderDetail.print.linkCopied || 'Link kopyalandı', 'success')
              }}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:bg-purple-800 transition flex items-center justify-center gap-2 touch-manipulation text-sm sm:text-base font-medium"
              title={t.admin.modals.orderDetail.print.copyLink || 'Linki Kopyala'}
              style={{ minHeight: '44px' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span className="hidden sm:inline">{t.admin.modals.orderDetail.print.copyLink || 'Linki Kopyala'}</span>
              <span className="sm:hidden">Kopyala</span>
            </button>
          </div>
          <div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              {t.admin.modals.orderDetail.close}
            </button>
          </div>
        </div>
      </div>

      {/* Print Modal */}
      {showPrintModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{t.admin.modals.orderDetail.printTitle}</h3>
              <p className="text-sm text-gray-600 mb-6">
                {t.admin.modals.orderDetail.printConfirm}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  {t.admin.modals.orderDetail.payment.cancel}
                </button>
                <button
                  onClick={handlePrintConfirm}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  {t.admin.modals.orderDetail.print.print}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-0 md:p-4">
          <div className="bg-white rounded-none md:rounded-lg shadow-xl max-w-md w-full h-full md:h-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{t.admin.modals.orderDetail.paymentConfirmation}</h3>
              <div className="mb-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.admin.modals.orderDetail.paymentAmount}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={Math.max(0, order.total - paidAmount)}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base touch-manipulation"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t.admin.modals.orderDetail.orderTotal}: {formatPrice(order.total)} | {t.admin.modals.orderDetail.paid}: {formatPrice(paidAmount)} | {t.admin.modals.orderDetail.balance}: {formatPrice(Math.max(0, order.total - paidAmount))}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.admin.modals.orderDetail.paymentType}
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base touch-manipulation"
                  >
                    <option value="CASH">{t.admin.modals.orderDetail.payment.cash}</option>
                    <option value="CHECK">{t.admin.modals.orderDetail.payment.check}</option>
                    <option value="CREDIT_CARD">{t.admin.modals.orderDetail.payment.creditCard}</option>
                    <option value="BANK_TRANSFER">{t.admin.modals.orderDetail.bankTransfer}</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation font-medium"
                  style={{ minHeight: '44px' }}
                >
                  {t.admin.modals.orderDetail.payment.cancel}
                </button>
                <button
                  onClick={handleConfirmPayment}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 active:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation font-medium"
                  style={{ minHeight: '44px' }}
                >
                  {loading ? t.admin.modals.orderDetail.processing : t.admin.modals.orderDetail.payment.confirm}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

