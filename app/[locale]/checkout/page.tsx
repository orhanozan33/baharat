'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from '@/hooks/useTranslations'
import { showToast } from '@/components/Toast'
import { formatPrice } from '@/lib/utils'

export default function CheckoutPage() {
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'tr'
  const [cart, setCart] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    shippingName: '',
    shippingPhone: '',
    shippingEmail: '',
    shippingAddress: '',
    shippingProvince: '',
    shippingCity: '',
    shippingPostalCode: '',
    billingName: '',
    billingAddress: '',
    billingTaxNumber: '',
    notes: '',
  })

  // Kanada Eyaletleri ve Şehirleri
  const canadianProvinces = [
    { value: 'AB', label: 'Alberta', cities: ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge'] },
    { value: 'BC', label: 'British Columbia', cities: ['Vancouver', 'Victoria', 'Surrey', 'Burnaby', 'Richmond'] },
    { value: 'MB', label: 'Manitoba', cities: ['Winnipeg', 'Brandon', 'Steinbach'] },
    { value: 'NB', label: 'New Brunswick', cities: ['Moncton', 'Saint John', 'Fredericton'] },
    { value: 'NL', label: 'Newfoundland and Labrador', cities: ["St. John's", 'Mount Pearl', 'Corner Brook'] },
    { value: 'NS', label: 'Nova Scotia', cities: ['Halifax', 'Dartmouth', 'Sydney'] },
    { value: 'ON', label: 'Ontario', cities: ['Toronto', 'Ottawa', 'Hamilton', 'London', 'Windsor', 'Kitchener', 'Mississauga', 'Brampton'] },
    { value: 'PE', label: 'Prince Edward Island', cities: ['Charlottetown', 'Summerside'] },
    { value: 'QC', label: 'Quebec', cities: ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke'] },
    { value: 'SK', label: 'Saskatchewan', cities: ['Saskatoon', 'Regina', 'Prince Albert'] },
    { value: 'NT', label: 'Northwest Territories', cities: ['Yellowknife', 'Hay River', 'Inuvik'] },
    { value: 'YT', label: 'Yukon', cities: ['Whitehorse', 'Dawson City'] },
    { value: 'NU', label: 'Nunavut', cities: ['Iqaluit', 'Rankin Inlet', 'Arviat'] },
  ]

  const [availableCities, setAvailableCities] = useState<string[]>([])
  const t = useTranslations()

  useEffect(() => {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
    if (cartData.length === 0) {
      router.push(`/${locale}/cart`)
      return
    }
    setCart(cartData)
    // Giriş kontrolü kaldırıldı - sipariş giriş gerektirmiyor
  }, [router, locale])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Giriş gerektirmeden sipariş oluştur
      const orderData = {
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingProvince: formData.shippingProvince,
        ...formData,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t('checkout.orderFailed') || 'Sipariş oluşturulamadı')
      }

      const { order } = await response.json()

      // Clear cart
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cartUpdated'))

      // Başarı mesajı
      showToast(
        t('checkout.orderSuccess') || `Siparişiniz alındı! Sipariş No: ${order.orderNumber}`,
        'success'
      )

      // Redirect to order success page
      router.push(`/${locale}/orders/${order.id}`)
    } catch (error: any) {
      showToast(error.message || t('checkout.orderFailed') || 'Bir hata oluştu', 'error')
      setLoading(false)
    }
  }

  const [taxRates, setTaxRates] = useState({ federalTaxRate: 5, provincialTaxRate: 8 })

  useEffect(() => {
    // Vergi oranlarını al
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        setTaxRates({
          federalTaxRate: parseFloat(data.settings.federalTaxRate) || 5,
          provincialTaxRate: parseFloat(data.settings.provincialTaxRate) || 8,
        })
      })
      .catch((error) => {
        console.error('Load tax rates error:', error)
      })
  }, [])

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  // Kanada için vergi hesaplama (federal + eyalet)
  const federalTax = (subtotal * taxRates.federalTaxRate) / 100
  const provincialTax = (subtotal * taxRates.provincialTaxRate) / 100
  const tax = federalTax + provincialTax
  const total = subtotal + tax

  // Eyalet değiştiğinde şehirleri güncelle
  useEffect(() => {
    const province = canadianProvinces.find(p => p.value === formData.shippingProvince)
    if (province) {
      setAvailableCities(province.cities)
      if (!province.cities.includes(formData.shippingCity)) {
        setFormData({ ...formData, shippingCity: '' })
      }
    } else {
      setAvailableCities([])
    }
  }, [formData.shippingProvince])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{t('checkout.title') || 'Sipariş Bilgileri'}</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* İletişim Bilgileri */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{t('checkout.contactInfo') || 'İletişim Bilgileri'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  {t('checkout.name') || 'Ad Soyad'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shippingName}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('checkout.namePlaceholder') || 'Adınız ve Soyadınız'}
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  {t('checkout.phone') || 'Telefon'} *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.shippingPhone}
                  onChange={(e) => {
                    // Kanada telefon formatı: +1 (XXX) XXX-XXXX
                    let value = e.target.value.replace(/\D/g, '')
                    if (value.startsWith('1')) {
                      value = value.substring(1)
                    }
                    let formatted = value.length > 0 ? '+1 ' : ''
                    if (value.length > 0) formatted += '('
                    if (value.length > 3) {
                      formatted += value.substring(0, 3) + ') '
                      if (value.length > 6) {
                        formatted += value.substring(3, 6) + '-' + value.substring(6, 10)
                      } else {
                        formatted += value.substring(3)
                      }
                    } else {
                      formatted += value
                    }
                    setFormData({ ...formData, shippingPhone: formatted })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('checkout.phonePlaceholder') || '+1 (514) 726-7067'}
                  maxLength={17}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold">
                  {t('checkout.email') || 'E-posta'} *
                </label>
                <input
                  type="email"
                  required
                  value={formData.shippingEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingEmail: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('checkout.emailPlaceholder') || 'ornek@email.com'}
                />
              </div>
            </div>
          </div>

          {/* Teslimat Bilgileri */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{t('checkout.shippingInfo') || 'Teslimat Adresi'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold">
                  {t('checkout.address') || 'Adres'} *
                </label>
                <textarea
                  required
                  value={formData.shippingAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingAddress: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder={t('checkout.addressPlaceholder') || 'Street address, apartment, suite, etc.'}
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  {t('checkout.province') || 'Province'} *
                </label>
                <select
                  required
                  value={formData.shippingProvince}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingProvince: e.target.value, shippingCity: '' })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">{t('checkout.selectProvince') || 'Select Province'}</option>
                  {canadianProvinces.map((province) => (
                    <option key={province.value} value={province.value}>
                      {province.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  {t('checkout.city') || 'City'} *
                </label>
                <select
                  required
                  value={formData.shippingCity}
                  onChange={(e) =>
                    setFormData({ ...formData, shippingCity: e.target.value })
                  }
                  disabled={!formData.shippingProvince}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">{t('checkout.selectCity') || 'Select City'}</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  {t('checkout.postalCode') || 'Postal Code'} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.shippingPostalCode}
                  onChange={(e) => {
                    // Kanada posta kodu formatı: A1A 1A1
                    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                    if (value.length > 3) {
                      value = value.substring(0, 3) + ' ' + value.substring(3, 6)
                    }
                    setFormData({ ...formData, shippingPostalCode: value })
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('checkout.postalCodePlaceholder') || 'A1A 1A1'}
                  maxLength={7}
                />
              </div>
            </div>
          </div>

          {/* Fatura Bilgileri */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{t('checkout.billingInfo') || 'Fatura Bilgileri'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-semibold">
                  {t('checkout.billingName') || 'Ad Soyad / Firma Adı'}
                </label>
                <input
                  type="text"
                  value={formData.billingName}
                  onChange={(e) =>
                    setFormData({ ...formData, billingName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('checkout.billingNamePlaceholder') || 'Fatura için ad veya firma adı'}
                />
              </div>
              <div>
                <label className="block mb-2 font-semibold">
                  {t('checkout.taxNumber') || 'GST/HST Number (Optional)'}
                </label>
                <input
                  type="text"
                  value={formData.billingTaxNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, billingTaxNumber: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={t('checkout.taxNumberPlaceholder') || 'GST/HST Number (for business customers)'}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 font-semibold">
                  {t('checkout.billingAddress') || 'Fatura Adresi'}
                </label>
                <textarea
                  value={formData.billingAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, billingAddress: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder={t('checkout.billingAddressPlaceholder') || 'Fatura adresi (opsiyonel)'}
                />
              </div>
            </div>
          </div>

          {/* Notlar */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">{t('checkout.notes') || 'Sipariş Notları'}</h2>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
              placeholder={t('checkout.notesPlaceholder') || 'Siparişinizle ilgili özel notlarınız (opsiyonel)'}
            />
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">{t('cart.orderSummary') || 'Sipariş Özeti'}</h2>
            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm border-b pb-2">
                  <span className="flex-1">{item.name} x{item.quantity}</span>
                  <span className="font-semibold ml-2">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 space-y-2 mb-4">
              <div className="flex justify-between">
                <span>{t('cart.subtotal') || 'Ara Toplam'}</span>
                <span className="font-semibold">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>GST:</span>
                <span className="font-semibold">{formatPrice(federalTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>PST/HST:</span>
                <span className="font-semibold">{formatPrice(provincialTax)}</span>
              </div>
            </div>
            <div className="border-t pt-4 mb-4">
              <div className="flex justify-between text-xl font-bold">
                <span>{t('cart.total') || 'Total'}</span>
                <span className="text-primary-600">{formatPrice(total)}</span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                {t('checkout.orderNote') || 'Siparişiniz alındıktan sonra admin tarafından onaylanacak ve size bilgi verilecektir.'}
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? t('checkout.processing') || 'İşleniyor...' : t('checkout.completeOrder') || 'Siparişi Tamamla'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

