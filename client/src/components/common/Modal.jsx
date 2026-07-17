import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';

const Modal = ({ isOpen, onClose, title, children, size = 'md', className = '' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-2xl', xl: 'max-w-4xl', full: 'max-w-7xl' };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className={`relative w-full ${sizeMap[size]} bg-white dark:bg-dark-card rounded-3xl shadow-card-lg ${className}`}
            >
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 dark:border-dark-border">
                  <h2 className="text-xl font-heading font-semibold text-gray-900 dark:text-white">{title}</h2>
                  <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg" aria-label="Close">
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              )}
              {!title && (
                <button onClick={onClose} className="absolute top-4 right-4 btn-ghost p-1.5 rounded-lg z-10" aria-label="Close">
                  <FiX className="w-5 h-5" />
                </button>
              )}

              {/* Content */}
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
