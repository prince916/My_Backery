import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiShoppingCart, FiPlus, FiMinus, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { productService } from '../services/productService';
import { formatCurrency } from '../utils/helpers';
import toast from 'react-hot-toast';

const timeSlots = ['9:00 AM - 11:00 AM', '11:00 AM - 1:00 PM', '1:00 PM - 3:00 PM', '3:00 PM - 5:00 PM', '5:00 PM - 7:00 PM'];

export default function OrderFromHerePage() {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState([]);
  const [customOrder, setCustomOrder] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState(timeSlots[0]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getProducts({ limit: 20, isAvailable: true })
      .then(({ data }) => setProducts(data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addToCustomOrder = (product) => {
    setCustomOrder((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) return prev.map((item) => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to order!`);
  };

  const updateQuantity = (id, delta) => {
    setCustomOrder((prev) =>
      prev.map((item) => item._id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)
    );
  };

  const removeItem = (id) => setCustomOrder((prev) => prev.filter((item) => item._id !== id));

  const orderTotal = customOrder.reduce((sum, item) => {
    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
    return sum + price * item.quantity;
  }, 0);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) { toast.error('Please login to place an order'); return; }
    if (customOrder.length === 0) { toast.error('Add at least one item to your order'); return; }
    if (!deliveryDate) { toast.error('Please select a delivery date'); return; }

    for (const item of customOrder) {
      await addToCart({
        productId: item._id,
        quantity:  item.quantity,
        name:      item.name,
        specialNote: specialInstructions,
      });
    }
    toast.success('Items added to cart! Proceed to checkout for delivery details.');
  };

  // Min date = tomorrow
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark py-8">
      <Helmet><title>Order From Here — My Bakery</title></Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <span className="text-6xl mb-4 block">🎂</span>
          <h1 className="section-title">Order From Here</h1>
          <p className="section-subtitle mx-auto mt-3">
            Select your items, choose your delivery date and time, and add any special instructions. We'll take care of the rest!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Products grid */}
          <div className="lg:col-span-2">
            <h2 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-5">Choose Your Items</h2>

            {loading ? (
              <div className="grid sm:grid-cols-2 gap-4">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="card h-28 animate-pulse bg-gray-100 dark:bg-dark-border" />
                ))}
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map((product) => {
                  const inOrder = customOrder.find((item) => item._id === product._id);
                  const price   = product.discountPrice > 0 ? product.discountPrice : product.price;
                  return (
                    <motion.div
                      key={product._id}
                      whileHover={{ y: -2 }}
                      className="card flex gap-4 p-4 cursor-pointer hover:border-primary/30"
                    >
                      <div className="w-16 h-16 rounded-xl bg-secondary-100 dark:bg-dark-border overflow-hidden flex-shrink-0">
                        {product.images?.[0]?.url
                          ? <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-2xl">🍰</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">{product.name}</h3>
                        <p className="text-primary font-bold text-sm mt-0.5">{formatCurrency(price)}</p>

                        {inOrder ? (
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateQuantity(product._id, -1)} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-dark-border flex items-center justify-center hover:bg-primary/10">
                              <FiMinus className="w-3 h-3" />
                            </button>
                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200 w-6 text-center">{inOrder.quantity}</span>
                            <button onClick={() => updateQuantity(product._id, 1)} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-dark-border flex items-center justify-center hover:bg-primary/10">
                              <FiPlus className="w-3 h-3" />
                            </button>
                            <button onClick={() => removeItem(product._id)} className="ml-1 text-red-400 hover:text-red-500">
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCustomOrder(product)}
                            className="mt-2 flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <FiPlus className="w-3 h-3" /> Add
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Order builder */}
          <div>
            <div className="card p-5 sticky top-24 space-y-5">
              <h2 className="font-heading font-semibold text-xl text-gray-900 dark:text-white">Your Order</h2>

              {/* Delivery date */}
              <div>
                <label className="label flex items-center gap-2"><FiCalendar className="text-primary w-4 h-4" /> Delivery Date</label>
                <input
                  type="date"
                  value={deliveryDate}
                  min={minDateStr}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Delivery time */}
              <div>
                <label className="label flex items-center gap-2"><FiClock className="text-primary w-4 h-4" /> Delivery Time</label>
                <select value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} className="input-field">
                  {timeSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                </select>
              </div>

              {/* Special instructions */}
              <div>
                <label className="label flex items-center gap-2"><FiMessageSquare className="text-primary w-4 h-4" /> Special Instructions</label>
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="E.g., 'No nuts', 'Write Happy Birthday on cake', 'Gluten-free'..."
                  rows={3}
                  className="input-field resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{specialInstructions.length}/500</p>
              </div>

              {/* Selected items */}
              {customOrder.length > 0 && (
                <div>
                  <p className="font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">Selected ({customOrder.length} items)</p>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {customOrder.map((item) => (
                      <div key={item._id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 dark:text-gray-300 truncate flex-1">{item.name} ×{item.quantity}</span>
                        <span className="text-primary font-semibold ml-2">{formatCurrency((item.discountPrice > 0 ? item.discountPrice : item.price) * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 dark:text-white border-t border-gray-100 dark:border-dark-border pt-2 mt-2">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(orderTotal)}</span>
                  </div>
                </div>
              )}

              <button onClick={handlePlaceOrder} disabled={customOrder.length === 0} className="btn-primary w-full py-3 group">
                <FiShoppingCart className="w-5 h-5" />
                Add to Cart & Checkout
              </button>

              {!isAuthenticated && (
                <p className="text-xs text-center text-gray-400">
                  <Link to="/login" className="text-primary hover:underline">Login</Link> to place an order
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
