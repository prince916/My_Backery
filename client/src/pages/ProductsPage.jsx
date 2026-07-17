import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { productService, categoryService } from '../services/productService';
import ProductCard from '../components/products/ProductCard';
import { ProductCardSkeleton } from '../components/common/Skeleton';
import Pagination from '../components/common/Pagination';
import { debounce } from '../utils/helpers';

const sortOptions = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'popular',    label: 'Most Popular' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products,    setProducts]   = useState([]);
  const [categories,  setCategories] = useState([]);
  const [loading,     setLoading]    = useState(true);
  const [totalPages,  setTotalPages] = useState(1);
  const [total,       setTotal]      = useState(0);
  const [viewMode,    setViewMode]   = useState('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filters from URL
  const page       = parseInt(searchParams.get('page'))     || 1;
  const category   = searchParams.get('category')           || '';
  const sort       = searchParams.get('sort')               || 'newest';
  const search     = searchParams.get('search')             || '';
  const minPrice   = searchParams.get('minPrice')           || '';
  const maxPrice   = searchParams.get('maxPrice')           || '';
  const rating     = searchParams.get('rating')             || '';

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) { next.set(key, value); } else { next.delete(key); }
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  // Fetch categories
  useEffect(() => {
    categoryService.getCategories()
      .then(({ data }) => setCategories(data.categories))
      .catch(() => {});
  }, []);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    productService.getProducts({ page, category, sort, search, minPrice, maxPrice, rating, limit: 12 })
      .then(({ data }) => {
        setProducts(data.products);
        setTotalPages(data.pages);
        setTotal(data.total);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [page, category, sort, search, minPrice, maxPrice, rating]);

  const handleSearch = useCallback(
    debounce((val) => updateParam('search', val), 500),
    []
  );

  const FilterPanel = () => (
    <aside className="space-y-6">
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Category</h3>
        <div className="space-y-2">
          <button
            onClick={() => updateParam('category', '')}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${!category ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'}`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => updateParam('category', cat._id)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors ${category === cat._id ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'}`}
            >
              {cat.name}
              {cat.productCount !== undefined && <span className="ml-1 text-gray-400">({cat.productCount})</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Price Range</h3>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => updateParam('minPrice', e.target.value)}
            className="input-field text-sm py-2"
          />
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => updateParam('maxPrice', e.target.value)}
            className="input-field text-sm py-2"
          />
        </div>
      </div>

      {/* Rating filter */}
      <div>
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Minimum Rating</h3>
        <div className="space-y-1">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              onClick={() => updateParam('rating', rating === String(r) ? '' : r)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-colors flex items-center gap-2 ${rating === String(r) ? 'bg-primary/10 text-primary font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'}`}
            >
              {'⭐'.repeat(r)} & above
            </button>
          ))}
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark py-8">
      <Helmet>
        <title>Shop All Products — My Bakery</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="section-title">All Products</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Showing {total} products</p>
        </div>

        <div className="flex gap-8">
          {/* Desktop filter sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="card p-5 sticky top-24">
              <FilterPanel />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    defaultValue={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="input-field pl-9 py-2 text-sm w-48 sm:w-64"
                  />
                </div>

                {/* Mobile filter button */}
                <button
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl text-sm font-medium"
                  onClick={() => setMobileFilterOpen(true)}
                >
                  <FiFilter className="w-4 h-4" />
                  Filters
                </button>
              </div>

              <div className="flex items-center gap-3">
                {/* Sort */}
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="input-field py-2 text-sm w-auto"
                >
                  {sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>

                {/* View mode */}
                <div className="hidden sm:flex items-center gap-1 bg-white dark:bg-dark-card rounded-xl p-1 border border-gray-200 dark:border-dark-border">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                    <FiGrid className="w-4 h-4" />
                  </button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                    <FiList className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Products grid */}
            {loading ? (
              <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {Array(9).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <span className="text-6xl">🍰</span>
                <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">No products found</h3>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <motion.div
                key={`${page}-${category}-${sort}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
              >
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </motion.div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => updateParam('page', p)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileFilterOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-72 bg-white dark:bg-dark-card h-full overflow-y-auto p-5"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
                <button onClick={() => setMobileFilterOpen(false)}>
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <FilterPanel />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
