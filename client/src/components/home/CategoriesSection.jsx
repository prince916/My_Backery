import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { categoryService } from '../../services/productService';
import Skeleton from '../common/Skeleton';

const categoryEmojis = {
  cakes:     '🎂',
  pastries:  '🥐',
  breads:    '🍞',
  desserts:  '🍮',
  cookies:   '🍪',
  muffins:   '🧁',
  pies:      '🥧',
  cheesecake:'🍰',
};

const getCategoryEmoji = (slug) => {
  const key = Object.keys(categoryEmojis).find((k) => slug?.includes(k));
  return categoryEmojis[key] || '🍰';
};

export default function CategoriesSection() {
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    categoryService.getCategories()
      .then(({ data }) => setCategories(data.categories))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-secondary-50 dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest">Browse by Category</span>
          <h2 className="section-title mt-2">What Are You Craving?</h2>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
              >
                <Link
                  to={`/products?category=${cat._id}`}
                  className="group flex flex-col items-center gap-3 p-5 bg-white dark:bg-dark-card rounded-2xl shadow-card hover:shadow-card-lg border border-gray-100 dark:border-dark-border hover:border-primary/30 transition-all duration-300"
                >
                  {cat.image?.url ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden">
                      <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                      {getCategoryEmoji(cat.slug)}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                      {cat.name}
                    </p>
                    {cat.productCount !== undefined && (
                      <p className="text-xs text-gray-400 mt-0.5">{cat.productCount} items</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
