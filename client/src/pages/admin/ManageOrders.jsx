import { useState, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { orderService } from '../../services/index';
import { formatCurrency, formatDate, orderStatusLabel, orderStatusColor } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const STATUS_OPTIONS = ['confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

export default function ManageOrders() {
  const [orders,     setOrders]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [statusModal, setStatusModal]   = useState({ open: false, order: null });
  const [newStatus, setNewStatus]       = useState('');
  const [statusNote, setStatusNote]     = useState('');
  const [updating, setUpdating]         = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await orderService.getAllOrders({ page, status: statusFilter || undefined, limit: 20 });
      setOrders(data.orders);
      setTotalPages(data.pages);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, statusFilter]);

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    try {
      setUpdating(true);
      await orderService.updateOrderStatus(statusModal.order._id, newStatus, statusNote);
      toast.success('Order status updated');
      setStatusModal({ open: false, order: null });
      fetchOrders();
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-5">
      <Helmet><title>Manage Orders — Admin</title></Helmet>
      <h1 className="section-title">Orders</h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => { setStatusFilter(''); setPage(1); }} className={`px-3 py-1.5 rounded-full text-xs font-medium ${!statusFilter ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400'}`}>All</button>
        {['pending','confirmed','preparing','out_for_delivery','delivered','cancelled'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusFilter === s ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400'}`}>
            {orderStatusLabel(s)}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-border">
              <tr>
                {['Order','Customer','Date','Items','Total','Status','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-dark-border rounded animate-pulse" /></td>)}</tr>
                ))
              ) : orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-border/30">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white text-xs">#{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">{order.user?.name}<br /><span className="text-gray-400">{order.user?.email}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{order.items?.length}</td>
                  <td className="px-4 py-3 font-bold text-primary">{formatCurrency(order.totalPrice)}</td>
                  <td className="px-4 py-3"><span className={`badge text-xs ${orderStatusColor(order.status)}`}>{orderStatusLabel(order.status)}</span></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => { setStatusModal({ open: true, order }); setNewStatus(order.status); setStatusNote(''); }}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Update Status
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Status update modal */}
      <Modal isOpen={statusModal.open} onClose={() => setStatusModal({ open: false, order: null })} title="Update Order Status" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Order #{statusModal.order?.orderNumber}</p>
          <div>
            <label className="label">New Status</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input-field">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{orderStatusLabel(s)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Note (optional)</label>
            <input type="text" placeholder="Status note for customer..." value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)} className="input-field" />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setStatusModal({ open: false, order: null })} className="flex-1">Cancel</Button>
            <Button onClick={handleStatusUpdate} isLoading={updating} className="flex-1">Update</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
