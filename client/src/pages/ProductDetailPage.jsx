import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiHeart, FiShare2, FiChevronLeft, FiMinus, FiPlus, FiCheck } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { productService } from '../services/productService';
import { reviewService } from '../services/index';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/helpers';
import StarRating from '../components/common/StarRating';
import Loader from '../components/common/Loader';
import toast from 'react-hot-toast';
import ProductCard from '../components/products/ProductCard';

export default function ProductDetailPage() {
  const { idOrSlug } = useParams();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product,   setProduct]   = useState(null);
  const [reviews,   setReviews]   = useState([]);
  const [related,   setRelated]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [quantity,  setQuantity]  = useState(1);
  const [flavor,    setFlavor]    = useState('');
  const [size,      setSize]      = useState('');
  const [adding,    setAdding]    = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    productService.getProduct(idOrSlug)
      .then(({ data }) => {
        setProduct(data.product);
        setReviews(data.reviews || []);
        if (data.product.flavors?.length > 0) setFlavor(data.product.flavors[0]);
        if (data.product.sizes?.length   > 0) setSize(data.product.sizes[0].name);
        return productService.getRelated(data.product._id);
      })
      .then(({ data }) => setRelated(data.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) { toast.error('Please login first'); return; }
    setAdding(true);
    await addToCart({ productId: product._id, quantity, flavor, size, name: product.name });
    setAdding(false);
  };

  if (loading) return <Loader fullPage />;
  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="text-6xl">😕</span>
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Product not found</h2>
        <Link to="/products" className="btn-primary mt-4 inline-flex">Back to Shop</Link>
      </div>
    </div>
  );

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const selectedSizePrice = size ? (product.sizes?.find((s) => s.name === size)?.price || 0) : 0;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark py-8">
      <Helmet>
        <title>{product.name} — My Bakery</title>
        <meta name="description" content={product.shortDesc || product.description?.slice(0, 160)} />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="text-gray-800 dark:text-gray-200 truncate max-w-xs">{product.name}</span>
        </nav>

        {/* Product detail grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-16">

          {/* Images */}
          <div className="space-y-4">
            <motion.div
              key={activeImg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square rounded-3xl overflow-hidden bg-secondary-100 dark:bg-dark-card"
            >
              {product.images?.[activeImg]?.url ? (
                <img src={product.images[activeImg].url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">🎂</div>
              )}
            </motion.div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-primary' : 'border-transparent'}`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <Link to={`/products?category=${product.category?._id}`} className="text-sm text-primary font-medium hover:underline">
                {product.category?.name}
              </Link>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 dark:text-white mt-2 leading-tight">{product.name}</h1>

              {/* Rating summary */}
              {product.ratings > 0 && (
                <div className="flex items-center gap-3 mt-3">
                  <StarRating value={product.ratings} showValue size="md" />
                  <span className="text-sm text-gray-500">({product.numReviews} reviews)</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary">{formatCurrency(effectivePrice + selectedSizePrice)}</span>
              {product.discountPrice > 0 && (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatCurrency(product.price)}</span>
                  <span className="badge bg-red-100 text-red-600">{product.discountPercent}% OFF</span>
                </>
              )}
            </div>

            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{product.description}</p>

            {/* Product details */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 dark:border-dark-border">
              {product.weight && (
                <div><span className="text-xs text-gray-400 block">Weight</span><span className="font-medium text-sm text-gray-700 dark:text-gray-300">{product.weight}</span></div>
              )}
              {product.servings && (
                <div><span className="text-xs text-gray-400 block">Servings</span><span className="font-medium text-sm text-gray-700 dark:text-gray-300">{product.servings} people</span></div>
              )}
              {product.shelf && (
                <div><span className="text-xs text-gray-400 block">Shelf Life</span><span className="font-medium text-sm text-gray-700 dark:text-gray-300">{product.shelf}</span></div>
              )}
              {product.preparationTime && (
                <div><span className="text-xs text-gray-400 block">Prep Time</span><span className="font-medium text-sm text-gray-700 dark:text-gray-300">{product.preparationTime}</span></div>
              )}
            </div>

            {/* Flavors */}
            {product.flavors?.length > 0 && (
              <div>
                <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Flavor</p>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFlavor(f)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${flavor === f ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-primary'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <p className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">Size</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((s) => (
                    <button
                      key={s.name}
                      onClick={() => setSize(s.name)}
                      className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${size === s.name ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-400 hover:border-primary'}`}
                    >
                      {s.name}
                      {s.price > 0 && <span className="ml-1 text-xs text-gray-400">+{formatCurrency(s.price)}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-0 border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(product.minOrderQty || 1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="w-10 h-10 flex items-center justify-center font-semibold text-gray-800 dark:text-gray-200">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.maxOrderQty || 20, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!product.isAvailable || adding}
                className="btn-primary flex-1 py-3 text-base"
              >
                {adding ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : product.isAvailable ? (
                  <>
                    <FiShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                ) : 'Out of Stock'}
              </button>
            </div>

            {product.allergens?.length > 0 && (
              <p className="text-xs text-gray-400">⚠️ Allergens: {product.allergens.join(', ')}</p>
            )}
          </div>
        </div>

        {/* Reviews section */}
        {reviews.length > 0 && (
          <section className="mb-16">
            <h2 className="section-title mb-6">Customer Reviews</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {reviews.map((review) => (
                <div key={review._id} className="card p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                      {review.user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-gray-900 dark:text-white">{review.user?.name}</p>
                      {review.isVerifiedPurchase && (
                        <span className="text-xs text-green-500 flex items-center gap-1"><FiCheck className="w-3 h-3" /> Verified Purchase</span>
                      )}
                    </div>
                    <StarRating value={review.rating} size="sm" className="ml-auto" />
                  </div>
                  {review.title && <p className="font-medium text-gray-800 dark:text-gray-200 text-sm mb-1">{review.title}</p>}
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <section>
            <h2 className="section-title mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
