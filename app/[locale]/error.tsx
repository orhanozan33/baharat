'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Bir hata oluştu</h2>
        <p className="text-gray-600 mb-6">
          {error.message || 'Beklenmeyen bir hata meydana geldi.'}
        </p>
        <button
          onClick={reset}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition font-semibold"
        >
          Tekrar Dene
        </button>
      </div>
    </div>
  )
}


