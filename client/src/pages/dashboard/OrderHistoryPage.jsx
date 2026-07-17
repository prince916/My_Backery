import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPackage, FiArrowRight, FiSearch } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { orderService } from '../../services/index';
import { formatCurrency, formatDate, orderStatusLabel, orderStatusColor } from '../../utils/helpers';
import { OrderCardSkeleton } from '../../components/common/Skeleton';
import Pagination from '../../components/common/Pagination';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function OrderHistoryPage() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter,     setFilter]     = useState('');

  useEffect(() => {
    setLoading(true);
    orderService.getMyOrders({ page, limit: 10, status: filter || undefined })
      .then(({ data }) => { setOrders(data.orders); setTotalPages(data.pages); })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [page, filter]);

  const statuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

  return (
    <DashboardLayout>
      <Helmet><title>My Orders — My Bakery</title></Helmet>

      <div className="space-y-5">
        <h1 className="section-title">My Orders</h1>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setFilter(''); setPage(1); }} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${!filter ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400'}`}>
            All
          </button>
          {statuses.map((s) => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === s ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400'}`}>
              {orderStatusLabel(s)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">{Array(5).fill(0).map((_, i) => <OrderCardSkeleton key={i} />)}</div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-5xl">📦</span>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium">No orders found</p>
            <Link to="/products" className="btn-primary mt-4 inline-flex">Browse Products</Link>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order._id} to={`/orders/${order._id}`}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="card p-5 hover:border-primary/30 group"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                          <FiPackage className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge text-xs ${orderStatusColor(order.status)}`}>{orderStatusLabel(order.status)}</span>
                        <span className="font-bold text-primary">{formatCurrency(order.totalPrice)}</span>
                        <FiArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {order.items?.slice(0, 4).map((item, i) => (
                        <div key={i} className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-secondary-100 dark:bg-dark-border">
                          {item.product?.images?.[0]?.url
                            ? <img src={item.product.images[0].url} alt={item.name} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-base">🍰</div>
                          }
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 dark:bg-dark-border flex items-center justify-center text-xs font-medium text-gray-500">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>

            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
