'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';

import { Search, Package, Loader2, X } from 'lucide-react';
import Button from '@/components/ui/button/Button';
import Navbar from '@/components/Navbar';
import TopBar from '@/components/TopBar';
import { useDebounce } from '@/hooks/useDebounce';

interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  items: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Debounce search query with 500ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const fetchProducts = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const url = new URL('/api/products', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('limit', '12');
      if (search.trim()) {
        url.searchParams.set('q', search.trim());
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.items);
      setCurrentPage(data.pagination.page);
      setTotalPages(data.pagination.totalPages);
      setTotalProducts(data.pagination.total);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, debouncedSearchQuery);
  }, [currentPage, debouncedSearchQuery]);

  // Reset to first page when search query changes
  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) return; // Only reset on debounced value change
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4  py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          </div>
          <p className="text-gray-600">
            Browse our collection of products. Login to place orders.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {loading && debouncedSearchQuery !== searchQuery && (
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Searching...</span>
              </div>
            )}
          </div>
        </div>

        {/* Results Summary */}
        {!loading && !error && (
          <div className="mb-6">
            <p className="text-gray-600">
              {totalProducts > 0 ? (
                <>
                  Showing {products.length} of {totalProducts} product
                  {totalProducts !== 1 ? 's' : ''}
                  {debouncedSearchQuery && (
                    <span> for "{debouncedSearchQuery}"</span>
                  )}
                </>
              ) : (
                <>
                  No products found
                  {debouncedSearchQuery && (
                    <span> for "{debouncedSearchQuery}"</span>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading products...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <Package className="h-12 w-12 mx-auto mb-2" />
              <p className="text-lg font-medium">Oops! Something went wrong</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button
              variant="primary"
              onClick={() => fetchProducts(currentPage, searchQuery)}
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-4">
              {debouncedSearchQuery
                ? 'Try adjusting your search terms'
                : 'No products are currently available'}
            </p>
            {debouncedSearchQuery && (
              <Button variant="outline" onClick={clearSearch}>
                Clear Search
              </Button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
