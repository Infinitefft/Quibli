import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const theme = {
  baseColor: '#e5e7eb',
  highlightColor: '#f3f4f6',
};

function PostRowSkeleton() {
  return (
    <div className="bg-white mb-[12px] p-6 w-full">
      <div className="flex items-center mb-3 space-x-2">
        <Skeleton circle width={24} height={24} />
        <Skeleton width={96} height={16} />
        <Skeleton width={56} height={12} />
      </div>
      <Skeleton className="mb-2" height={18} width="85%" />
      <Skeleton className="mb-2" height={18} width="55%" />
      <Skeleton className="mb-1.5" height={16} width="100%" />
      <Skeleton className="mb-4" height={16} width="90%" />
      <div className="flex gap-2 mb-5">
        <Skeleton width={48} height={20} borderRadius={4} />
        <Skeleton width={56} height={20} borderRadius={4} />
        <Skeleton width={40} height={20} borderRadius={4} />
      </div>
      <div className="flex items-center space-x-8 border-t border-gray-50 pt-4">
        <Skeleton width={56} height={20} />
        <Skeleton width={56} height={20} />
        <Skeleton width={48} height={20} />
      </div>
    </div>
  );
}

function QuestionRowSkeleton() {
  return (
    <div className="bg-white mb-2 p-6 border-b border-gray-50">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3 flex-1 mr-4 min-w-0">
          <Skeleton circle width={44} height={44} />
          <div className="flex flex-col gap-2 min-w-0">
            <Skeleton width={112} height={16} />
            <Skeleton width={64} height={12} />
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Skeleton width={48} height={20} borderRadius={4} />
          <Skeleton width={56} height={20} borderRadius={4} />
        </div>
      </div>
      <div className="mb-6 space-y-2">
        <Skeleton height={18} width="100%" />
        <Skeleton height={18} width="70%" />
      </div>
      <div className="flex items-center space-x-8">
        <Skeleton width={96} height={20} />
        <Skeleton width={80} height={20} />
        <Skeleton width={64} height={20} />
      </div>
    </div>
  );
}

type HomeFeedSkeletonProps = {
  variant: 'posts' | 'questions';
  rows?: number;
};

export function HomeFeedSkeleton({ variant, rows = 5 }: HomeFeedSkeletonProps) {
  const Row = variant === 'posts' ? PostRowSkeleton : QuestionRowSkeleton;
  return (
    <SkeletonTheme {...theme}>
      <div className="pb-4 bg-gray-50 w-full px-0">
        {Array.from({ length: rows }, (_, i) => (
          <Row key={i} />
        ))}
      </div>
    </SkeletonTheme>
  );
}
