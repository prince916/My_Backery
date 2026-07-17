import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight } from 'react-icons/fi';
import { productService } from '../../services/productService';
import ProductCard from '../products/ProductCard';
import { ProductCardSkeleton } from '../common/Skeleton';

const tabConfig = [
  { key: 'featured',    label: 'Featured',    emoji: '⭐' },
  { key: 'bestsellers', label: 'Bestsellers',  emoji: '🔥' },
  { key: 'newArrivals', label: 'New Arrivals', emoji: '🆕' },
];

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState({ featured: [], bestsellers: [], newArrivals: [] });
  const [activeTab, setActiveTab] = useState('featured');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    productService.getFeatured()
      .then(({ data }) => setProducts({ featured: data.featured, bestsellers: data.bestsellers, newArrivals: data.newArrivals }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayProducts = products[activeTab] || [];

  return (
    <section className="py-20 bg-white dark:bg-dark-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-widest">Our Products</span>
          <h2 className="section-title mt-2">Fresh Baked Daily</h2>
          <p className="section-subtitle mx-auto">
            Handcrafted with premium ingredients, baked fresh every morning — discover our most loved creations.
          </p>
        </motion.div>

        {/* Tab pills */}
        <div className="flex items-center justify-center gap-3 mb-10 flex-wrap">
          {tabConfig.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-primary text-white shadow-card'
                  : 'bg-gray-100 dark:bg-dark-border text-gray-600 dark:text-gray-400 hover:bg-primary/10 hover:text-primary'
              }`}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : (
          <motion.div
            key={activeTab}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {displayProducts.slice(0, 8).map((product) => (
              <motion.div key={product._id} variants={itemVariants}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Link to="/products" className="btn-primary px-8 py-3 group">
            View All Products
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
