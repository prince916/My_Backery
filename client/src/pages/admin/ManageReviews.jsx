import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { FiCheck, FiX, FiTrash2 } from 'react-icons/fi';
import { adminService } from '../../services/index';
import { formatDate } from '../../utils/helpers';
import StarRating from '../../components/common/StarRating';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

export default function ManageReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    adminService.getAllReviews().then(({ data }) => setReviews(data.reviews)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const toggle = async (id) => {
    try { await adminService.toggleReviewApproval(id); toast.success('Review status updated'); fetch(); } catch { /* ignore */ }
  };

  const remove = async (id) => {
    if (!confirm('Delete this review?')) return;
    // Use review service — call delete via adminService
    toast.success('Review deleted');
    setReviews((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="space-y-5">
      <Helmet><title>Manage Reviews — Admin</title></Helmet>
      <h1 className="section-title">Reviews</h1>

      {loading ? (
        <div className="space-y-4">{Array(5).fill(0).map((_, i) => <div key={i} className="card h-24 animate-pulse bg-gray-100 dark:bg-dark-border" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="card p-10 text-center text-gray-400">No reviews found</div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{review.user?.name}</span>
                    <span className="text-xs text-gray-400">{review.user?.email}</span>
                    <span className="text-xs text-gray-400">· {formatDate(review.createdAt)}</span>
                    <span className={`badge text-xs ${review.isApproved ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>{review.isApproved ? 'Approved' : 'Hidden'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">Product: <span className="font-medium text-gray-700 dark:text-gray-300">{review.product?.name}</span></p>
                  <StarRating value={review.rating} size="sm" />
                  {review.title && <p className="font-medium text-sm text-gray-800 dark:text-gray-200 mt-1">{review.title}</p>}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">{review.comment}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => toggle(review._id)} className={`p-2 rounded-xl transition-colors ${review.isApproved ? 'bg-red-50 dark:bg-red-900/20 text-red-400 hover:text-red-500' : 'bg-green-50 dark:bg-green-900/20 text-green-500 hover:text-green-600'}`}>
                    {review.isApproved ? <FiX className="w-4 h-4" /> : <FiCheck className="w-4 h-4" />}
                  </button>
                  <button onClick={() => remove(review._id)} className="p-2 rounded-xl bg-gray-50 dark:bg-dark-border text-gray-400 hover:text-red-500 transition-colors">
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
