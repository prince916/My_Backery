import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { userService } from '../../services/index';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/helpers';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const { addToCart } = useCart();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    userService.getWishlist()
      .then(({ data }) => setWishlist(data.wishlist))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    try {
      await userService.toggleWishlist(productId);
      setWishlist((prev) => prev.filter((p) => p._id !== productId));
      toast.success('Removed from wishlist');
    } catch { /* ignore */ }
  };

  const handleAddToCart = async (product) => {
    await addToCart({ productId: product._id, quantity: 1, name: product.name });
  };

  return (
    <DashboardLayout>
      <Helmet><title>Wishlist — My Bakery</title></Helmet>

      <div>
        <h1 className="section-title mb-6 flex items-center gap-2">
          <FiHeart className="text-red-400 w-7 h-7" /> My Wishlist
          {wishlist.length > 0 && <span className="text-primary text-2xl">({wishlist.length})</span>}
        </h1>

        {loading ? (
          <div className="grid sm:grid-cols-2 gap-4">
            {Array(4).fill(0).map((_, i) => <div key={i} className="card h-40 animate-pulse bg-gray-100 dark:bg-dark-border" />)}
          </div>
        ) : wishlist.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-5xl">💔</span>
            <p className="mt-4 text-gray-500 dark:text-gray-400">Your wishlist is empty</p>
            <Link to="/products" className="btn-primary mt-4 inline-flex">Discover Products</Link>
          </div>
        ) : (
          <motion.div layout className="grid sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {wishlist.map((product) => (
                <motion.div
                  key={product._id}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="card flex gap-4 p-4"
                >
                  <Link to={`/products/${product.slug || product._id}`} className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-secondary-100 dark:bg-dark-border">
                    {product.images?.[0]?.url
                      ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-2xl">🍰</div>
                    }
                  </Link>
                  <div className="flex-1">
                    <Link to={`/products/${product.slug || product._id}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm hover:text-primary transition-colors">{product.name}</h3>
                    </Link>
                    <p className="text-primary font-bold mt-1">{formatCurrency(product.effectivePrice || product.price)}</p>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary hover:text-white transition-colors"
                      >
                        <FiShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                      <button onClick={() => handleRemove(product._id)} className="p-1.5 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
