/**
 * TypeORM entity'lerini Client Component'lere geçirebilmek için plain object'e serialize eder
 */
export function serializeProduct(product: any): any {
  if (!product) return null
  
  // TypeORM simple-array string olarak kaydeder, array'e çevir
  let imagesArray: string[] = []
  if (product.images) {
    if (Array.isArray(product.images)) {
      imagesArray = product.images
    } else if (typeof product.images === 'string') {
      // Simple-array string formatını parse et (virgülle ayrılmış)
      imagesArray = product.images.split(',').filter((img: string) => img.trim() !== '')
    }
  }
  
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    comparePrice: product.comparePrice ? Number(product.comparePrice) : null,
    images: imagesArray,
    stock: Number(product.stock || 0),
    isFeatured: Boolean(product.isFeatured),
    isActive: Boolean(product.isActive),
    sku: product.sku || '',
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    unit: product.unit || 'g',
    weight: product.weight ? Number(product.weight) : null,
    baseName: product.baseName || null,
    trackStock: product.trackStock !== undefined ? Boolean(product.trackStock) : true,
    category: product.category ? {
      id: product.category.id,
      name: product.category.name,
      slug: product.category.slug,
    } : null,
  }
}

export function serializeProducts(products: any[]): any[] {
  return products.map(serializeProduct)
}

export function serializeCategory(category: any): any {
  if (!category) return null
  
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description || '',
    image: category.image || null,
    parentId: category.parentId || null,
    order: category.order || 0,
    isActive: Boolean(category.isActive),
    parent: category.parent ? {
      id: category.parent.id,
      name: category.parent.name,
      slug: category.parent.slug,
    } : null,
  }
}

export function serializeCategories(categories: any[]): any[] {
  return categories.map(serializeCategory)
}

export function serializeOrder(order: any): any {
  if (!order) return null
  
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId || null,
    dealerId: order.dealerId || null,
    status: order.status,
    subtotal: Number(order.subtotal || 0),
    tax: Number(order.tax || 0),
    shipping: Number(order.shipping || 0),
    discount: Number(order.discount || 0),
    total: Number(order.total || 0),
    currency: order.currency || 'CAD',
    shippingName: order.shippingName || '',
    shippingPhone: order.shippingPhone || '',
    shippingEmail: order.shippingEmail || null,
    shippingAddress: order.shippingAddress || '',
    shippingProvince: order.shippingProvince || null,
    shippingCity: order.shippingCity || '',
    shippingPostalCode: order.shippingPostalCode || null,
    billingName: order.billingName || null,
    billingAddress: order.billingAddress || null,
    billingTaxNumber: order.billingTaxNumber || null,
    notes: order.notes || null,
    trackingNumber: order.trackingNumber || null,
    shippedAt: order.shippedAt ? new Date(order.shippedAt).toISOString() : null,
    deliveredAt: order.deliveredAt ? new Date(order.deliveredAt).toISOString() : null,
    createdAt: order.createdAt ? new Date(order.createdAt).toISOString() : null,
    updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : null,
    items: order.items ? order.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
      total: Number(item.total || 0),
      sku: item.sku || '',
      product: item.product ? serializeProduct(item.product) : null,
    })) : [],
    user: order.user ? {
      id: order.user.id,
      email: order.user.email,
      name: order.user.name,
    } : null,
    dealer: order.dealer ? {
      id: order.dealer.id,
      companyName: order.dealer.companyName,
    } : null,
  }
}

export function serializeOrders(orders: any[]): any[] {
  return orders.map(serializeOrder)
}

export function serializeUser(user: any): any {
  if (!user) return null
  
  return {
    id: user.id,
    email: user.email || '',
    name: user.name || null,
    username: user.username || null,
    phone: user.phone || null,
    address: user.address || null,
    city: user.city || null,
    postalCode: user.postalCode || null,
    role: user.role || 'USER',
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
  }
}

export function serializeUsers(users: any[]): any[] {
  return users.map(serializeUser)
}

export function serializeDealer(dealer: any): any {
  if (!dealer) return null
  
  return {
    id: dealer.id,
    userId: dealer.userId || null,
    companyName: dealer.companyName || '',
    taxNumber: dealer.taxNumber || null,
    discountRate: Number(dealer.discountRate || 0),
    isActive: Boolean(dealer.isActive),
    address: dealer.address || null,
    phone: dealer.phone || null,
    email: dealer.email || null,
    createdAt: dealer.createdAt ? new Date(dealer.createdAt).toISOString() : null,
    updatedAt: dealer.updatedAt ? new Date(dealer.updatedAt).toISOString() : null,
    user: dealer.user ? serializeUser(dealer.user) : null,
  }
}

export function serializeDealers(dealers: any[]): any[] {
  return dealers.map(serializeDealer)
}

