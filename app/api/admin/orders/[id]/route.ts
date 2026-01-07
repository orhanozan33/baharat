import 'reflect-metadata'
import { NextRequest, NextResponse } from 'next/server'
import { getOrderRepository, getProductRepository, getPaymentRepository, getDealerRepository, getUserRepository } from '@/lib/db'
import { extractAuthToken, verifyToken } from '@/lib/auth'
import { OrderStatus } from '@/entities/enums/OrderStatus'
import { serializeOrder } from '@/lib/serialize'
import { Payment, PaymentType } from '@/entities/Payment'
import { UserRole } from '@/entities/enums/UserRole'
import { randomUUID } from '@/lib/utils-uuid'
import bcrypt from 'bcryptjs'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = extractAuthToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const orderRepo = await getOrderRepository()
    
    const order = await orderRepo.findOne({
      where: { id },
      relations: ['user', 'dealer', 'items', 'items.product'],
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order: serializeOrder(order) })
  } catch (error: any) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = extractAuthToken(req)
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = verifyToken(token)
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    const { status, trackingNumber } = body

    console.log(`📥 PATCH /api/admin/orders/${id} - status=${status}, body=`, JSON.stringify(body))

    const orderRepo = await getOrderRepository()
    const productRepo = await getProductRepository()
    
    // Mevcut siparişi getir
    const order = await orderRepo.findOne({
      where: { id },
      relations: ['items', 'items.product', 'dealer'],
    })

    if (!order) {
      console.log(`❌ Order not found: ${id}`)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    console.log(`📦 Order found: ${order.orderNumber}, current status: ${order.status}, dealerId: ${order.dealerId}`)

    const oldStatus = order.status
    const newStatus = status as OrderStatus

    if (status) {
      order.status = newStatus

      // Status kontrolü: status string veya enum olarak gelebilir
      const isShipped = status === OrderStatus.SHIPPED || status === 'SHIPPED' || newStatus === OrderStatus.SHIPPED
      const isDelivered = status === OrderStatus.DELIVERED || status === 'DELIVERED' || newStatus === OrderStatus.DELIVERED
      
      if (isShipped) {
        order.shippedAt = new Date()
        if (trackingNumber) {
          order.trackingNumber = trackingNumber
        }
      }

      if (isDelivered) {
        // ORD- ile başlayan siparişler "Teslim Edildi" yapıldığında MUTLAKA "Order" dealer'ına atanmalı
        const isOrdOrder = order.orderNumber && order.orderNumber.startsWith('ORD-')
        
        // Stok düşürme kontrolü: Eğer sipariş daha önce DELIVERED durumuna geçirilmişse, stok zaten düşürülmüştür
        // deliveredAt'i kontrol etmeden önce mevcut değerini sakla
        const wasAlreadyDelivered = order.deliveredAt !== null && order.deliveredAt !== undefined
        
        console.log(`🔍 ORD- Check: orderNumber="${order.orderNumber}", status="${status}", newStatus="${newStatus}", isDelivered=${isDelivered}, isOrdOrder=${isOrdOrder}, wasAlreadyDelivered=${wasAlreadyDelivered}`)
        
        if (isOrdOrder) {
          console.log(`🔄 ORD- siparişi bulundu: ${order.orderNumber}, Order dealer'ına atanıyor...`)
          try {
            const dealerRepo = await getDealerRepository()
            
            // "Order" dealer'ını bul veya oluştur
            let orderDealer = await dealerRepo.findOne({
              where: { companyName: 'Order' },
            })

            if (!orderDealer) {
              console.log('⚠️ "Order" dealer bulunamadı, oluşturuluyor...')
              // "Order" dealer'ı yoksa oluştur
              const userRepo = await getUserRepository()
              
              const email = 'order@system.local'
              let existingUser = await userRepo.findOne({ where: { email } })
              
              let user
              if (existingUser) {
                user = existingUser
                console.log('✅ Mevcut user bulundu:', user.id)
                
                // Bu userId'ye sahip bir dealer var mı kontrol et
                const existingDealer = await dealerRepo.findOne({
                  where: { userId: user.id },
                })
                
                if (existingDealer) {
                  // Bu dealer'ı kullan, companyName'i güncelle
                  existingDealer.companyName = 'Order'
                  orderDealer = await dealerRepo.save(existingDealer)
                  console.log('✅ Mevcut dealer "Order" olarak güncellendi:', orderDealer.id)
                } else {
                  // Yeni dealer oluştur
                  orderDealer = dealerRepo.create({
                    userId: user.id,
                    companyName: 'Order',
                    discountRate: 0,
                    isActive: true,
                  })
                  orderDealer = await dealerRepo.save(orderDealer)
                  console.log('✅ "Order" dealer oluşturuldu:', orderDealer.id)
                }
              } else {
                const hashedPassword = await bcrypt.hash('Order' + Date.now(), 10)
                user = userRepo.create({
                  supabaseId: randomUUID(),
                  email,
                  password: hashedPassword,
                  name: 'Order System',
                  role: UserRole.DEALER,
                })
                user = await userRepo.save(user)
                console.log('✅ Yeni user oluşturuldu:', user.id)

                orderDealer = dealerRepo.create({
                  userId: user.id,
                  companyName: 'Order',
                  discountRate: 0,
                  isActive: true,
                })
                orderDealer = await dealerRepo.save(orderDealer)
                console.log('✅ "Order" dealer oluşturuldu:', orderDealer.id)
              }
            } else {
              console.log('✅ "Order" dealer bulundu:', orderDealer.id)
            }

            // Siparişi "Order" dealer'ına ata (eğer daha önce atanmamışsa)
            const oldDealerId = order.dealerId
            if (!oldDealerId || oldDealerId !== orderDealer.id) {
              order.dealerId = orderDealer.id
              console.log(`✅ Sipariş ${order.orderNumber} Order dealer'ına atandı (önceki dealerId: ${oldDealerId}, yeni dealerId: ${order.dealerId})`)
            } else {
              console.log(`ℹ️ Sipariş ${order.orderNumber} zaten Order dealer'ına atanmış`)
            }

            // Stoktan düş (eğer daha önce düşülmemişse)
            if (!wasAlreadyDelivered && order.items && order.items.length > 0) {
              console.log(`📦 ${order.items.length} adet ürün için stok düşürme işlemi başlıyor...`)
              for (const item of order.items) {
                if (item.product && item.product.trackStock) {
                  const product = await productRepo.findOne({
                    where: { id: item.productId },
                  })
                  if (product) {
                    // Stok kontrolü
                    if (product.stock < item.quantity) {
                      console.error(`❌ Yetersiz stok: ${product.name} (Mevcut: ${product.stock}, Gerekli: ${item.quantity})`)
                      return NextResponse.json(
                        { error: `Yetersiz stok: ${product.name} (Mevcut: ${product.stock}, Gerekli: ${item.quantity})` },
                        { status: 400 }
                      )
                    }
                    const oldStock = product.stock
                    product.stock = (product.stock || 0) - item.quantity
                    await productRepo.save(product)
                    console.log(`✅ Stok düşürüldü: ${product.name} - ${oldStock} -> ${product.stock} (${item.quantity} adet)`)
                  }
                }
              }
            } else {
              if (wasAlreadyDelivered) {
                console.log('ℹ️ Sipariş daha önce teslim edilmiş, stok düşürme işlemi atlanıyor')
              } else {
                console.log('⚠️ Siparişte ürün bulunamadı veya ürün yok')
              }
            }
          } catch (orderDealerError: any) {
            console.error('❌ Order dealer atama/stok düşürme hatası:', orderDealerError?.message)
            console.error('❌ Hata detayı:', orderDealerError)
            // Hata olsa bile devam et
          }
        }
        
        // deliveredAt'i set et
        order.deliveredAt = new Date()
      }
    }

    // Stok güncelleme: Admin siparişi onayladığında (CONFIRMED veya PROCESSING) stoktan düş
    // NOT: ORD- siparişleri için stok düşürme işlemi DELIVERED durumunda yapılıyor, burada yapılmamalı
    if (status && (newStatus === OrderStatus.CONFIRMED || newStatus === OrderStatus.PROCESSING)) {
      // ORD- siparişleri için bu mantık uygulanmamalı (onlar DELIVERED durumunda işleniyor)
      if (!order.orderNumber.startsWith('ORD-')) {
        // Eğer önceki durum PENDING ise stoktan düşür (tekrar düşmesini engellemek için)
        if (oldStatus === OrderStatus.PENDING && order.items) {
          for (const item of order.items) {
            if (item.product && item.product.trackStock) {
              const product = await productRepo.findOne({
                where: { id: item.productId },
              })
              if (product) {
                // Stok kontrolü
                if (product.stock < item.quantity) {
                  return NextResponse.json(
                    { error: `Yetersiz stok: ${product.name} (Mevcut: ${product.stock}, Gerekli: ${item.quantity})` },
                    { status: 400 }
                  )
                }
                product.stock = (product.stock || 0) - item.quantity
                await productRepo.save(product)
              }
            }
          }
        }
      }
    }

    // İptal durumunda stoku geri ekle
    if (status && newStatus === OrderStatus.CANCELLED && oldStatus !== OrderStatus.CANCELLED) {
      // Eğer sipariş daha önce onaylanmışsa (CONFIRMED, PROCESSING, SHIPPED, DELIVERED) stoku geri ekle
      // NOT: DELIVERED durumunda da stok geri eklenebilir (nadir durumlar için)
      if (oldStatus === OrderStatus.CONFIRMED || 
          oldStatus === OrderStatus.PROCESSING || 
          oldStatus === OrderStatus.SHIPPED ||
          oldStatus === OrderStatus.DELIVERED) {
        if (order.items) {
          for (const item of order.items) {
            if (item.product && item.product.trackStock) {
              const product = await productRepo.findOne({
                where: { id: item.productId },
              })
              if (product) {
                product.stock = (product.stock || 0) + item.quantity
                await productRepo.save(product)
              }
            }
          }
        }
      }
    }

    console.log(`💾 Saving order: ${order.orderNumber}, status=${order.status}, dealerId=${order.dealerId}`)
    await orderRepo.save(order)
    console.log(`✅ Order saved successfully`)

    // Güncellenmiş siparişi getir
    const updatedOrder = await orderRepo.findOne({
      where: { id },
      relations: ['user', 'dealer', 'items', 'items.product'],
    })

    console.log(`📤 Returning updated order: ${updatedOrder?.orderNumber}, dealerId=${updatedOrder?.dealerId}`)
    return NextResponse.json({ order: serializeOrder(updatedOrder) })
  } catch (error: any) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
