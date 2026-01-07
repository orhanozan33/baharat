'use client'

import { useState, useEffect } from 'react'

interface ProductImageGalleryProps {
  images: string[]
  productName: string
  discountPercent?: number
}

export function ProductImageGallery({ images, productName, discountPercent = 0 }: ProductImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState(0)

  // Eğer images array değilse, string ise array'e çevir
  const imagesArray = Array.isArray(images) ? images : (images ? [images] : [])

  // İlk görseli seçili olarak ayarla
  useEffect(() => {
    if (imagesArray.length > 0) {
      setSelectedImage(0)
    }
  }, [imagesArray.length])

  if (imagesArray.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-lg">Resim Yok</span>
      </div>
    )
  }

  const handleThumbnailClick = (index: number) => {
    setSelectedImage(index)
  }

  return (
    <div className="relative transform -translate-y-[15%]">
      {/* Büyük Ana Görsel */}
      <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden">
        <img
          src={imagesArray[selectedImage]?.startsWith('http') || imagesArray[selectedImage]?.startsWith('/') 
            ? imagesArray[selectedImage] 
            : `/${imagesArray[selectedImage]}`}
          alt={`${productName} - Görsel ${selectedImage + 1}`}
          className="w-full h-full object-contain p-3 transition-opacity duration-300"
          onError={(e) => {
            e.currentTarget.src = '/placeholder-image.png'
            e.currentTarget.className = 'w-full h-full object-cover'
          }}
        />
        {discountPercent > 0 && (
          <div className="absolute top-[11%] left-3 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg z-10">
            %{discountPercent} İndirim
          </div>
        )}
      </div>

      {/* Küçük Thumbnail Görseller */}
      {imagesArray.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-[20%] z-20">
          <div className="grid grid-cols-5 gap-1.5 px-1">
          {imagesArray.slice(0, 5).map((image, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleThumbnailClick(index)}
              className={`relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                selectedImage === index
                  ? 'ring-2 ring-primary-500 ring-offset-1.5'
                  : 'hover:ring-2 ring-gray-300 hover:ring-offset-1'
              }`}
            >
              <img
                src={image.startsWith('http') || image.startsWith('/') ? image : `/${image}`}
                alt={`${productName} thumbnail ${index + 1}`}
                className={`w-full h-full object-contain p-1.5 transition-opacity duration-200 ${
                  selectedImage === index ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                }`}
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-image.png'
                  e.currentTarget.className = 'w-full h-full object-cover p-1'
                }}
              />
              {selectedImage === index && (
                <div className="absolute inset-0 bg-primary-500/10 pointer-events-none" />
              )}
            </button>
          ))}
          </div>
        </div>
      )}
    </div>
  )
}

