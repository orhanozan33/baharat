'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'

interface DealerAccountPageProps {
  dealer: any
}

type TabType = 'products' | 'finance' | 'settings'

export default function DealerAccountPage({
  dealer,
}: DealerAccountPageProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('products')
  const [products, setProducts] = useState<any[]>([])
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [dealerProducts, setDealerProducts] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [checks, setChecks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  // Finance state
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentType, setPaymentType] = useState('CASH')
  const [paymentDescription, setPaymentDescription] = useState('')

  // Check state
  const [checkAmount, setCheckAmount] = useState('')
  const [checkNumber, setCheckNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [checkNotes, setCheckNotes] = useState('')

  // Product management state
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [productPrice, setProductPrice] = useState('')
  const [productDiscount, setProductDiscount] = useState('0')
  const [productSearch, setProductSearch] = useState('')

  const [totalDebt, setTotalDebt] = useState(0)

  useEffect(() => {
    if (dealer) {
      loadData()
      loadDebt()
    }
  }, [dealer])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load all products for admin (no limit)
      const productsRes = await fetch('/api/admin/products?limit=1000')
      const productsData = await productsRes.json()
      setAllProducts(productsData.products || [])

      // Load dealer products
      const dealerProductsRes = await fetch(`/api/admin/dealers/${dealer.id}/products`)
      const dealerProductsData = await dealerProductsRes.json()
      setDealerProducts(dealerProductsData.products || [])

      // Load payments
      const paymentsRes = await fetch(`/api/admin/dealers/${dealer.id}/payments`)
      const paymentsData = await paymentsRes.json()
      setPayments(paymentsData.payments || [])

      // Load checks
      const checksRes = await fetch(`/api/admin/dealers/${dealer.id}/checks`)
      const checksData = await checksRes.json()
      setChecks(checksData.checks || [])

    } catch (error) {
      console.error('Load data error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadDebt = async () => {
    try {
      const ordersRes = await fetch(`/api/admin/orders?dealerId=${dealer.id}`)
      const ordersData = await ordersRes.json()
      const orders = ordersData.orders || []
      const debt = orders.reduce((sum: number, order: any) => {
        // Only count unpaid orders (PENDING, CONFIRMED, PROCESSING)
        if (['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)) {
          return sum + (order.total || 0)
        }
        return sum
      }, 0)
      setTotalDebt(debt)
    } catch (error) {
      console.error('Load debt error:', error)
    }
  }

  const calculateDebt = (dealerProds: any[], pays: any[], chks: any[]) => {
    // Calculate total orders amount from dealer
    // This should be calculated from orders
    // For now, we'll show dealer products and payments
  }

  const handleAddProduct = async () => {
    if (!selectedProduct || !productPrice) {
      showToast('Lütfen ürün ve fiyat seçin', 'warning')
      return
    }

    // Geçersiz dealer ID kontrolü
    if (!dealer.id || dealer.id.startsWith('temp-')) {
      showToast('Geçersiz bayi ID. Lütfen önce bayi kaydını tamamlayın.', 'error')
      return
    }

    try {
      const response = await fetch(`/api/admin/dealers/${dealer.id}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct,
          price: parseFloat(productPrice),
          discountRate: parseFloat(productDiscount || '0'),
        }),
      })

      if (response.ok) {
        await loadData()
        setSelectedProduct('')
        setProductPrice('')
        setProductDiscount('0')
        setProductSearch('')
        showToast('Ürün başarıyla eklendi!', 'success')
      } else {
        const error = await response.json()
        showToast(error.error || 'Ürün eklenirken hata oluştu', 'error')
      }
    } catch (error) {
      console.error('Add product error:', error)
      showToast('Ürün eklenirken hata oluştu', 'error')
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    if (!confirm('Bu ürünü kaldırmak istediğinize emin misiniz?')) return

    try {
      const response = await fetch(`/api/admin/dealers/${dealer.id}/products/${productId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await loadData()
        showToast('Ürün başarıyla kaldırıldı', 'success')
      } else {
        showToast('Ürün kaldırılırken hata oluştu', 'error')
      }
    } catch (error) {
      console.error('Remove product error:', error)
      showToast('Ürün kaldırılırken hata oluştu', 'error')
    }
  }

  const handleAddPayment = async () => {
    if (!paymentAmount || !paymentDate) {
      showToast('Lütfen tutar ve tarih girin', 'warning')
      return
    }

    try {
      const response = await fetch(`/api/admin/dealers/${dealer.id}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(paymentAmount),
          type: paymentType,
          paymentDate,
          description: paymentDescription,
        }),
      })

      if (response.ok) {
        await loadData()
        setPaymentAmount('')
        setPaymentDescription('')
        showToast('Ödeme başarıyla eklendi', 'success')
      } else {
        const error = await response.json()
        showToast(error.error || 'Ödeme eklenirken hata oluştu', 'error')
      }
    } catch (error) {
      console.error('Add payment error:', error)
      showToast('Ödeme eklenirken hata oluştu', 'error')
    }
  }

  const handleAddCheck = async () => {
    if (!checkAmount || !checkNumber || !bankName || !dueDate) {
      showToast('Lütfen tüm çek bilgilerini girin', 'warning')
      return
    }

    try {
      const response = await fetch(`/api/admin/dealers/${dealer.id}/checks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(checkAmount),
          checkNumber,
          bankName,
          issueDate,
          dueDate,
          notes: checkNotes,
        }),
      })

      if (response.ok) {
        await loadData()
        setCheckAmount('')
        setCheckNumber('')
        setBankName('')
        setCheckNotes('')
        showToast('Çek başarıyla eklendi', 'success')
      } else {
        const error = await response.json()
        showToast(error.error || 'Çek eklenirken hata oluştu', 'error')
      }
    } catch (error) {
      console.error('Add check error:', error)
      showToast('Çek eklenirken hata oluştu', 'error')
    }
  }

  // Calculate totals
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0)
  const totalChecks = checks.filter(c => c.status === 'CLEARED').reduce((sum, c) => sum + c.amount, 0)
  const totalReceived = totalPayments + totalChecks
  const balance = totalDebt - totalReceived

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{dealer.companyName}</h1>
            <p className="text-sm text-gray-600 mt-1">{dealer.user?.email}</p>
          </div>
          <button
            onClick={() => router.push('/admin/dealers')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Geri Dön
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg mt-6 mb-6 overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 200px)' }}>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'products'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ürünler
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'finance'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Cari Hesap
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-6 py-3 font-medium transition ${
              activeTab === 'settings'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ayarlar
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">Yükleniyor...</div>
          ) : activeTab === 'products' ? (
            <div className="space-y-6">
              {/* Add Product Form */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Ürün Ekle</h3>
                <div className="space-y-4">
                  {/* Product Search and Selection */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Ürün ara..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    {productSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {allProducts
                          .filter((p) => 
                            p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
                            p.sku?.toLowerCase().includes(productSearch.toLowerCase())
                          )
                          .slice(0, 10)
                          .map((p) => {
                            const isAlreadyAdded = dealerProducts.some(dp => dp.productId === p.id)
                            return (
                              <button
                                key={p.id}
                                onClick={() => {
                                  if (!isAlreadyAdded) {
                                    setSelectedProduct(p.id)
                                    setProductSearch(p.name)
                                    // Ürün fiyatını otomatik doldur
                                    setProductPrice(p.price?.toString() || '0')
                                  }
                                }}
                                disabled={isAlreadyAdded}
                                className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition ${
                                  isAlreadyAdded ? 'opacity-50 cursor-not-allowed' : ''
                                } ${selectedProduct === p.id ? 'bg-primary-50' : ''}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="font-medium">{p.name}</span>
                                    {p.price && (
                                      <span className="ml-2 text-xs text-gray-500">
                                        (${p.price.toFixed(2)})
                                      </span>
                                    )}
                                  </div>
                                  {isAlreadyAdded && (
                                    <span className="text-xs text-gray-500">(Ekli)</span>
                                  )}
                                </div>
                                {p.sku && (
                                  <span className="text-xs text-gray-500">SKU: {p.sku}</span>
                                )}
                              </button>
                            )
                          })}
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Product Info */}
                  {selectedProduct && (
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600">
                            Seçili Ürün: <span className="font-semibold">
                              {allProducts.find(p => p.id === selectedProduct)?.name}
                            </span>
                          </p>
                          {allProducts.find(p => p.id === selectedProduct)?.sku && (
                            <p className="text-xs text-gray-500 mt-1">
                              SKU: {allProducts.find(p => p.id === selectedProduct)?.sku}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProduct('')
                            setProductSearch('')
                            setProductPrice('')
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Temizle
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Price and Discount Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Fiyat (CAD)"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      step="0.01"
                      min="0"
                    />
                    <input
                      type="number"
                      placeholder="İskonto %"
                      value={productDiscount}
                      onChange={(e) => setProductDiscount(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      step="0.1"
                      min="0"
                      max="100"
                    />
                    <button
                      onClick={handleAddProduct}
                      disabled={!selectedProduct || !productPrice}
                      className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Ürün Ekle
                    </button>
                  </div>
                </div>
              </div>

              {/* Dealer Products List */}
              <div>
                <h3 className="font-semibold mb-4">Bayi Ürünleri ({dealerProducts.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">Ürün</th>
                        <th className="text-left p-3 text-sm font-semibold">Fiyat</th>
                        <th className="text-left p-3 text-sm font-semibold">İskonto</th>
                        <th className="text-left p-3 text-sm font-semibold">Durum</th>
                        <th className="text-left p-3 text-sm font-semibold">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dealerProducts.map((dp) => {
                        const product = allProducts.find((p) => p.id === dp.productId)
                        return (
                          <tr key={dp.id} className="border-b">
                            <td className="p-3">{product?.name || '-'}</td>
                            <td className="p-3">${dp.price.toFixed(2)}</td>
                            <td className="p-3">%{dp.discountRate.toFixed(1)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs ${
                                dp.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {dp.isActive ? 'Aktif' : 'Pasif'}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleRemoveProduct(dp.id)}
                                className="text-red-600 hover:text-red-800 text-sm"
                              >
                                Kaldır
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === 'finance' ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Toplam Borç</p>
                  <p className="text-2xl font-bold text-blue-700">${totalDebt.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Toplam Ödeme</p>
                  <p className="text-2xl font-bold text-green-700">${totalPayments.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Tahsil Çekler</p>
                  <p className="text-2xl font-bold text-yellow-700">${totalChecks.toFixed(2)}</p>
                </div>
                <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                  <p className="text-sm text-gray-600">Bakiye</p>
                  <p className={`text-2xl font-bold ${balance >= 0 ? 'text-red-700' : 'text-green-700'}`}>
                    ${Math.abs(balance).toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Add Payment */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Ödeme Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <input
                    type="number"
                    placeholder="Tutar (CAD)"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    step="0.01"
                  />
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="CASH">Nakit</option>
                    <option value="BANK_TRANSFER">Banka Transferi</option>
                    <option value="CREDIT_CARD">Kredi Kartı</option>
                    <option value="OTHER">Diğer</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Açıklama"
                    value={paymentDescription}
                    onChange={(e) => setPaymentDescription(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleAddPayment}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Ödeme Ekle
                  </button>
                </div>
              </div>

              {/* Payments List */}
              <div>
                <h3 className="font-semibold mb-4">Ödemeler ({payments.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">Tarih</th>
                        <th className="text-left p-3 text-sm font-semibold">Tutar</th>
                        <th className="text-left p-3 text-sm font-semibold">Tip</th>
                        <th className="text-left p-3 text-sm font-semibold">Açıklama</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr key={payment.id} className="border-b">
                          <td className="p-3">{new Date(payment.paymentDate).toLocaleDateString('tr-TR')}</td>
                          <td className="p-3 font-semibold">${payment.amount.toFixed(2)}</td>
                          <td className="p-3">{payment.type}</td>
                          <td className="p-3">{payment.description || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Check */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-4">Çek Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  <input
                    type="number"
                    placeholder="Tutar (CAD)"
                    value={checkAmount}
                    onChange={(e) => setCheckAmount(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    step="0.01"
                  />
                  <input
                    type="text"
                    placeholder="Çek No"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="text"
                    placeholder="Banka Adı"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="date"
                    placeholder="Keşide Tarihi"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <input
                    type="date"
                    placeholder="Vade Tarihi"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={handleAddCheck}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition"
                  >
                    Çek Ekle
                  </button>
                </div>
                <textarea
                  placeholder="Notlar"
                  value={checkNotes}
                  onChange={(e) => setCheckNotes(e.target.value)}
                  className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={2}
                />
              </div>

              {/* Checks List */}
              <div>
                <h3 className="font-semibold mb-4">Çekler ({checks.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">Çek No</th>
                        <th className="text-left p-3 text-sm font-semibold">Tutar</th>
                        <th className="text-left p-3 text-sm font-semibold">Banka</th>
                        <th className="text-left p-3 text-sm font-semibold">Vade</th>
                        <th className="text-left p-3 text-sm font-semibold">Durum</th>
                        <th className="text-left p-3 text-sm font-semibold">Notlar</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checks.map((check) => (
                        <tr key={check.id} className="border-b">
                          <td className="p-3">{check.checkNumber}</td>
                          <td className="p-3 font-semibold">${check.amount.toFixed(2)}</td>
                          <td className="p-3">{check.bankName}</td>
                          <td className="p-3">{new Date(check.dueDate).toLocaleDateString('tr-TR')}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              check.status === 'CLEARED' ? 'bg-green-100 text-green-800' :
                              check.status === 'BOUNCED' ? 'bg-red-100 text-red-800' :
                              check.status === 'DEPOSITED' ? 'bg-blue-100 text-blue-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {check.status}
                            </span>
                          </td>
                          <td className="p-3">{check.notes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold mb-4">Ayarlar</h3>
              <p className="text-gray-600">Ayarlar bölümü yakında eklenecek...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

