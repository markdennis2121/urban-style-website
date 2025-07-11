import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

// Lazy load dashboard components
const OverviewTab = lazy(() => import('./OverviewTab'));
const ProductManagement = lazy(() => import('./ProductManagement')); 
const UserManagementComponent = lazy(() => import('./LazyUserManagement'));
const MessageManagement = lazy(() => import('./MessageManagement'));
const WishlistManagement = lazy(() => import('./WishlistManagement'));
const OnlineUsers = lazy(() => import('./OnlineUsers'));

// Loading skeleton components
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-8 w-[60px]" />
          </div>
        </Card>
      ))}
    </div>
    <Card className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-[200px]" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    </Card>
  </div>
);

const TableSkeleton = () => (
  <Card className="p-6">
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  </Card>
);

const ListSkeleton = () => (
  <Card className="p-6">
    <div className="space-y-4">
      <Skeleton className="h-6 w-[200px]" />
      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </Card>
);

// Lazy component wrappers with data fetching
export const LazyOverviewTab = ({ usersCount, productsCount, messagesCount, wishlistsCount }: {
  usersCount: number;
  productsCount: number; 
  messagesCount: number;
  wishlistsCount: number;
}) => (
  <Suspense fallback={<DashboardSkeleton />}>
    <OverviewTab 
      usersCount={usersCount}
      productsCount={productsCount}
      messagesCount={messagesCount}
      wishlistsCount={wishlistsCount}
    />
  </Suspense>
);

export const LazyProductManagement = ({ products, loading, onProductCreated }: {
  products: any[];
  loading: boolean;
  onProductCreated: () => void;
}) => (
  <Suspense fallback={<TableSkeleton />}>
    <ProductManagement 
      products={products}
      loading={loading}
      onProductCreated={onProductCreated}
    />
  </Suspense>
);

export const LazyUserManagement = () => (
  <Suspense fallback={<TableSkeleton />}>
    <UserManagementComponent />
  </Suspense>
);

export const LazyMessageManagement = ({ messages }: { messages: any[] }) => (
  <Suspense fallback={<TableSkeleton />}>
    <MessageManagement messages={messages} />
  </Suspense>
);

export const LazyWishlistManagement = ({ wishlists, onRefresh, onDelete }: {
  wishlists: any[];
  onRefresh: () => void;
  onDelete: (id: string) => void;
}) => (
  <Suspense fallback={<TableSkeleton />}>
    <WishlistManagement 
      wishlists={wishlists}
      onRefresh={onRefresh}
      onDelete={onDelete}
    />
  </Suspense>
);

export const LazyOnlineUsers = () => (
  <Suspense fallback={<ListSkeleton />}>
    <OnlineUsers />
  </Suspense>
);