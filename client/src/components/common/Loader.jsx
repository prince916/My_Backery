import { motion } from 'framer-motion';

const Loader = ({ fullPage = false, size = 'md', text = '' }) => {
  const sizeMap = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12', xl: 'w-16 h-16' };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
        className={`${sizeMap[size]} border-4 border-primary/20 border-t-primary rounded-full`}
      />
      {text && <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-dark/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <span className="text-5xl animate-bounce-slow">🍰</span>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full"
          />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default Loader;
