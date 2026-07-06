import { Skeleton } from './ui/skeleton';

// Lightweight skeleton components for better perceived performance

export function HomeScreenSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Skeleton */}
      <div className="wellness-green px-6 pt-12 pb-8 rounded-b-3xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Skeleton className="w-12 h-12 rounded-full bg-white/20" />
            <div>
              <Skeleton className="h-4 w-20 bg-white/20 mb-2" />
              <Skeleton className="h-6 w-32 bg-white/20" />
            </div>
          </div>
          <Skeleton className="w-8 h-8 rounded-full bg-white/20" />
        </div>
        
        <Skeleton className="h-16 w-full rounded-xl bg-white/20 mb-4" />
      </div>

      {/* Quick Stats Skeleton */}
      <div className="px-6 -mt-8 mb-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <Skeleton className="w-8 h-8 rounded-lg mb-3" />
              <Skeleton className="h-4 w-12 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Content Skeletons */}
      <div className="px-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-2" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="w-6 h-6 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProfileScreenSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <Skeleton className="w-16 h-8" />
          <Skeleton className="w-20 h-6" />
          <div className="w-16" />
        </div>

        {/* Profile Card */}
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-6">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="w-16 h-8 rounded" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <Skeleton className="w-10 h-10 rounded-full mx-auto mb-2" />
                <Skeleton className="h-4 w-8 mx-auto mb-1" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Menu Items */}
        <div className="px-6 space-y-6">
          {[1, 2, 3].map((section) => (
            <div key={section}>
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-center space-x-3 py-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-28 mb-1" />
                      <Skeleton className="h-3 w-36" />
                    </div>
                    <Skeleton className="w-4 h-4" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function MembershipScreenSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-sm mx-auto min-h-screen bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <Skeleton className="w-16 h-8" />
          <Skeleton className="w-24 h-6" />
          <div className="w-16" />
        </div>

        <div className="p-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-6 p-4 bg-gray-50 rounded-xl">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="w-12 h-6 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Plans */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div>
                      <Skeleton className="h-5 w-20 mb-1" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                  <div className="text-right">
                    <Skeleton className="h-6 w-12 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="flex items-start space-x-2">
                      <Skeleton className="w-4 h-4 mt-0.5" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  ))}
                </div>

                <Skeleton className="w-full h-12 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function PaymentScreenSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-sm mx-auto min-h-screen bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <Skeleton className="w-16 h-8" />
          <Skeleton className="w-28 h-6" />
          <div className="w-16" />
        </div>

        <div className="p-6">
          {/* Order Summary */}
          <div className="p-4 mb-6 border border-green-200 bg-green-50 rounded-xl">
            <Skeleton className="h-5 w-24 mb-3" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <Skeleton className="h-5 w-32 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="w-4 h-4 rounded-full" />
                  <div className="flex-1 flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Skeleton className="w-5 h-5" />
                      <div>
                        <Skeleton className="h-4 w-20 mb-1" />
                        <Skeleton className="h-3 w-28" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4 mb-6">
            <Skeleton className="h-12 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12 rounded-lg" />
              <Skeleton className="h-12 rounded-lg" />
            </div>
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>

          {/* Payment Button */}
          <Skeleton className="w-full h-12 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Generic loading spinner for quick loads
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} border-2 border-gray-300 border-t-green-500 rounded-full animate-spin`} />
  );
}

// Lightweight card skeleton
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="flex items-center space-x-3 mb-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  );
}

// Connection aware loading
interface SmartLoadingProps {
  isOnline: boolean;
  children: React.ReactNode;
  fallback: React.ReactNode;
}

export function SmartLoading({ isOnline, children, fallback }: SmartLoadingProps) {
  if (!isOnline) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">📡</div>
        <h3 className="text-lg font-semibold mb-2">You're Offline</h3>
        <p className="text-gray-600 mb-4">Showing cached content</p>
        {fallback}
      </div>
    );
  }

  return <>{children}</>;
}