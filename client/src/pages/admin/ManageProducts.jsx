import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { productService, categoryService } from '../../services/productService';
import { formatCurrency } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Modal from '../../components/common/Modal';
import Pagination from '../../components/common/Pagination';
import toast from 'react-hot-toast';

const ProductForm = ({ defaultValues, categories, onSave, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState(defaultValues?.images?.map((i) => i.url) || []);

  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== '') formData.append(k, v); });
    imageFiles.forEach((f) => formData.append('images', f));
    await onSave(formData, defaultValues?._id);
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Image upload */}
      <div>
        <label className="label">Product Images</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {previews.map((p, i) => <img key={i} src={p} alt="" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />)}
        </div>
        <label className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-200 dark:border-dark-border rounded-xl cursor-pointer hover:border-primary transition-colors text-sm text-gray-500">
          <FiImage className="w-4 h-4" /> Upload Images
          <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
        </label>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Product Name *" placeholder="Classic Chocolate Cake" error={errors.name?.message}
          {...register('name', { required: 'Required' })} />
        <div>
          <label className="label">Category *</label>
          <select {...register('category', { required: 'Required' })} className="input-field">
            <option value="">Select category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Description *</label>
        <textarea {...register('description', { required: 'Required' })} rows={3} className="input-field resize-none" placeholder="Product description..." />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <Input label="Price (₹) *" type="number" placeholder="599" error={errors.price?.message} {...register('price', { required: 'Required', min: 0 })} />
        <Input label="Discount Price (₹)" type="number" placeholder="499" {...register('discountPrice')} />
        <Input label="Stock" type="number" placeholder="100" {...register('stock')} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input label="Weight" placeholder="500g" {...register('weight')} />
        <Input label="Servings" type="number" placeholder="4" {...register('servings')} />
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-4">
        {[
          { name: 'isFeatured',   label: 'Featured' },
          { name: 'isBestseller', label: 'Bestseller' },
          { name: 'isNew',        label: 'New Arrival' },
          { name: 'customizable', label: 'Customizable' },
        ].map((f) => (
          <label key={f.name} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input type="checkbox" {...register(f.name)} className="w-4 h-4 accent-primary" />
            {f.label}
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
        <Button type="submit" isLoading={isLoading} className="flex-1">
          {defaultValues ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
};

export default function ManageProducts() {
  const [products,    setProducts]    = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);
  const [search,      setSearch]      = useState('');
  const [modalOpen,   setModalOpen]   = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        productService.getProducts({ page, search, limit: 15 }),
        categoryService.getCategories(),
      ]);
      setProducts(prodRes.data.products);
      setTotalPages(prodRes.data.pages);
      setCategories(catRes.data.categories);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  const handleSave = async (formData, id) => {
    try {
      if (id) {
        await productService.updateProduct(id, formData);
        toast.success('Product updated');
      } else {
        await productService.createProduct(formData);
        toast.success('Product created');
      }
      setModalOpen(false);
      setEditProduct(null);
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productService.deleteProduct(id);
      toast.success('Product deleted');
      fetchData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-5">
      <Helmet><title>Manage Products — Admin</title></Helmet>

      <div className="flex items-center justify-between">
        <h1 className="section-title">Products</h1>
        <Button onClick={() => { setEditProduct(null); setModalOpen(true); }} size="sm">
          <FiPlus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" placeholder="Search products..." value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="input-field pl-9 py-2 text-sm" />
      </div>

      {/* Products table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-dark-border">
              <tr>
                {['Product','Category','Price','Stock','Status','Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-dark-border">
              {loading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i}>
                    {Array(6).fill(0).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 dark:bg-dark-border rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : products.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/50 dark:hover:bg-dark-border/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-secondary-100 dark:bg-dark-border flex-shrink-0">
                        {p.images?.[0]?.url
                          ? <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-lg">🍰</div>
                        }
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white max-w-[160px] truncate">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{p.category?.name}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{formatCurrency(p.discountPrice || p.price)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.stock}</td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${p.isAvailable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      {p.isAvailable ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setEditProduct(p); setModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(p._id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditProduct(null); }} title={editProduct ? 'Edit Product' : 'Add New Product'} size="lg">
        <ProductForm defaultValues={editProduct} categories={categories} onSave={handleSave} onClose={() => { setModalOpen(false); setEditProduct(null); }} />
      </Modal>
    </div>
  );
}
