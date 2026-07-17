import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiHeart, FiMapPin, FiUser, FiArrowRight } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { orderService } from '../../services/index';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency, formatDate, orderStatusLabel, orderStatusColor } from '../../utils/helpers';
import { OrderCardSkeleton } from '../../components/common/Skeleton';
import DashboardLayout from '../../components/layout/DashboardLayout';

const StatCard = ({ icon: Icon, label, value, to, color }) => (
  <Link to={to}>
    <motion.div whileHover={{ y: -3 }} className="card p-5 flex items-center gap-4 group hover:border-primary/30">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-400">{label}</p>
      </div>
      <FiArrowRight className="ml-auto text-gray-300 group-hover:text-primary transition-colors" />
    </motion.div>
  </Link>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getMyOrders({ limit: 5 })
      .then(({ data }) => setOrders(data.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <Helmet><title>Dashboard — My Bakery</title></Helmet>

      <div className="space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="section-title">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-gray-400 mt-1">Here's what's happening with your account.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={FiPackage}  label="Total Orders"    value={orders.length}         to="/dashboard/orders"    color="bg-blue-100 text-blue-500 dark:bg-blue-900/30" />
          <StatCard icon={FiHeart}    label="Wishlist Items"  value={user?.wishlist?.length || 0} to="/dashboard/wishlist"  color="bg-red-100 text-red-400 dark:bg-red-900/30" />
          <StatCard icon={FiMapPin}   label="Saved Addresses" value={user?.addresses?.length || 0} to="/dashboard/addresses" color="bg-green-100 text-green-500 dark:bg-green-900/30" />
          <StatCard icon={FiUser}     label="Profile"         value="View"                  to="/dashboard/profile"  color="bg-purple-100 text-purple-500 dark:bg-purple-900/30" />
        </div>

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-semibold text-xl text-gray-900 dark:text-white">Recent Orders</h2>
            <Link to="/dashboard/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-4">{Array(3).fill(0).map((_, i) => <OrderCardSkeleton key={i} />)}</div>
          ) : orders.length === 0 ? (
            <div className="card p-10 text-center">
              <span className="text-4xl">📦</span>
              <p className="mt-3 text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
              <Link to="/products" className="btn-primary mt-4 inline-flex">Start Shopping</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order._id} to={`/orders/${order._id}`}>
                  <motion.div whileHover={{ x: 4 }} className="card p-4 flex items-center gap-4 hover:border-primary/30">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">#{order.orderNumber}</p>
                        <span className={`badge text-xs ${orderStatusColor(order.status)}`}>{orderStatusLabel(order.status)}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{formatDate(order.createdAt)} · {order.items?.length} items</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-sm">{formatCurrency(order.totalPrice)}</p>
                      <FiArrowRight className="w-4 h-4 text-gray-300 ml-auto mt-1" />
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
