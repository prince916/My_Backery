import { FiStar } from 'react-icons/fi';

const StarRating = ({ value = 0, max = 5, onChange, size = 'md', showValue = false }) => {
  const sizeMap = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.floor(value);
        const half   = !filled && i < value;
        return (
          <button
            key={i}
            type={onChange ? 'button' : undefined}
            onClick={() => onChange && onChange(i + 1)}
            className={onChange ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          >
            <FiStar
              className={`${sizeMap[size]} transition-colors ${
                filled || half ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200 dark:fill-gray-600 dark:text-gray-600'
              }`}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="ml-1 text-sm font-medium text-gray-600 dark:text-gray-300">{value.toFixed(1)}</span>
      )}
    </div>
  );
};

export default StarRating;
