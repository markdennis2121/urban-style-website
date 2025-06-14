import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, BarChart3, Package, Users, Heart, MessageSquare, Crown } from 'lucide-react';
import { useAdminData } from '@/hooks/useAdminData';
import StatsCards from '@/components/admin/StatsCards';
import OverviewTab from '@/components/admin/OverviewTab';
import SuperAdminProductManagement from '@/components/superadmin/SuperAdminProductManagement';
import UserManagement from '@/components/admin/UserManagement';
import WishlistManagement from '@/components/admin/WishlistManagement';
import MessageManagement from '@/components/admin/MessageManagement';
import WishlistAnalytics from '@/components/admin/WishlistAnalytics';

const SuperAdminDashboard = () => {
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
    deleteProduct,
    deleteWishlistItem,
    updateUser,
    deleteUser
  } = useAdminData();

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
                  </div>
                  <p className="text-xl text-amber-100">
                    Manage products, users, and system content with elevated privileges
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

          {/* Stats Cards */}
          <StatsCards 
            usersCount={users.length}
            productsCount={products.length}
            messagesCount={messages.length}
            wishlistsCount={wishlists.length}
          />

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-amber-50 data-[state=active]:text-amber-700 rounded-lg px-4 py-3 font-medium">
                <BarChart3 className="w-4 h-4 mr-2" />
                Overview
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
              <OverviewTab 
                usersCount={users.length}
                productsCount={products.length}
                messagesCount={messages.length}
                wishlistsCount={wishlists.length}
              />
            </TabsContent>

            <TabsContent value="products">
              <SuperAdminProductManagement 
                products={products}
                loading={loading}
                onProductDeleted={deleteProduct}
                onProductCreated={loadProducts}
                onProductUpdated={loadProducts}
              />
            </TabsContent>

            <TabsContent value="users">
              <UserManagement 
                users={users} 
                onUserUpdate={updateUser}
                onUserDelete={deleteUser}
              />
            </TabsContent>

            <TabsContent value="wishlists">
              <WishlistAnalytics 
                wishlists={wishlists}
                onRefresh={loadWishlistsData}
              />
            </TabsContent>

            <TabsContent value="messages">
              <MessageManagement messages={messages} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SuperAdminDashboard;
