import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function BillingLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Credits Widget Skeleton */}
      <div className="max-w-sm">
        <Card>
          <CardHeader>
            <Skeleton className="h-5 w-28" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
