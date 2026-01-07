import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getOrderRepository, getOrderItemRepository, getProductRepository, getDealerRepository } from '@/lib/db'
import { checkAdmin } from '@/lib/auth-helpers'
import { OrderStatus } from '@/entities/enums/OrderStatus'

export async function POST(req: NextRequest) {
  const auth = await checkAdmin(req)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const {
      dealerId,
      orderNumber,
      items,
      subtotal,
      discount,
      tax,
      total,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingPostalCode,
      billingName,
      billingAddress,
      billingTaxNumber,
      notes,
    } = body

    if (!dealerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Dealer ID and items are required' },
        { status: 400 }
      )
    }

    // Dealer kontrolü
    const dealerRepo = await getDealerRepository()
    const dealer = await dealerRepo.findOne({ where: { id: dealerId } })
    
    if (!dealer) {
      return NextResponse.json(
        { error: 'Dealer not found' },
        { status: 404 }
      )
    }

    const orderRepo = await getOrderRepository()
    const orderItemRepo = await getOrderItemRepository()
    const productRepo = await getProductRepository()
    const connection = orderRepo.manager.connection

    // Sipariş numarası oluştur
    const finalOrderNumber = orderNumber || `ADMIN-SALE-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Raw SQL ile sipariş oluştur (TypeORM metadata sorununu bypass et)
    const orderIdResult = await connection.query(
      `INSERT INTO orders (
        id, "orderNumber", "dealerId", "userId", status, subtotal, tax, shipping, discount, total, currency,
        "shippingName", "shippingPhone", "shippingAddress", "shippingCity", "shippingPostalCode",
        "billingName", "billingAddress", "billingTaxNumber", notes, "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(), $1, $2, NULL, $3, $4, $5, $6, $7, $8, $9,
        $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW(), NOW()
      ) RETURNING id`,
      [
        finalOrderNumber,
        dealerId,
        OrderStatus.CONFIRMED,
        parseFloat(subtotal) || 0,
        parseFloat(tax) || 0, // tax from request body
        0, // shipping
        parseFloat(discount) || 0,
        parseFloat(total) || 0,
        'CAD',
        shippingName || dealer.companyName,
        shippingPhone || dealer.phone || '',
        shippingAddress || dealer.address || '',
        shippingCity || '',
        shippingPostalCode || null,
        billingName || dealer.companyName,
        billingAddress || dealer.address || '',
        billingTaxNumber || dealer.taxNumber || null,
        notes || null,
      ]
    )

    const savedOrderId = orderIdResult[0]?.id
    if (!savedOrderId) {
      throw new Error('Order could not be created')
    }

    // Order items oluştur
    for (const item of items) {
      const product = await productRepo.findOne({ where: { id: item.productId } })
      
      if (!product) {
        console.warn(`Product not found: ${item.productId}`)
        continue
      }

      // Quantity'yi float olarak garanti et
      let quantityValue: number
      if (typeof item.quantity === 'string') {
        quantityValue = parseFloat(item.quantity) || 0
      } else if (typeof item.quantity === 'number') {
        quantityValue = item.quantity
      } else {
        quantityValue = 0
      }

      // Değerleri parse et
      const priceValue = parseFloat(item.price) || 0
      const totalValue = parseFloat(item.total) || 0

      console.log('Creating order item:', {
        productId: item.productId,
        quantity: quantityValue,
        quantityType: typeof quantityValue,
        price: priceValue,
        total: totalValue,
      })

      // Raw SQL ile ekle (TypeORM metadata sorununu bypass et)
      const skuValue = item.sku || product.sku || ''
      
      // Quantity'yi double precision olarak garanti et
      const quantityAsFloat = parseFloat(quantityValue.toString())
      
      console.log('Inserting order item with raw SQL:', {
        orderId: savedOrderId,
        productId: item.productId,
        quantity: quantityAsFloat,
        quantityType: typeof quantityAsFloat,
      })
      
      // SQL injection'dan korunmak için değerleri validate et
      if (isNaN(quantityAsFloat) || quantityAsFloat < 0) {
        throw new Error(`Invalid quantity value: ${quantityValue}`)
      }
      if (isNaN(priceValue) || priceValue < 0) {
        throw new Error(`Invalid price value: ${item.price}`)
      }
      if (isNaN(totalValue) || totalValue < 0) {
        throw new Error(`Invalid total value: ${item.total}`)
      }
      
      // Parametreleri doğrudan SQL string'ine güvenli şekilde ekle
      // parseFloat ile kontrol edildiği için güvenli (sadece sayısal değerler)
      const quantitySql = quantityAsFloat.toString()
      const priceSql = priceValue.toString()
      const totalSql = totalValue.toString()
      
      await connection.query(
        `INSERT INTO order_items (id, "orderId", "productId", quantity, price, discount, total, sku, "createdAt")
         VALUES (
           gen_random_uuid(), 
           $1::uuid, 
           $2::uuid, 
           ${quantitySql}::double precision, 
           ${priceSql}::double precision, 
           0::double precision, 
           ${totalSql}::double precision, 
           $3, 
           NOW()
         )`,
        [
          savedOrderId,
          item.productId,
          skuValue || null,
        ]
      )

      console.log('Order item inserted via raw SQL')

      // Stok güncelle (eğer trackStock true ise)
      // quantity adet cinsinden
      if (product.trackStock) {
        const quantity = parseFloat(item.quantity) || 0
        const currentStock = parseFloat(product.stock?.toString() || '0')
        product.stock = currentStock - quantity
        if (product.stock < 0) product.stock = 0
        await productRepo.save(product)
      }
    }

    // Order'ı items ile birlikte getir (raw SQL ile)
    const orderWithItems = await connection.query(
      `SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'productId', oi."productId",
            'quantity', oi.quantity,
            'price', oi.price,
            'total', oi.total,
            'sku', oi.sku,
            'product', json_build_object(
              'id', p.id,
              'name', p.name,
              'slug', p.slug,
              'images', p.images
            )
          )
        ) FILTER (WHERE oi.id IS NOT NULL) as items
      FROM orders o
      LEFT JOIN order_items oi ON oi."orderId" = o.id
      LEFT JOIN products p ON p.id = oi."productId"
      WHERE o.id = $1
      GROUP BY o.id`,
      [savedOrderId]
    )

    const order = orderWithItems[0] || null

    return NextResponse.json({ order }, { status: 201 })
  } catch (error: any) {
    console.error('Create admin dealer order error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

