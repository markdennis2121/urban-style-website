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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Package, 
  MessageSquare, 
  PlusCircle, 
  Trash2,
  Heart,
  Star,
  TrendingUp,
  Mail,
  Calendar,
  User
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

  // Product form states
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    brand: '',
    category: '',
    image: '',
    stock: '',
    isNew: false,
    isSale: false,
    salePrice: ''
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
      console.log('=== LOADING CONTACT MESSAGES DEBUG ===');
      
      // First check current user auth
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user?.id);
      
      // Check user profile and role
      if (user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        console.log('User profile:', profile);
        console.log('Profile error:', profileError);
      }

      // Try to fetch messages with detailed error logging
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Messages query result:', { data, error });

      if (error) {
        console.error('=== CONTACT MESSAGES ERROR ===');
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        
        // If it's a permission error, set empty array but log it
        if (error.code === '42501' || error.message.includes('permission denied')) {
          console.log('Permission denied for contact_messages, using empty array');
          setMessages([]);
          return;
        }
        
        throw error;
      }

      console.log('=== CONTACT MESSAGES SUCCESS ===');
      console.log('Loaded messages count:', data?.length || 0);
      console.log('Messages data:', data);
      
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
      setMessages([]);
    }
  };

  const loadWishlists = async () => {
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          profiles:user_id (username, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Wishlists table not accessible, using empty array');
        setWishlists([]);
        return;
      }
      setWishlists(data || []);
    } catch (err) {
      console.error('Error loading wishlists:', err);
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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productForm.name,
          description: productForm.description,
          price: parseFloat(productForm.price),
          brand: productForm.brand,
          category: productForm.category,
          image: productForm.image,
          stock: parseInt(productForm.stock),
          is_new: productForm.isNew,
          is_sale: productForm.isSale,
          sale_price: productForm.salePrice ? parseFloat(productForm.salePrice) : null,
          in_stock: parseInt(productForm.stock) > 0
        }])
        .select();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Product added successfully.",
      });

      // Reset form
      setProductForm({
        name: '',
        description: '',
        price: '',
        brand: '',
        category: '',
        image: '',
        stock: '',
        isNew: false,
        isSale: false,
        salePrice: ''
      });

      // Reload products
      loadProducts();
    } catch (err) {
      console.error('Error adding product:', err);
      toast({
        title: "Error",
        description: "Failed to add product.",
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Modern Header Section */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">
                    Admin Dashboard
                  </h1>
                  <p className="text-lg text-gray-600">
                    Manage your store operations and customer data
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert className="mb-8 bg-red-50 border-red-200 rounded-xl">
              <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700">Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900 mb-1">{users.length}</div>
                <p className="text-sm text-blue-700">Total Users</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="bg-green-500 p-2 rounded-lg">
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-700">Inventory</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900 mb-1">{products.length}</div>
                <p className="text-sm text-green-700">Products</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">Saved</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900 mb-1">{wishlists.length}</div>
                <p className="text-sm text-purple-700">Wishlists</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="bg-orange-500 p-2 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">New</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900 mb-1">{messages.length}</div>
                <p className="text-sm text-orange-700">Messages</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-8">
            <TabsList className="bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <TabsTrigger value="users" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 rounded-lg px-6 py-3 font-medium">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 rounded-lg px-6 py-3 font-medium">
                <Package className="w-4 h-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger value="messages" className="data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700 rounded-lg px-6 py-3 font-medium">
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="wishlists" className="data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700 rounded-lg px-6 py-3 font-medium">
                <Heart className="w-4 h-4 mr-2" />
                Wishlists
              </TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-yellow-50 data-[state=active]:text-yellow-700 rounded-lg px-6 py-3 font-medium">
                <Star className="w-4 h-4 mr-2" />
                Reviews
              </TabsTrigger>
            </TabsList>

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
                    <form onSubmit={handleAddProduct} className="space-y-6">
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

            <TabsContent value="wishlists">
              <Card className="bg-white border border-gray-200 rounded-xl shadow-sm">
                <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold text-gray-900">
                    <div className="bg-purple-500 p-2 rounded-lg">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    User Wishlists
                  </CardTitle>
                  <CardDescription className="text-gray-600">Items saved by customers</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {wishlists.length > 0 ? wishlists.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-5 border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-cover rounded-lg border border-gray-300" />
                          <div>
                            <p className="font-semibold text-gray-900">{item.product_name}</p>
                            <p className="text-sm text-gray-600">
                              by {item.profiles?.username || 'Unknown User'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">₱{item.product_price}</Badge>
                      </div>
                    )) : (
                      <div className="text-center py-12">
                        <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No wishlist items found</p>
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
