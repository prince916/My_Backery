import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiCheck } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { userService } from '../../services/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast from 'react-hot-toast';

const AddressForm = ({ defaultValues, onSave, onClose }) => {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: defaultValues || { country: 'India' } });
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data) => {
    setIsLoading(true);
    await onSave(data);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Full Name" placeholder="Priya Sharma" error={errors.fullName?.message}
          {...register('fullName', { required: 'Required' })} />
        <Input label="Phone" placeholder="+91 98765 43210" error={errors.phone?.message}
          {...register('phone', { required: 'Required' })} />
      </div>
      <Input label="Label (e.g., Home, Office)" placeholder="Home" {...register('label')} />
      <Input label="Street Address" placeholder="123, MG Road" error={errors.street?.message}
        {...register('street', { required: 'Required' })} />
      <div className="grid sm:grid-cols-3 gap-4">
        <Input label="City" placeholder="Mumbai" error={errors.city?.message} {...register('city', { required: 'Required' })} />
        <Input label="State" placeholder="Maharashtra" error={errors.state?.message} {...register('state', { required: 'Required' })} />
        <Input label="Pincode" placeholder="400001" error={errors.pincode?.message} {...register('pincode', { required: 'Required' })} />
      </div>
      <div className="flex items-center gap-2 mt-1">
        <input type="checkbox" id="isDefault" {...register('isDefault')} className="w-4 h-4 accent-primary" />
        <label htmlFor="isDefault" className="text-sm text-gray-600 dark:text-gray-400">Set as default address</label>
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" isLoading={isLoading} className="flex-1">Save Address</Button>
      </div>
    </form>
  );
};

export default function AddressesPage() {
  const [addresses,  setAddresses]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editAddr,   setEditAddr]   = useState(null);

  useEffect(() => {
    userService.getAddresses()
      .then(({ data }) => setAddresses(data.addresses))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (data) => {
    try {
      if (editAddr) {
        const { data: res } = await userService.updateAddress(editAddr._id, data);
        setAddresses(res.addresses);
        toast.success('Address updated');
      } else {
        const { data: res } = await userService.addAddress(data);
        setAddresses(res.addresses);
        toast.success('Address added');
      }
      setModalOpen(false);
      setEditAddr(null);
    } catch (err) {
      toast.error(err.message || 'Failed to save address');
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await userService.deleteAddress(id);
      setAddresses(data.addresses);
      toast.success('Address deleted');
    } catch { /* ignore */ }
  };

  const openEdit = (addr) => { setEditAddr(addr); setModalOpen(true); };
  const openAdd  = () => { setEditAddr(null); setModalOpen(true); };

  return (
    <DashboardLayout>
      <Helmet><title>My Addresses — My Bakery</title></Helmet>

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="section-title flex items-center gap-2"><FiMapPin className="text-primary" />Addresses</h1>
          <Button onClick={openAdd} size="sm">
            <FiPlus className="w-4 h-4" /> Add New
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">{Array(2).fill(0).map((_, i) => <div key={i} className="card h-32 animate-pulse bg-gray-100 dark:bg-dark-border" />)}</div>
        ) : addresses.length === 0 ? (
          <div className="card p-12 text-center">
            <span className="text-5xl">📍</span>
            <p className="mt-4 text-gray-500 dark:text-gray-400">No saved addresses yet</p>
            <Button onClick={openAdd} className="mt-4 inline-flex"><FiPlus className="w-4 h-4" /> Add Address</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {addresses.map((addr) => (
                <motion.div
                  key={addr._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card p-5 relative"
                >
                  {addr.isDefault && (
                    <span className="absolute top-3 right-3 flex items-center gap-1 text-xs text-green-500 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                      <FiCheck className="w-3 h-3" /> Default
                    </span>
                  )}
                  {addr.label && <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">{addr.label}</p>}
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{addr.fullName}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {addr.street}, {addr.city}<br />
                    {addr.state} - {addr.pincode}<br />
                    📞 {addr.phone}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => openEdit(addr)} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-primary transition-colors px-3 py-1.5 bg-gray-100 dark:bg-dark-border rounded-lg">
                      <FiEdit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button onClick={() => handleDelete(addr._id)} className="flex items-center gap-1 text-xs text-red-400 hover:text-red-500 transition-colors px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <FiTrash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditAddr(null); }} title={editAddr ? 'Edit Address' : 'Add New Address'}>
          <AddressForm defaultValues={editAddr} onSave={handleSave} onClose={() => { setModalOpen(false); setEditAddr(null); }} />
        </Modal>
      </div>
    </DashboardLayout>
  );
}
