const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

export async function getProducts(params?: {
  category?: string
  search?: string
  page?: number
  limit?: number
}) {
  const searchParams = new URLSearchParams()
  if (params?.category) searchParams.set('category', params.category)
  if (params?.search) searchParams.set('search', params.search)
  if (params?.page) searchParams.set('page', params.page.toString())
  if (params?.limit) searchParams.set('limit', params.limit.toString())

  const response = await fetch(`${API_URL}/api/products?${searchParams}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export async function getProduct(slug: string) {
  const response = await fetch(`${API_URL}/api/products/${slug}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export async function getCategories() {
  const response = await fetch(`${API_URL}/api/categories`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export async function getCategory(slug: string) {
  const response = await fetch(`${API_URL}/api/categories/${slug}`, {
    cache: 'no-store',
  })

  if (!response.ok) {
    return null
  }

  return response.json()
}

export async function createOrder(orderData: any, token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify(orderData),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Order creation failed')
  }

  return response.json()
}

