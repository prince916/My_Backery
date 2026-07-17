import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { couponService } from '../../services/index';
import { formatDate } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function ManageCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState({ open: false, data: null });
  const [saving, setSaving]   = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetch = async () => {
    setLoading(true);
    couponService.getAll().then(({ data }) => setCoupons(data.coupons)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openAdd  = () => { reset({ discountType: 'percentage', userUsageLimit: 1 }); setModal({ open: true, data: null }); };
  const openEdit = (c) => { reset(c); setModal({ open: true, data: c }); };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      if (modal.data) { await couponService.update(modal.data._id, data); toast.success('Coupon updated'); }
      else             { await couponService.create(data);               toast.success('Coupon created'); }
      setModal({ open: false, data: null });
      fetch();
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete coupon?')) return;
    try { await couponService.delete(id); toast.success('Deleted'); fetch(); } catch { /* ignore */ }
  };

  return (
    <div className="space-y-5">
      <Helmet><title>Manage Coupons — Admin</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="section-title">Coupons</h1>
        <Button onClick={openAdd} size="sm"><FiPlus className="w-4 h-4" /> Add Coupon</Button>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-border">
              <tr>{['Code','Type','Value','Min Order','Used','Valid Until','Actions'].map((h) => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {loading ? Array(5).fill(0).map((_, i) => <tr key={i}>{Array(7).fill(0).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-dark-border rounded animate-pulse" /></td>)}</tr>)
              : coupons.map((c) => (
                <tr key={c._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-border/30">
                  <td className="px-4 py-3 font-mono font-bold text-primary text-sm">{c.code}</td>
                  <td className="px-4 py-3 capitalize text-gray-600 dark:text-gray-400 text-xs">{c.discountType}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200">{c.discountType === 'percentage' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">₹{c.minOrderAmount}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{formatDate(c.validTo)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg"><FiTrash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} title={modal.data ? 'Edit Coupon' : 'Create Coupon'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Coupon Code *" placeholder="SAVE20" error={errors.code?.message} {...register('code', { required: 'Required' })} />
            <div>
              <label className="label">Discount Type *</label>
              <select {...register('discountType')} className="input-field">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Discount Value *" type="number" placeholder="20" error={errors.discountValue?.message} {...register('discountValue', { required: 'Required', min: 0 })} />
            <Input label="Min Order Amount (₹)" type="number" placeholder="500" {...register('minOrderAmount')} />
          </div>
          <Input label="Description" placeholder="20% off on all cakes" {...register('description')} />
          <div className="grid sm:grid-cols-2 gap-4">
            <div><label className="label">Valid From *</label><input type="date" {...register('validFrom', { required: 'Required' })} className="input-field" /></div>
            <div><label className="label">Valid To *</label><input type="date" {...register('validTo', { required: 'Required' })} className="input-field" /></div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Usage Limit (blank = unlimited)" type="number" placeholder="100" {...register('usageLimit')} />
            <Input label="Per User Limit" type="number" placeholder="1" {...register('userUsageLimit')} />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setModal({ open: false, data: null })} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={saving} className="flex-1">{modal.data ? 'Update' : 'Create'} Coupon</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
