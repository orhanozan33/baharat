import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { getInvoiceRepository, getOrderRepository } from '@/lib/db'
import { Invoice } from '@/entities/Invoice'

// Entity'yi zorla yükle - metadata için
void Invoice

// GET - Faturaları listele (arama ve filtreleme ile)
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const skip = (page - 1) * limit
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const invoiceRepo = await getInvoiceRepository()
    const orderRepo = await getOrderRepository()

    // Arama sorgusu
    let query = invoiceRepo.createQueryBuilder('invoice')
      .leftJoinAndSelect('invoice.order', 'order')
      .orderBy('invoice.createdAt', 'DESC')

    // Tarih aralığı filtresi
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      query = query.andWhere('invoice.createdAt >= :startDate', { startDate: start })
    }

    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      query = query.andWhere('invoice.createdAt <= :endDate', { endDate: end })
    }

    if (search) {
      const searchCondition = '(invoice.invoiceNumber ILIKE :search OR invoice.customerName ILIKE :search OR invoice.billingName ILIKE :search OR order.orderNumber ILIKE :search)'
      if (startDate || endDate) {
        query = query.andWhere(searchCondition, { search: `%${search}%` })
      } else {
        query = query.where(searchCondition, { search: `%${search}%` })
      }
    }

    // Toplam sayı
    const total = await query.getCount()

    // İstatistikler (filtrelenmiş veriler için) - aynı query'yi kullan
    const statsQuery = invoiceRepo.createQueryBuilder('invoice')
      .leftJoin('invoice.order', 'order')

    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0)
      statsQuery.andWhere('invoice.createdAt >= :startDate', { startDate: start })
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      statsQuery.andWhere('invoice.createdAt <= :endDate', { endDate: end })
    }
    if (search) {
      const searchCondition = '(invoice.invoiceNumber ILIKE :search OR invoice.customerName ILIKE :search OR invoice.billingName ILIKE :search OR order.orderNumber ILIKE :search)'
      if (startDate || endDate) {
        statsQuery.andWhere(searchCondition, { search: `%${search}%` })
      } else {
        statsQuery.where(searchCondition, { search: `%${search}%` })
      }
    }

    const filteredInvoices = await statsQuery.getMany()
    const stats = {
      totalCount: filteredInvoices.length,
      totalSubtotal: filteredInvoices.reduce((sum, inv) => sum + (inv.subtotal || 0), 0),
      totalTax: filteredInvoices.reduce((sum, inv) => sum + (inv.tax || 0), 0),
      totalShipping: filteredInvoices.reduce((sum, inv) => sum + (inv.shipping || 0), 0),
      totalDiscount: filteredInvoices.reduce((sum, inv) => sum + (inv.discount || 0), 0),
      totalAmount: filteredInvoices.reduce((sum, inv) => sum + (inv.total || 0), 0),
    }

    // Sayfalama
    const invoices = await query
      .skip(skip)
      .take(limit)
      .getMany()

    return NextResponse.json({
      invoices,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get invoices error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Yeni fatura oluştur
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      invoiceNumber,
      orderId,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      currency = 'CAD',
      customerName,
      customerPhone,
      customerAddress,
      customerCity,
      customerPostalCode,
      billingName,
      billingAddress,
      billingTaxNumber,
    } = body

    if (!invoiceNumber || !orderId || !total || !customerName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const invoiceRepo = await getInvoiceRepository()
    const orderRepo = await getOrderRepository()

    // Order'ın var olduğunu kontrol et
    const order = await orderRepo.findOne({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Aynı fatura numarasıyla fatura var mı kontrol et
    const existingInvoice = await invoiceRepo.findOne({
      where: { invoiceNumber },
    })
    if (existingInvoice) {
      return NextResponse.json(
        { error: 'Invoice number already exists' },
        { status: 400 }
      )
    }

    // Fatura oluştur
    const invoice = invoiceRepo.create({
      invoiceNumber,
      orderId,
      subtotal: parseFloat(subtotal) || 0,
      tax: parseFloat(tax) || 0,
      shipping: parseFloat(shipping) || 0,
      discount: parseFloat(discount) || 0,
      total: parseFloat(total),
      currency,
      customerName,
      customerPhone: customerPhone || null,
      customerAddress: customerAddress || null,
      customerCity: customerCity || null,
      customerPostalCode: customerPostalCode || null,
      billingName: billingName || null,
      billingAddress: billingAddress || null,
      billingTaxNumber: billingTaxNumber || null,
    })

    const savedInvoice = await invoiceRepo.save(invoice)

    return NextResponse.json({ invoice: savedInvoice }, { status: 201 })
  } catch (error: any) {
    console.error('Create invoice error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

