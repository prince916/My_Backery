/** Format number as currency (INR) */
export const formatCurrency = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

/** Format date in human-readable form */
export const formatDate = (date, opts = {}) =>
  new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', ...opts }).format(new Date(date));

/** Truncate text to maxLen chars */
export const truncate = (text, maxLen = 80) =>
  text?.length > maxLen ? `${text.slice(0, maxLen)}...` : text;

/** Capitalize first letter */
export const capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/** Convert order status to display label */
export const orderStatusLabel = (status) => {
  const map = {
    pending:         'Pending',
    confirmed:       'Confirmed',
    preparing:       'Preparing',
    out_for_delivery:'Out for Delivery',
    delivered:       'Delivered',
    cancelled:       'Cancelled',
  };
  return map[status] || capitalize(status);
};

/** Order status color classes */
export const orderStatusColor = (status) => {
  const map = {
    pending:         'bg-yellow-100 text-yellow-800',
    confirmed:       'bg-blue-100   text-blue-800',
    preparing:       'bg-purple-100 text-purple-800',
    out_for_delivery:'bg-orange-100 text-orange-800',
    delivered:       'bg-green-100  text-green-800',
    cancelled:       'bg-red-100    text-red-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

/** Get image placeholder when no image available */
export const getImagePlaceholder = (name = 'Product') =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=c8601a&color=fff&size=200`;

/** Debounce a function */
export const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/** Generate range of numbers (useful for pagination) */
export const range = (start, end) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);
