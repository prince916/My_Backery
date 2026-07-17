import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiEye, FiStar } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/index';
import { formatCurrency, truncate } from '../../utils/helpers';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [wished, setWished] = useState(false);
  const [adding, setAdding] = useState(false);

  const effectivePrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const hasDiscount    = product.discountPrice > 0 && product.discountPrice < product.price;
  const mainImage      = product.images?.[0]?.url;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to add items to cart'); return; }
    setAdding(true);
    await addToCart({ productId: product._id, quantity: 1, name: product.name });
    setAdding(false);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to save items'); return; }
    try {
      await userService.toggleWishlist(product._id);
      setWished((p) => !p);
      toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist ❤️');
    } catch { /* ignore */ }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="card group overflow-hidden relative flex flex-col"
    >
      {/* Image */}
      <Link to={`/products/${product.slug || product._id}`} className="relative overflow-hidden block aspect-square bg-secondary-100 dark:bg-dark-border">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
            style={{ '--tw-scale-x': '1.08', '--tw-scale-y': '1.08' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">🍰</div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.isNew      && <span className="badge bg-accent text-white">New</span>}
          {product.isBestseller && <span className="badge bg-yellow-400 text-yellow-900">🔥 Hot</span>}
          {hasDiscount        && <span className="badge bg-red-500 text-white">{product.discountPercent}% OFF</span>}
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
          <button onClick={handleWishlist} className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${wished ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-red-500 hover:text-white'}`}>
            <FiHeart className={`w-4 h-4 ${wished ? 'fill-current' : ''}`} />
          </button>
          <Link to={`/products/${product.slug || product._id}`} className="w-8 h-8 rounded-full bg-white text-gray-600 hover:bg-primary hover:text-white flex items-center justify-center shadow-md transition-colors">
            <FiEye className="w-4 h-4" />
          </Link>
        </div>
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <Link to={`/products/${product.slug || product._id}`}>
          <p className="text-xs text-primary font-medium mb-1">{product.category?.name}</p>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-snug mb-1 hover:text-primary transition-colors">
            {truncate(product.name, 50)}
          </h3>
        </Link>

        {/* Rating */}
        {product.ratings > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <FiStar className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{product.ratings.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({product.numReviews})</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="font-bold text-primary text-lg">{formatCurrency(effectivePrice)}</span>
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through">{formatCurrency(product.price)}</span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!product.isAvailable || adding}
            className="flex items-center gap-1.5 px-3 py-2 bg-primary/10 text-primary rounded-xl text-xs font-semibold hover:bg-primary hover:text-white transition-all duration-200 disabled:opacity-50"
          >
            {adding ? (
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <FiShoppingCart className="w-3.5 h-3.5" />
            )}
            {product.isAvailable ? 'Add' : 'Sold Out'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
