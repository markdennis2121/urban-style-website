import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Package, 
  MessageSquare, 
  PlusCircle, 
  Trash2,
  Heart,
  Star,
  Activity,
  TrendingUp,
  BarChart3,
  Upload,
  Edit,
  User,
  Calendar,
  Mail
} from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [wishlists, setWishlists] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  // Product form state
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    price: '',
    description: '',
    category: '',
    stock: '',
    image: ''
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUsers(),
        loadProducts(),
        loadMessages(),
        loadWishlists(),
        loadReviews()
      ]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'user')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading products:', err);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Messages table not accessible, using empty array');
        setMessages([]);
        return;
      }
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    }
  };

  const loadWishlists = async () => {
    try {
      console.log('Admin loading wishlists...');
      
      // First, get all wishlists
      const { data: wishlistsData, error: wishlistsError } = await supabase
        .from('wishlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (wishlistsError) {
        console.error('Error loading wishlists:', wishlistsError);
        setWishlists([]);
        return;
      }

      console.log('Raw wishlist data:', wishlistsData);

      if (!wishlistsData || wishlistsData.length === 0) {
        console.log('No wishlist data found');
        setWishlists([]);
        return;
      }

      // Get unique user IDs
      const userIds = [...new Set(wishlistsData.map(w => w.user_id))];
      console.log('User IDs from wishlists:', userIds);

      // Get user profiles for these user IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, email')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        // Still show wishlists even if profiles fail
        setWishlists(wishlistsData);
        return;
      }

      console.log('Profiles data:', profilesData);

      // Combine wishlist data with profile data
      const enrichedWishlists = wishlistsData.map(wishlist => ({
        ...wishlist,
        profiles: profilesData?.find(p => p.id === wishlist.user_id) || null
      }));

      console.log('Enriched wishlists:', enrichedWishlists);
      setWishlists(enrichedWishlists);

    } catch (err) {
      console.error('Error in loadWishlists:', err);
      setWishlists([]);
    }
  };

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id (username, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Reviews table not accessible, using empty array');
        setReviews([]);
        return;
      }
      setReviews(data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
      setReviews([]);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productForm.name,
          brand: productForm.brand,
          price: parseFloat(productForm.price),
          description: productForm.description,
          category: productForm.category,
          stock: parseInt(productForm.stock),
          image: productForm.image || '/placeholder.svg'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Product created successfully.",
      });

      // Reset form
      setProductForm({
        name: '',
        brand: '',
        price: '',
        description: '',
        category: '',
        stock: '',
        image: ''
      });

      // Reload products
      loadProducts();
    } catch (err) {
      console.error('Error creating product:', err);
      toast({
        title: "Error",
        description: "Failed to create product.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Product deleted successfully.",
      });

      loadProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: "Error",
        description: "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Contact message deleted successfully.",
      });

      loadMessages();
    } catch (err) {
      console.error('Error deleting message:', err);
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive",
      });
    }
  };

  const deleteWishlistItem = async (wishlistId) => {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Wishlist item deleted successfully.",
      });

      loadWishlists();
    } catch (err) {
      console.error('Error deleting wishlist item:', err);
      toast({
        title: "Error",
        description: "Failed to delete wishlist item.",
        variant: "destructive",
      });
    }
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
                  </div>
                  <p className="text-xl text-blue-100">
                    Manage products, users, and system content
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white rounded-xl shadow-lg border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{users.length}</div>
                <p className="text-blue-100">Total Users</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white rounded-xl shadow-lg border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">Inventory</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{products.length}</div>
                <p className="text-purple-100">Products</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 via-green-600 to-green-700 text-white rounded-xl shadow-lg border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">Support</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{messages.length}</div>
                <p className="text-green-100">Messages</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 text-white rounded-xl shadow-lg border-0">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30">Engagement</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{wishlists.length}</div>
                <p className="text-pink-100">Wishlist Items</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-8">
            <TabsList className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg px-4 py-3 font-medium">
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
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    Overview
                  </CardTitle>
                  <CardDescription className="text-gray-600">Key performance indicators and analytics</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Total Users</p>
                          <p className="text-sm text-gray-600">{users.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="bg-green-100 p-3 rounded-full">
                          <Package className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Total Products</p>
                          <p className="text-sm text-green-600">{products.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="bg-orange-100 p-3 rounded-full">
                          <MessageSquare className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Total Messages</p>
                          <p className="text-sm text-orange-600">{messages.length}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="bg-purple-100 p-3 rounded-full">
                          <Heart className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Total Wishlists</p>
                          <p className="text-sm text-purple-600">{wishlists.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <div className="space-y-8">
                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <PlusCircle className="h-5 w-5 text-white" />
                      </div>
                      Add New Product
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <form onSubmit={handleCreateProduct} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700">Product Name</Label>
                          <Input
                            id="name"
                            value={productForm.name}
                            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                            className="mt-1 rounded-lg border-gray-300"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="brand" className="text-sm font-medium text-gray-700">Brand</Label>
                          <Input
                            id="brand"
                            value={productForm.brand}
                            onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                            className="mt-1 rounded-lg border-gray-300"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="price" className="text-sm font-medium text-gray-700">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                            className="mt-1 rounded-lg border-gray-300"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="stock" className="text-sm font-medium text-gray-700">Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={productForm.stock}
                            onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                            className="mt-1 rounded-lg border-gray-300"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category" className="text-sm font-medium text-gray-700">Category</Label>
                          <Select onValueChange={(value) => setProductForm({...productForm, category: value})}>
                            <SelectTrigger className="mt-1 rounded-lg border-gray-300">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="electronics">Electronics</SelectItem>
                              <SelectItem value="clothing">Clothing</SelectItem>
                              <SelectItem value="accessories">Accessories</SelectItem>
                              <SelectItem value="home">Home & Garden</SelectItem>
                              <SelectItem value="sports">Sports</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="image" className="text-sm font-medium text-gray-700">Image URL</Label>
                          <Input
                            id="image"
                            value={productForm.image}
                            onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                            className="mt-1 rounded-lg border-gray-300"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description" className="text-sm font-medium text-gray-700">Description</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          className="mt-1 rounded-lg border-gray-300"
                          rows={3}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 rounded-lg py-3 font-medium">
                        {loading ? 'Adding Product...' : 'Add Product'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                  <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <Package className="h-5 w-5 text-white" />
                      </div>
                      Product Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {products.length > 0 ? products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center space-x-4">
                            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-lg border border-gray-300" />
                            <div>
                              <p className="font-semibold text-gray-900">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.brand}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">₱{product.price}</Badge>
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700">Stock: {product.stock}</Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteProduct(product.id)}
                            className="rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )) : (
                        <div className="text-center py-12">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No products found</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    User Management
                  </CardTitle>
                  <CardDescription className="text-gray-600">View and manage customer accounts</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {users.length > 0 ? users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-3 rounded-full">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.username || 'No username'}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                              {user.role}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-sm text-gray-500 mb-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(user.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No users found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlists" className="space-y-8">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-pink-500 p-2 rounded-lg">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    User Wishlists ({wishlists.length} items)
                  </CardTitle>
                  <CardDescription className="text-gray-600">Monitor user wishlist items and preferences</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Button 
                      onClick={loadWishlists} 
                      variant="outline" 
                      size="sm"
                      className="mb-4"
                    >
                      Refresh Wishlists
                    </Button>
                  </div>
                  
                  {wishlists.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Added Date</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {wishlists.map((wishlist) => (
                            <TableRow key={wishlist.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {wishlist.profiles?.username || 'Unknown User'}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {wishlist.profiles?.email || wishlist.user_id}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-3">
                                  <img 
                                    src={wishlist.product_image || '/placeholder.svg'} 
                                    alt={wishlist.product_name || 'Product'}
                                    className="w-10 h-10 object-cover rounded border"
                                    onError={(e) => {
                                      e.currentTarget.src = '/placeholder.svg';
                                    }}
                                  />
                                  <div>
                                    <p className="font-medium">{wishlist.product_name || 'Unknown Product'}</p>
                                    <p className="text-sm text-gray-500">ID: {wishlist.product_id}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                ₱{wishlist.product_price || 0}
                              </TableCell>
                              <TableCell>
                                {new Date(wishlist.created_at).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deleteWishlistItem(wishlist.id)}
                                  className="rounded-lg"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No wishlist items found</p>
                      <p className="text-sm text-gray-400 mt-2">
                        Users haven't added any items to their wishlists yet
                      </p>
                      <Button 
                        onClick={loadWishlists} 
                        variant="outline" 
                        className="mt-4"
                      >
                        Refresh Data
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    Contact Messages ({messages.length})
                  </CardTitle>
                  <CardDescription className="text-gray-600">Customer inquiries and feedback</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {messages.length > 0 ? messages.map((message) => (
                      <div key={message.id} className="p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-orange-100 p-2 rounded-full">
                              <Mail className="h-4 w-4 text-orange-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{message.name}</p>
                              <p className="text-sm text-gray-600">{message.email}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            {new Date(message.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        {message.subject && (
                          <p className="font-medium text-gray-800 mb-2">Subject: {message.subject}</p>
                        )}
                        <p className="text-gray-700 leading-relaxed">{message.message}</p>
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No messages found</p>
                        <p className="text-sm text-gray-400 mt-2">Messages will appear here when customers contact you</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-yellow-500 p-2 rounded-lg">
                      <Star className="h-5 w-5 text-white" />
                    </div>
                    Product Reviews
                  </CardTitle>
                  <CardDescription className="text-gray-600">Customer feedback and ratings</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {reviews.length > 0 ? reviews.map((review) => (
                      <div key={review.id} className="p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <p className="font-semibold text-gray-900">{review.profiles?.username || 'Anonymous'}</p>
                            <div className="flex items-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${
                                    i < review.rating 
                                      ? 'text-yellow-400 fill-current' 
                                      : 'text-gray-300'
                                  }`} 
                                />
                              ))}
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            {new Date(review.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No reviews found</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
