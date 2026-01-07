'use client'

import { useState, useEffect } from 'react'

export default function DealerDashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('auth-token')
        const response = await fetch('/api/dealer/dashboard', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard')
        }

        const data = await response.json()
        setData(data)
      } catch (error) {
        console.error('Error fetching dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return <div className="text-center py-12">Yükleniyor...</div>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        Hoş Geldiniz, {data?.dealer?.companyName}
      </h1>

      {data && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 mb-2">Toplam Sipariş</h3>
              <p className="text-3xl font-bold">{data.stats.totalOrders}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 mb-2">Bekleyen Siparişler</h3>
              <p className="text-3xl font-bold text-yellow-600">
                {data.stats.pendingOrders}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-gray-600 mb-2">Toplam Gelir</h3>
              <p className="text-3xl font-bold text-green-600">
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'CAD',
                }).format(data.stats.totalRevenue)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Son Siparişler</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Sipariş No</th>
                    <th className="text-left p-2">Toplam</th>
                    <th className="text-left p-2">Durum</th>
                    <th className="text-left p-2">Tarih</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders?.map((order: any) => (
                    <tr key={order.id} className="border-b">
                      <td className="p-2">{order.orderNumber}</td>
                      <td className="p-2">
                        {new Intl.NumberFormat('tr-TR', {
                          style: 'currency',
                          currency: 'CAD',
                        }).format(order.total)}
                      </td>
                      <td className="p-2">
                        <span className="px-2 py-1 bg-gray-100 rounded text-sm">
                          {order.status}
                        </span>
                      </td>
                      <td className="p-2">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


