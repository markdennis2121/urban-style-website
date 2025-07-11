import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

const UserManagement = lazy(() => import('./UserManagement'));

const UserManagementSkeleton = () => (
  <Card className="p-6">
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-3 w-[150px]" />
                <Skeleton className="h-3 w-[100px]" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-[60px]" />
              <Skeleton className="h-8 w-[50px]" />
              <Skeleton className="h-8 w-[60px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

const LazyUserManagement = () => (
  <Suspense fallback={<UserManagementSkeleton />}>
    <UserManagement />
  </Suspense>
);

export default LazyUserManagement;