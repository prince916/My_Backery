import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiHome } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark px-4">
      <Helmet>
        <title>404 — Page Not Found | My Bakery</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* Animated 404 */}
        <motion.div
          animate={{ rotate: [0, -5, 5, -5, 5, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
          className="text-8xl mb-6"
        >
          🍰
        </motion.div>

        <h1 className="text-8xl font-heading font-bold text-gradient mb-2">404</h1>
        <h2 className="text-2xl font-heading font-semibold text-gray-800 dark:text-white mb-3">
          This page got eaten!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
          Looks like the page you're looking for doesn't exist or has been moved. Let's get you back to the bakery!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn-outline flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link to="/" className="btn-primary flex items-center gap-2">
            <FiHome className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Floating treats */}
        {['🧁', '🥐', '🍩', '🍪'].map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-3xl pointer-events-none select-none opacity-20"
            style={{ top: `${15 + i * 20}%`, left: i % 2 === 0 ? '5%' : '88%' }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.5 }}
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
