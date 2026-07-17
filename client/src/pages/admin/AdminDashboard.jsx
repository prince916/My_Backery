import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiShoppingBag, FiPackage, FiDollarSign, FiTrendingUp, FiArrowUp } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { adminService } from '../../services/index';
import { formatCurrency, formatDate, orderStatusLabel, orderStatusColor } from '../../utils/helpers';
import Loader from '../../components/common/Loader';
import { Link } from 'react-router-dom';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const COLORS  = ['#c8601a','#f59048','#2d6a4f','#60a5fa','#a78bfa'];

const StatCard = ({ title, value, subtitle, icon: Icon, trend, color }) => (
  <motion.div
    whileHover={{ y: -3 }}
    className="card p-5"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend !== undefined && (
        <span className="flex items-center gap-1 text-xs font-medium text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
          <FiArrowUp className="w-3 h-3" /> {trend}%
        </span>
      )}
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{title}</p>
    {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
  </motion.div>
);

export default function AdminDashboard() {
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;
  if (!stats)  return <div className="p-8 text-gray-500">Failed to load dashboard</div>;

  const revenueData = (stats.revenueByMonth || []).map((r) => ({
    name:    MONTHS[r._id.month - 1],
    revenue: r.revenue,
    orders:  r.orders,
  }));

  const orderStatusData = (stats.ordersByStatus || []).map((s, i) => ({
    name:  orderStatusLabel(s._id),
    value: s.count,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      <Helmet><title>Admin Dashboard — My Bakery</title></Helmet>

      <div>
        <h1 className="section-title">Dashboard Overview</h1>
        <p className="text-gray-400 mt-1">Welcome back, Admin!</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Revenue"  value={formatCurrency(stats.stats.totalRevenue)} subtitle="All time" icon={FiDollarSign} color="bg-orange-100 text-orange-500 dark:bg-orange-900/30" trend={12} />
        <StatCard title="Total Orders"   value={stats.stats.totalOrders}    subtitle={`${stats.stats.newOrders30d} this month`} icon={FiPackage}    color="bg-blue-100 text-blue-500 dark:bg-blue-900/30" trend={8} />
        <StatCard title="Total Users"    value={stats.stats.totalUsers}     subtitle={`${stats.stats.newUsers30d} new this month`} icon={FiUsers}    color="bg-purple-100 text-purple-500 dark:bg-purple-900/30" trend={5} />
        <StatCard title="Total Products" value={stats.stats.totalProducts}  subtitle="Active listings"  icon={FiShoppingBag} color="bg-green-100 text-green-500 dark:bg-green-900/30" />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue This Year</h2>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c8601a" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#c8601a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-dark-border" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} className="fill-gray-400" />
              <YAxis tick={{ fontSize: 12 }} className="fill-gray-400" tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="revenue" stroke="#c8601a" strokeWidth={2.5} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by status */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {orderStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-3 space-y-1">
            {orderStatusData.map((s) => (
              <div key={s.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{s.name}</span>
                </div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/admin/products',    label: 'Manage Products',    emoji: '🛍️' },
          { to: '/admin/orders',      label: 'Manage Orders',      emoji: '📦' },
          { to: '/admin/users',       label: 'Manage Users',       emoji: '👥' },
          { to: '/admin/analytics',   label: 'Analytics',          emoji: '📊' },
        ].map((link) => (
          <Link key={link.to} to={link.to}>
            <div className="card p-4 flex items-center gap-3 hover:border-primary/30 transition-all group">
              <span className="text-2xl group-hover:scale-110 transition-transform">{link.emoji}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">{link.label}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary hover:underline">View All</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-gray-100 dark:border-dark-border">
                <th className="pb-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Order</th>
                <th className="pb-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Customer</th>
                <th className="pb-3 text-xs font-medium text-gray-400 uppercase tracking-wide">Status</th>
                <th className="pb-3 text-xs font-medium text-gray-400 uppercase tracking-wide text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {(stats.recentOrders || []).map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-border/50 transition-colors">
                  <td className="py-3">
                    <Link to={`/admin/orders`} className="font-medium text-gray-900 dark:text-white hover:text-primary text-xs">#{order.orderNumber}</Link>
                    <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </td>
                  <td className="py-3 text-gray-600 dark:text-gray-400 text-xs">{order.user?.name || 'Guest'}</td>
                  <td className="py-3">
                    <span className={`badge text-xs ${orderStatusColor(order.status)}`}>{orderStatusLabel(order.status)}</span>
                  </td>
                  <td className="py-3 text-right font-semibold text-primary text-xs">{formatCurrency(order.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
