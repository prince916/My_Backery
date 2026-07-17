import { forwardRef } from 'react';
import clsx from 'clsx';

const Input = forwardRef(({ label, error, icon: Icon, className = '', ...props }, ref) => (
  <div className="w-full">
    {label && <label className="label">{label}</label>}
    <div className="relative">
      {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />}
      <input
        ref={ref}
        className={clsx(
          'input-field',
          Icon && 'pl-10',
          error && 'border-red-400 dark:border-red-400 focus:ring-red-400/40 focus:border-red-400',
          className
        )}
        {...props}
      />
    </div>
    {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;
