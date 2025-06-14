
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
  Edit,
  Trash2,
  Heart,
  Star,
  ShoppingBag,
  TrendingUp
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
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Error loading messages:', err);
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

      if (error) throw error;
      setWishlists(data || []);
    } catch (err) {
      console.error('Error loading wishlists:', err);
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

      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/5 to-background">
      <Header />
      
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-xl text-muted-foreground">Manage your store and customers</p>
          </div>

          {error && (
            <Alert className="mb-6 bg-destructive/10 border-destructive/20">
              <AlertDescription className="text-destructive">{error}</AlertDescription>
            </Alert>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{users.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{products.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Wishlists</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{wishlists.length}</div>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{reviews.length}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="bg-muted/50 backdrop-blur-sm border border-border/50">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="wishlists">Wishlists</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription>View and manage regular users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/50">
                        <div>
                          <p className="font-medium">{user.username || 'No username'}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <Badge variant="outline" className="mt-1">
                            {user.role}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Joined: {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <div className="space-y-6">
                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PlusCircle className="h-5 w-5" />
                      Add New Product
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddProduct} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Product Name</Label>
                          <Input
                            id="name"
                            value={productForm.name}
                            onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="brand">Brand</Label>
                          <Input
                            id="brand"
                            value={productForm.brand}
                            onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="price">Price</Label>
                          <Input
                            id="price"
                            type="number"
                            step="0.01"
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="stock">Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={productForm.stock}
                            onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select onValueChange={(value) => setProductForm({...productForm, category: value})}>
                            <SelectTrigger>
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
                          <Label htmlFor="image">Image URL</Label>
                          <Input
                            id="image"
                            value={productForm.image}
                            onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={productForm.description}
                          onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Adding...' : 'Add Product'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Package className="h-5 w-5" />
                      Product Management
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {products.map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/50">
                          <div className="flex items-center space-x-4">
                            <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">{product.brand}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline">₱{product.price}</Badge>
                                <Badge variant="secondary">Stock: {product.stock}</Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="messages">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Contact Messages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div key={message.id} className="p-4 border border-border/50 rounded-lg bg-background/50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{message.name}</p>
                            <p className="text-sm text-muted-foreground">{message.email}</p>
                          </div>
                          <Badge variant="outline">
                            {new Date(message.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlists">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    User Wishlists
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wishlists.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-background/50">
                        <div className="flex items-center space-x-4">
                          <img src={item.product_image} alt={item.product_name} className="w-12 h-12 object-cover rounded" />
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              by {item.profiles?.username || 'Unknown User'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">₱{item.product_price}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Product Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.id} className="p-4 border border-border/50 rounded-lg bg-background/50">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">{review.profiles?.username || 'Anonymous'}</p>
                            <div className="flex items-center gap-1">
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
                          <Badge variant="outline">
                            {new Date(review.created_at).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className="text-sm">{review.comment}</p>
                      </div>
                    ))}
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
