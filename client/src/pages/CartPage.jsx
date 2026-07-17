import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowRight, FiTag } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { couponService } from '../services/index';
import { formatCurrency } from '../utils/helpers';
import { useState } from 'react';
import toast from 'react-hot-toast';

const TAX_RATE = 0.05;
const FREE_SHIPPING_MIN = 500;
const SHIPPING_COST = 50;

export default function CartPage() {
  const { cart, cartCount, subtotal, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode]     = useState('');
  const [couponData, setCouponData]     = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const taxAmount       = Math.round(subtotal * TAX_RATE * 100) / 100;
  const shippingAmount  = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_COST;
  const discountAmount  = couponData?.discountAmount || 0;
  const total           = subtotal + taxAmount + shippingAmount - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponLoading(true);
      const { data } = await couponService.validate(couponCode, subtotal);
      setCouponData(data.coupon);
      toast.success(`Coupon applied! You save ${formatCurrency(data.coupon.discountAmount)}`);
    } catch (err) {
      toast.error(err.message || 'Invalid coupon code');
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { coupon: couponData } });
  };

  if (!cart?.items?.length) return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark px-4">
      <div className="text-center">
        <span className="text-7xl">🛒</span>
        <h2 className="mt-4 text-2xl font-heading font-semibold text-gray-700 dark:text-gray-300">Your cart is empty</h2>
        <p className="text-gray-400 mt-2">Add some delicious items to get started!</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">Browse Products</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark py-8">
      <Helmet><title>Cart ({cartCount}) — My Bakery</title></Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="section-title">Your Cart <span className="text-primary">({cartCount})</span></h1>
          <button onClick={clearCart} className="text-sm text-red-400 hover:text-red-500 flex items-center gap-1 transition-colors">
            <FiTrash2 className="w-4 h-4" /> Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, scale: 0.95 }}
                  className="card flex gap-4 p-4"
                >
                  {/* Product image */}
                  <Link to={`/products/${item.product?.slug || item.product?._id}`} className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-secondary-100 dark:bg-dark-border">
                    {item.product?.images?.[0]?.url ? (
                      <img src={item.product.images[0].url} alt={item.product?.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🍰</div>
                    )}
                  </Link>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product?.slug || item.product?._id}`}>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight hover:text-primary transition-colors truncate">
                        {item.product?.name}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {item.flavor && <span className="text-xs text-gray-400 bg-gray-100 dark:bg-dark-border px-2 py-0.5 rounded-full">{item.flavor}</span>}
                      {item.size   && <span className="text-xs text-gray-400 bg-gray-100 dark:bg-dark-border px-2 py-0.5 rounded-full">{item.size}</span>}
                    </div>
                    <p className="text-primary font-bold mt-2">{formatCurrency(item.price)}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-0 border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden w-fit">
                        <button onClick={() => updateItem(item._id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
                          <FiMinus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center font-semibold text-gray-800 dark:text-gray-200 text-sm">{item.quantity}</span>
                        <button onClick={() => updateItem(item._id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-dark-border transition-colors">
                          <FiPlus className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                        </button>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-900 dark:text-white text-sm">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                        <button onClick={() => removeItem(item._id)} className="text-red-400 hover:text-red-500 transition-colors">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order summary */}
          <div>
            <div className="card p-6 sticky top-24">
              <h2 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-5">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponData(null); }}
                      className="input-field pl-9 py-2 text-sm"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-60"
                  >
                    Apply
                  </button>
                </div>
                {couponData && (
                  <p className="text-xs text-green-500 mt-1.5">✓ {couponData.description || `${couponData.discountType === 'percentage' ? couponData.discountValue + '%' : formatCurrency(couponData.discountValue)} off applied`}</p>
                )}
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal ({cartCount} items)</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Coupon Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Tax (5% GST)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Delivery</span>
                  <span>{shippingAmount === 0 ? <span className="text-green-500">FREE</span> : formatCurrency(shippingAmount)}</span>
                </div>
                {subtotal < FREE_SHIPPING_MIN && (
                  <p className="text-xs text-gray-400 bg-gray-50 dark:bg-dark-border rounded-xl p-2">
                    Add {formatCurrency(FREE_SHIPPING_MIN - subtotal)} more for free delivery!
                  </p>
                )}

                <div className="border-t border-gray-100 dark:border-dark-border pt-3 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>

              <button onClick={handleCheckout} className="btn-primary w-full mt-6 py-3 text-base group">
                Proceed to Checkout
                <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link to="/products" className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500 hover:text-primary transition-colors">
                <FiShoppingBag className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
