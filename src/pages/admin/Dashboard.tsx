
import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, Package, Users, Heart, MessageSquare, Wifi } from 'lucide-react';

// Import our components and real-time hook
import { useRealtimeAdminData } from '@/hooks/useRealtimeAdminData';
import { 
  LazyOverviewTab,
  LazyProductManagement,
  LazyUserManagement, 
  LazyMessageManagement,
  LazyOnlineUsers
} from '@/components/admin/LazyDashboardComponents';
import WishlistAnalytics from '@/components/admin/WishlistAnalytics';

const AdminDashboard = () => {
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
            <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600 rounded-2xl shadow-lg p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-white/20 p-3 rounded-xl">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold">
                      Admin Dashboard
                    </h1>
                    <div className="bg-green-500/20 px-3 py-1 rounded-full border border-green-300">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs font-medium text-green-100">Real-time</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-xl text-blue-100">
                    Manage products, users, and system content with real-time updates and collapsible data views
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

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg px-4 py-3 font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
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
              <TabsTrigger value="wishlists" className="data-[state=active]:bg-pink-50 data-[state=active]:text-pink-700 rounded-lg px-4 py-3 font-medium">
                <Heart className="w-4 h-4 mr-2" />
                User Wishlists
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-lg px-4 py-3 font-medium">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <LazyOverviewTab 
                usersCount={users.length}
                productsCount={products.length}
                messagesCount={messages.length}
                wishlistsCount={wishlists.length}
              />
            </TabsContent>

            <TabsContent value="online">
              <LazyOnlineUsers />
            </TabsContent>

            <TabsContent value="products">
              <LazyProductManagement 
                products={products}
                loading={loading}
                onProductCreated={loadProducts}
              />
            </TabsContent>

            <TabsContent value="users">
              <LazyUserManagement />
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
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
