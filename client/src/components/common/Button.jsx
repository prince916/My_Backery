import clsx from 'clsx';

const Button = ({
  children,
  variant  = 'primary',
  size     = 'md',
  isLoading = false,
  disabled  = false,
  className = '',
  type      = 'button',
  ...props
}) => {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary/50 shadow-card hover:shadow-card-lg',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary/50',
    ghost:   'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-border focus:ring-gray-300',
    danger:  'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    success: 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-400',
  };

  const sizes = {
    sm:  'px-3 py-1.5 text-sm',
    md:  'px-5 py-2.5 text-sm',
    lg:  'px-7 py-3 text-base',
    xl:  'px-9 py-4 text-lg',
    icon:'p-2.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
