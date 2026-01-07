import { getProducts, getCategories } from '@/lib/api'
import Link from 'next/link'

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { category?: string; search?: string; page?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const productsData = await getProducts({
    category: searchParams.category,
    search: searchParams.search,
    page,
    limit: 12,
  })
  const categoriesData = await getCategories()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar - Categories */}
        <aside className="w-full md:w-64">
          <h2 className="text-xl font-bold mb-4">Kategoriler</h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/products"
                className={`block p-2 rounded ${
                  !searchParams.category
                    ? 'bg-primary-100 text-primary-600'
                    : 'hover:bg-gray-100'
                }`}
              >
                Tümü
              </Link>
            </li>
            {categoriesData?.categories?.map((category: any) => (
              <li key={category.id}>
                <Link
                  href={`/products?category=${category.id}`}
                  className={`block p-2 rounded ${
                    searchParams.category === category.id
                      ? 'bg-primary-100 text-primary-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">Ürünler</h1>
            <form method="get" className="flex gap-2">
              <input
                type="text"
                name="search"
                placeholder="Ürün ara..."
                defaultValue={searchParams.search}
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                type="submit"
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
              >
                Ara
              </button>
            </form>
          </div>

          {productsData?.products && productsData.products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

              {/* Pagination */}
              {productsData.pagination && productsData.pagination.pages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {Array.from({ length: productsData.pagination.pages }).map(
                    (_, i) => {
                      const pageNum = i + 1
                      return (
                        <Link
                          key={pageNum}
                          href={`/products?page=${pageNum}${
                            searchParams.category
                              ? `&category=${searchParams.category}`
                              : ''
                          }${
                            searchParams.search
                              ? `&search=${searchParams.search}`
                              : ''
                          }`}
                          className={`px-4 py-2 rounded ${
                            page === pageNum
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      )
                    }
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-500 py-12">
              Ürün bulunamadı.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}


