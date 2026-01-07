import { getProduct } from '@/lib/api'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/AddToCartButton'

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const data = await getProduct(params.slug)

  if (!data || !data.product) {
    notFound()
  }

  const product = data.product

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div>
          {product.images && product.images.length > 0 ? (
            <div className="space-y-4">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((image: string, idx: number) => (
                    <img
                      key={idx}
                      src={image}
                      alt={`${product.name} ${idx + 2}`}
                      className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">Resim Yok</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          {product.category && (
            <p className="text-gray-600 mb-4">
              Kategori: <span className="font-semibold">{product.category.name}</span>
            </p>
          )}

          <div className="mb-6">
            <div className="flex items-center gap-4">
              <span className="text-3xl font-bold text-primary-600">
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: 'TRY',
                }).format(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-xl text-gray-400 line-through">
                  {new Intl.NumberFormat('tr-TR', {
                    style: 'currency',
                    currency: 'TRY',
                  }).format(product.comparePrice)}
                </span>
              )}
            </div>
          </div>

          {product.shortDescription && (
            <p className="text-gray-700 mb-6">{product.shortDescription}</p>
          )}

          {product.stock > 0 ? (
            <p className="text-green-600 mb-4">Stokta var ({product.stock} adet)</p>
          ) : (
            <p className="text-red-600 mb-4">Stokta yok</p>
          )}

          <AddToCartButton product={product} />

          {product.description && (
            <div className="mt-8 pt-8 border-t">
              <h2 className="text-xl font-bold mb-4">Ürün Açıklaması</h2>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


