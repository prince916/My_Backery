import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { categoryService } from '../../services/productService';
import { adminService } from '../../services/index';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, data: null });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const fetch = async () => {
    setLoading(true);
    categoryService.getCategories().then(({ data }) => setCategories(data.categories)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const openAdd  = () => { reset({}); setImageFile(null); setModal({ open: true, data: null }); };
  const openEdit = (c) => { reset(c); setImageFile(null); setModal({ open: true, data: c }); };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => formData.append(k, v));
      if (imageFile) formData.append('image', imageFile);
      if (modal.data) {
        await categoryService.update(modal.data._id, formData);
        toast.success('Category updated');
      } else {
        await categoryService.create(formData);
        toast.success('Category created');
      }
      setModal({ open: false, data: null });
      fetch();
    } catch (err) { toast.error(err.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try { await categoryService.delete(id); toast.success('Deleted'); fetch(); } catch { /* ignore */ }
  };

  return (
    <div className="space-y-5">
      <Helmet><title>Manage Categories — Admin</title></Helmet>
      <div className="flex items-center justify-between">
        <h1 className="section-title">Categories</h1>
        <Button onClick={openAdd} size="sm"><FiPlus className="w-4 h-4" /> Add Category</Button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100 dark:bg-dark-border" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat._id} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                {cat.image?.url ? <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" /> : <span className="text-2xl">🍰</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{cat.name}</p>
                <p className="text-xs text-gray-400">{cat.productCount ?? 0} products</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-1.5 text-gray-400 hover:text-primary rounded-lg transition-colors"><FiEdit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(cat._id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition-colors"><FiTrash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modal.open} onClose={() => setModal({ open: false, data: null })} title={modal.data ? 'Edit Category' : 'Add Category'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Category Name *" placeholder="Cakes" error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <Input label="Description" placeholder="Short description..." {...register('description')} />
          <div>
            <label className="label">Category Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0])} className="input-field text-sm py-2" />
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={() => setModal({ open: false, data: null })} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={saving} className="flex-1">{modal.data ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
