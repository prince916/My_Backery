import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { adminService } from '../../services/index';
import { formatCurrency } from '../../utils/helpers';
import Loader from '../../components/common/Loader';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Analytics() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullPage />;
  if (!stats) return <div className="p-8 text-gray-400">Failed to load analytics</div>;

  const revenueData = (stats.revenueByMonth || []).map((r) => ({
    name: MONTHS[r._id.month - 1], revenue: r.revenue, orders: r.orders,
  }));

  return (
    <div className="space-y-6">
      <Helmet><title>Analytics — Admin</title></Helmet>
      <h1 className="section-title">Analytics</h1>

      {/* Revenue chart */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-dark-border" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Bar dataKey="revenue" fill="#c8601a" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Orders chart */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Orders</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-100 dark:stroke-dark-border" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Line type="monotone" dataKey="orders" stroke="#2d6a4f" strokeWidth={2.5} dot={{ fill: '#2d6a4f' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top products */}
      {stats.topProducts?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Top Selling Products</h2>
          <div className="space-y-3">
            {stats.topProducts.map((p, i) => (
              <div key={p._id} className="flex items-center gap-4">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{p.name}</p>
                  <div className="w-full bg-gray-100 dark:bg-dark-border rounded-full h-1.5 mt-1">
                    <div className="bg-primary h-1.5 rounded-full" style={{ width: `${(p.totalSold / (stats.topProducts[0]?.totalSold || 1)) * 100}%` }} />
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{p.totalSold} sold</p>
                  <p className="text-xs text-primary">{formatCurrency(p.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
