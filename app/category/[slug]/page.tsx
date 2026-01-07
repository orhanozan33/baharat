import { getCategory, getProducts } from '@/lib/api'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function CategoryPage({
  params,
}: {
  params: { slug: string }
}) {
  const categoryData = await getCategory(params.slug)
  
  if (!categoryData || !categoryData.category) {
    notFound()
  }

  const category = categoryData.category
  const productsData = await getProducts({ category: category.id })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{category.name}</h1>
      {category.description && (
        <p className="text-gray-600 mb-8">{category.description}</p>
      )}

      {productsData?.products && productsData.products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {productsData.products.map((product: any) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="block bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
            >
              {product.images && product.images.length > 0 && (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-64 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold mb-2">{product.baseName || product.name}</h3>
                <p className="text-primary-600 font-bold text-lg">
                  {new Intl.NumberFormat('en-CA', {
                    style: 'currency',
                    currency: 'CAD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 py-12">
          Bu kategoride ürün bulunamadı.
        </p>
      )}
    </div>
  )
}


