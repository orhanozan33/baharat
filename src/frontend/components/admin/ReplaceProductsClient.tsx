'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReplaceProductsClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleReplace = async () => {
    if (!confirm('Tüm ürünler kalıcı olarak silinecek ve yeni ürünler eklenecek. Emin misiniz?')) {
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/admin/products/replace-all', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu')
      }

      setResult(data)
      
      // 2 saniye sonra ürünler sayfasına yönlendir
      setTimeout(() => {
        router.push('/admin/products')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Tüm Ürünleri Değiştir
          </h1>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              <strong>Uyarı:</strong> Bu işlem tüm mevcut ürünleri kalıcı olarak silecek ve 
              görseldeki 187 ürünü ekleyecektir. Bu işlem geri alınamaz!
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-green-800 mb-2">İşlem Başarılı!</h3>
              <ul className="text-green-700 space-y-1">
                <li>Eklenen ürün sayısı: {result.created}</li>
                {result.errors > 0 && (
                  <li className="text-yellow-700">Hata sayısı: {result.errors}</li>
                )}
              </ul>
              {result.errorDetails && result.errorDetails.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Hata Detayları:</p>
                  <ul className="list-disc list-inside text-sm">
                    {result.errorDetails.map((err: any, idx: number) => (
                      <li key={idx}>{err.product}: {err.error}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="text-sm text-green-600 mt-2">
                Ürünler sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleReplace}
              disabled={loading}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'İşleniyor...' : 'Tüm Ürünleri Değiştir'}
            </button>
            
            <button
              onClick={() => router.push('/admin/products')}
              disabled={loading}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              İptal
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

