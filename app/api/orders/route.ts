import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { extractAuthToken, verifyToken } from '@/lib/auth'
import { getOrderRepository, getOrderItemRepository, getProductRepository, getUserRepository } from '@/lib/db'
import { getConnection } from '@/lib/database'
import { OrderStatus } from '@/entities/enums/OrderStatus'
import { Settings } from '@/entities/Settings'
import { Repository } from 'typeorm'

// Entity'yi zorla yükle - metadata için
void Settings

export async function GET(request: NextRequest) {
  try {
    const token = extractAuthToken(request)
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') as OrderStatus | null
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    const orderRepo = await getOrderRepository()

    const queryBuilder = orderRepo
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('order.userId = :userId', { userId: payload.userId })
      .orderBy('order.createdAt', 'DESC')
      .skip(skip)
      .take(limit)

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status })
    }

    const [orders, total] = await queryBuilder.getManyAndCount()

    return NextResponse.json({
      orders: orders.map((order: any) => ({
        ...order,
        items: (order.items || []).map((item: any) => ({
          ...item,
          product: item.product ? {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            images: item.product.images || [],
          } : null,
        })),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Giriş gerektirmeden sipariş alınabilir - kullanıcı olmadan sipariş
    const body = await request.json()
    const {
      items,
      shippingName,
      shippingPhone,
      shippingEmail,
      shippingAddress,
      shippingProvince,
      shippingCity,
      shippingPostalCode,
      billingName,
      billingAddress,
      billingTaxNumber,
      notes,
      dealerId,
    } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      )
    }

    if (!shippingName || !shippingPhone || !shippingEmail || !shippingAddress || !shippingCity) {
      return NextResponse.json(
        { error: 'Shipping information is required' },
        { status: 400 }
      )
    }

    const productRepo = await getProductRepository()
    const orderRepo = await getOrderRepository()
    const orderItemRepo = await getOrderItemRepository()

    // Ürünleri kontrol et ve fiyatları hesapla
    let subtotal = 0
    const orderItemsData: any[] = []

    for (const item of items) {
      const product = await productRepo.findOne({
        where: { id: item.productId },
      })

      if (!product || !product.isActive) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found or inactive` },
          { status: 400 }
        )
      }

      if (product.trackStock && (product.stock || 0) < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product.name}` },
          { status: 400 }
        )
      }

      const price = product.price
      const itemTotal = price * item.quantity
      subtotal += itemTotal

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        price,
        total: itemTotal,
        sku: product.sku,
      })
    }

    // Settings'ten vergi oranlarını al
    const connection = await getConnection()
    
    // Settings repository'yi al - önce string name ile dene (daha güvenilir)
    let settingsRepo: Repository<Settings>
    try {
      settingsRepo = connection.getRepository('Settings') as Repository<Settings>
    } catch (error: any) {
      // String name ile başarısız olursa, entity class ile dene
      console.warn('Settings string name failed, trying entity class:', error?.message)
      try {
        settingsRepo = connection.getRepository(Settings) as Repository<Settings>
      } catch (error2: any) {
        // Her ikisi de başarısız olursa, varsayılan değerleri kullan
        console.error('Settings repository failed with both methods. Using defaults. Error:', error2?.message)
        const federalTaxRate = 5
        const provincialTaxRate = 8
        
        // Kargo ücreti hesapla (Kanada: 100 CAD üzeri ücretsiz)
        const shipping = subtotal > 100 ? 0 : 15
        const federalTax = (subtotal * federalTaxRate) / 100
        const provincialTax = (subtotal * provincialTaxRate) / 100
        const tax = federalTax + provincialTax
        const total = subtotal + tax + shipping
        
        // Sipariş numarası oluştur
        const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        
        // Guest order - userId olmadan sipariş oluştur
        const orderData: any = {
          orderNumber,
          dealerId: dealerId || null,
          status: OrderStatus.PENDING,
          subtotal,
          tax,
          shipping,
          discount: 0,
          total,
          currency: 'CAD',
          shippingName,
          shippingPhone,
          shippingEmail: shippingEmail || null,
          shippingAddress,
          shippingProvince: shippingProvince || null,
          shippingCity,
          shippingPostalCode: shippingPostalCode || null,
          billingName: billingName || shippingName,
          billingAddress: billingAddress || shippingAddress,
          billingTaxNumber: billingTaxNumber || null,
          notes: notes || null,
        }
        
        orderData.userId = null
        
        const order = orderRepo.create(orderData)
        const savedOrder = await orderRepo.save(order)
        
        // Order items oluştur
        for (const itemData of orderItemsData) {
          const orderItem = orderItemRepo.create({
            orderId: (savedOrder as any).id,
            productId: itemData.productId,
            quantity: itemData.quantity,
            price: itemData.price,
            total: itemData.total,
            sku: itemData.sku,
          })
          await orderItemRepo.save(orderItem)
        }
        
        // Order'ı items ile birlikte getir
        const orderWithItems = await orderRepo.findOne({
          where: { id: (savedOrder as any).id },
          relations: ['items', 'items.product'],
        })
        
        return NextResponse.json(
          {
            order: {
              ...orderWithItems,
              items: (orderWithItems?.items || []).map((item: any) => ({
                ...item,
                product: item.product ? {
                  id: item.product.id,
                  name: item.product.name,
                  slug: item.product.slug,
                  images: item.product.images || [],
                } : null,
              })),
            },
          },
          { status: 201 }
        )
      }
    }
    
    const allSettings = await settingsRepo.find()
    const settingsMap: { [key: string]: string } = {}
    for (const setting of allSettings) {
      settingsMap[setting.key] = setting.value
    }
    
    const federalTaxRate = parseFloat(settingsMap['federalTaxRate'] || '5')
    const provincialTaxRate = parseFloat(settingsMap['provincialTaxRate'] || '8')
    
    // Kargo ücreti hesapla (Kanada: 100 CAD üzeri ücretsiz)
    const shipping = subtotal > 100 ? 0 : 15
    const federalTax = (subtotal * federalTaxRate) / 100
    const provincialTax = (subtotal * provincialTaxRate) / 100
    const tax = federalTax + provincialTax
    const total = subtotal + tax + shipping

    // Sipariş numarası oluştur
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Guest order - userId olmadan sipariş oluştur
    // TypeORM'de nullable field'lar için undefined yerine null kullanmak daha güvenli
    const orderData: any = {
      orderNumber,
      dealerId: dealerId || null,
      status: OrderStatus.PENDING,
      subtotal,
      tax,
      shipping,
      discount: 0,
      total,
      currency: 'CAD',
      shippingName,
      shippingPhone,
      shippingEmail: shippingEmail || null,
      shippingAddress,
      shippingProvince: shippingProvince || null,
      shippingCity,
      shippingPostalCode: shippingPostalCode || null,
      billingName: billingName || shippingName,
      billingAddress: billingAddress || shippingAddress,
      billingTaxNumber: billingTaxNumber || null,
      notes: notes || null,
    }
    
    // userId'yi null olarak ekle (guest order için)
    // Eğer entity'de nullable: true ise TypeORM null değerini kabul eder
    orderData.userId = null

    const order = orderRepo.create(orderData)
    const savedOrder = await orderRepo.save(order)

    // Order items oluştur
    for (const itemData of orderItemsData) {
      const orderItem = orderItemRepo.create({
        orderId: (savedOrder as any).id,
        productId: itemData.productId,
        quantity: itemData.quantity,
        price: itemData.price,
        total: itemData.total,
        sku: itemData.sku,
      })
      await orderItemRepo.save(orderItem)
    }

    // Stok güncelleme yapma - Admin onayladığında stoktan düşecek

    // Admin'e bildirim için console log (ileride email/SMS entegrasyonu yapılabilir)
    console.log('\n🚨 YENİ SİPARİŞ ALINDI! 🚨')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Sipariş No: ${orderNumber}`)
    console.log(`Müşteri: ${shippingName}`)
    console.log(`Telefon: ${shippingPhone}`)
    console.log(`E-posta: ${shippingEmail || 'Belirtilmemiş'}`)
    console.log(`Adres: ${shippingAddress}, ${shippingCity}`)
    console.log(`Toplam Tutar: ${total.toFixed(2)} TL`)
    console.log(`Ürün Sayısı: ${items.length}`)
    console.log(`Durum: ${OrderStatus.PENDING}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Order'ı items ile birlikte getir
    const orderWithItems = await orderRepo.findOne({
      where: { id: (savedOrder as any).id },
      relations: ['items', 'items.product'],
    })

    return NextResponse.json(
      {
        order: {
          ...orderWithItems,
          items: (orderWithItems?.items || []).map((item: any) => ({
            ...item,
            product: item.product ? {
              id: item.product.id,
              name: item.product.name,
              slug: item.product.slug,
              images: item.product.images || [],
            } : null,
          })),
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
