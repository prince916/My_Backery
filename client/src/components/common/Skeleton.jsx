const Skeleton = ({ className = '', count = 1 }) => {
  const items = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`skeleton ${className}`} />
  ));
  return count === 1 ? items[0] : <>{items}</>;
};

export const ProductCardSkeleton = () => (
  <div className="card overflow-hidden">
    <Skeleton className="w-full h-56" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-9 w-24 rounded-xl" />
      </div>
    </div>
  </div>
);

export const OrderCardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <div className="flex justify-between">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-4 w-24" />
  </div>
);

export default Skeleton;
