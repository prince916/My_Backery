import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiCheck, FiTruck, FiHome, FiClock } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { orderService } from '../services/index';
import { formatCurrency, formatDate, orderStatusLabel, orderStatusColor } from '../utils/helpers';
import Loader from '../components/common/Loader';

const statusSteps = [
  { key: 'pending',          icon: FiClock,    label: 'Order Placed' },
  { key: 'confirmed',        icon: FiCheck,    label: 'Confirmed' },
  { key: 'preparing',        icon: FiPackage,  label: 'Preparing' },
  { key: 'out_for_delivery', icon: FiTruck,    label: 'Out for Delivery' },
  { key: 'delivered',        icon: FiHome,     label: 'Delivered' },
];

const getStepIndex = (status) => {
  const idx = statusSteps.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
};

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order,   setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrder(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader fullPage />;
  if (!order) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <span className="text-5xl">😕</span>
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-300">Order not found</h2>
        <Link to="/dashboard/orders" className="btn-primary mt-4 inline-flex">My Orders</Link>
      </div>
    </div>
  );

  const currentStepIndex = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-dark py-8">
      <Helmet><title>Order {order.orderNumber} — My Bakery</title></Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="section-title">Order Tracking</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">#{order.orderNumber}</p>
          </div>
          <span className={`badge text-sm px-3 py-1.5 ${orderStatusColor(order.status)}`}>
            {orderStatusLabel(order.status)}
          </span>
        </div>

        {/* Progress tracker */}
        {!isCancelled && (
          <div className="card p-6 mb-6">
            <div className="flex items-start justify-between relative">
              {/* Progress line */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200 dark:bg-dark-border" style={{ margin: '0 12%' }} />
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 76}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="absolute top-6 h-0.5 bg-primary"
                style={{ left: '12%' }}
              />

              {statusSteps.map((step, i) => {
                const isCompleted = i <= currentStepIndex;
                const isCurrent   = i === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center gap-2 relative z-10 w-1/5">
                    <motion.div
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                        isCompleted
                          ? 'bg-primary border-primary text-white'
                          : 'bg-white dark:bg-dark-card border-gray-200 dark:border-dark-border text-gray-400'
                      } ${isCurrent ? 'shadow-glow scale-110' : ''}`}
                    >
                      <step.icon className="w-5 h-5" />
                    </motion.div>
                    <span className={`text-xs font-medium text-center ${isCompleted ? 'text-primary' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order details */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-dark-border overflow-hidden flex-shrink-0">
                    {item.image
                      ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-xl">🍰</div>
                    }
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{item.name}</p>
                    <p className="text-xs text-gray-400">×{item.quantity}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price summary */}
            <div className="border-t border-gray-100 dark:border-dark-border mt-4 pt-4 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{formatCurrency(order.itemsPrice)}</span></div>
              {order.discountAmount > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>-{formatCurrency(order.discountAmount)}</span></div>}
              <div className="flex justify-between text-gray-500"><span>Tax</span><span>{formatCurrency(order.taxPrice)}</span></div>
              <div className="flex justify-between text-gray-500"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : formatCurrency(order.shippingPrice)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 dark:text-white"><span>Total</span><span className="text-primary">{formatCurrency(order.totalPrice)}</span></div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Delivery Address</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {order.shippingAddress?.fullName}<br />
                {order.shippingAddress?.street}<br />
                {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}<br />
                📞 {order.shippingAddress?.phone}
              </p>
            </div>

            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Payment & Delivery</h3>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Method:</span> {order.paymentMethod?.toUpperCase()}</p>
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Status:</span> <span className={order.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'}>{order.paymentStatus}</span></p>
                <p><span className="font-medium text-gray-700 dark:text-gray-300">Placed:</span> {formatDate(order.createdAt)}</p>
                {order.deliveryDate && <p><span className="font-medium text-gray-700 dark:text-gray-300">Expected:</span> {formatDate(order.deliveryDate)}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Status history */}
        {order.statusHistory?.length > 0 && (
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status History</h3>
            <div className="space-y-3">
              {[...order.statusHistory].reverse().map((h, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? 'bg-primary' : 'bg-gray-300'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{orderStatusLabel(h.status)}</p>
                    {h.note && <p className="text-xs text-gray-400">{h.note}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(h.updatedAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
