
import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, Package, Users, Heart, MessageSquare, Crown, ShoppingCart, Wifi } from 'lucide-react';
import { useRealtimeAdminData } from '@/hooks/useRealtimeAdminData';
import { useAdminMode } from '@/contexts/AdminModeContext';
import { 
  LazyOverviewTab,
  LazyUserManagement, 
  LazyMessageManagement,
  LazyOnlineUsers
} from '@/components/admin/LazyDashboardComponents';
import SuperAdminProductManagement from '@/components/superadmin/SuperAdminProductManagement';
import WishlistAnalytics from '@/components/admin/WishlistAnalytics';
import CartManagement from '@/components/superadmin/CartManagement';

const SuperAdminDashboard = () => {
  const { isAdminMode } = useAdminMode();
  const {
    users,
    products,
    messages,
    wishlists,
    reviews,
    loading,
    error,
    loadProducts,
    loadWishlistsData,
  } = useRealtimeAdminData();

  // Simplified handlers for Super Admin
  const handleProductDeleted = async (id: string) => {
    console.log('Product deletion will trigger real-time update');
  };

  const handleUserUpdate = async (userId: string, updates: any) => {
    console.log('User update will trigger real-time update');
  };

  const handleUserDelete = async (userId: string) => {
    console.log('User deletion will trigger real-time update');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header Section */}
          <div className="mb-12">
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold">
                      Super Admin Dashboard
                    </h1>
                    <div className="bg-green-500/20 px-3 py-1 rounded-full border border-green-300">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-green-100">Real-time</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xl text-amber-100">
                    {isAdminMode 
                      ? "Managing products, users, and system content with elevated privileges, real-time updates, and collapsible data views"
                      : "Currently in Customer Mode - Switch to Admin Mode to access full dashboard features"
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert className="mb-8 bg-red-50 border-red-200 rounded-xl">
              <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {!isAdminMode && (
            <Alert className="mb-8 bg-blue-50 border-blue-200 rounded-xl">
              <AlertDescription className="text-blue-700 font-medium">
                You are currently in Customer Mode. Switch to Admin Mode using the toggle in the header to access full dashboard functionality.
              </AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 rounded-lg px-4 py-3 font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              {isAdminMode && (
                <>
                  <TabsTrigger value="online" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-lg px-4 py-3 font-medium">
                    <Wifi className="w-4 h-4 mr-2" />
                    Online Users
                  </TabsTrigger>
                  <TabsTrigger value="products" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-lg px-4 py-3 font-medium">
                    <Package className="w-4 h-4 mr-2" />
                    Products
                  </TabsTrigger>
                  <TabsTrigger value="users" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-lg px-4 py-3 font-medium">
                    <Users className="w-4 h-4 mr-2" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="carts" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg px-4 py-3 font-medium">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    User Carts
                  </TabsTrigger>
                  <TabsTrigger value="wishlists" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 rounded-lg px-4 py-3 font-medium">
                    <Heart className="w-4 w-4 mr-2" />
                    User Wishlists
                  </TabsTrigger>
                  <TabsTrigger value="messages" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-lg px-4 py-3 font-medium">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Messages
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            <TabsContent value="overview">
              <LazyOverviewTab 
                usersCount={users.length}
                productsCount={products.length}
                messagesCount={messages.length}
                wishlistsCount={wishlists.length}
              />
            </TabsContent>

            {isAdminMode && (
              <>
                <TabsContent value="online">
                  <LazyOnlineUsers />
                </TabsContent>

                <TabsContent value="products">
                  <SuperAdminProductManagement 
                    products={products}
                    loading={loading}
                    onProductDeleted={handleProductDeleted}
                    onProductCreated={loadProducts}
                    onProductUpdated={loadProducts}
                  />
                </TabsContent>

                <TabsContent value="users">
                  <LazyUserManagement />
                </TabsContent>

                <TabsContent value="carts">
                  <CartManagement />
                </TabsContent>

                <TabsContent value="wishlists">
                  <WishlistAnalytics 
                    wishlists={wishlists}
                    onRefresh={loadWishlistsData}
                  />
                </TabsContent>

                <TabsContent value="messages">
                  <LazyMessageManagement messages={messages} />
                </TabsContent>
              </>
            )}
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
