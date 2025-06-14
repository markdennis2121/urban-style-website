
import React, { useState, useMemo, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { categories, brands } from '../data/products';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Grid, List, X } from 'lucide-react';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform database products to match the expected format
      const transformedProducts = data.map(product => ({
        ...product,
        image: product.image_url,
        brand: product.brand || 'Generic',
        rating: 4.5, // Default rating
        reviews: 0, // Default reviews
        isNew: false, // Default new status
        isSale: false, // Default sale status
        inStock: product.stock > 0,
        originalPrice: null
      }));
      
      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesBrand = selectedBrand === 'All Brands' || product.brand === selectedBrand;
        const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
        
        return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'rating':
            return b.rating - a.rating;
          case 'newest':
            return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [products, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedBrand('All Brands');
    setPriceRange([0, 10000]);
    setSortBy('name');
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== 'All' ? selectedCategory : null,
    selectedBrand !== 'All Brands' ? selectedBrand : null,
    priceRange[0] !== 0 || priceRange[1] !== 10000 ? 'price' : null,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Header />
      
      {/* Page Header */}
      <section className="pt-24 pb-8 bg-white/5 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4">Shop</h1>
          <p className="text-white/70">Discover our complete collection of fashion items</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white/10 backdrop-blur-md border-white/20 rounded-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Filters</h3>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">{activeFiltersCount}</Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-white hover:bg-white/10">
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-white">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-white">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="text-white hover:bg-white/10">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-white">Brand</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand} className="text-white hover:bg-white/10">
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-white">
                  Price Range: ₱{priceRange[0]} - ₱{priceRange[1]}
                </label>
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  max={10000}
                  step={500}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-blue-500/20 text-blue-300">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                <span className="text-sm text-white/70">
                  {filteredProducts.length} products found
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-white/20">
                    <SelectItem value="name" className="text-white hover:bg-white/10">Sort by Name</SelectItem>
                    <SelectItem value="price-low" className="text-white hover:bg-white/10">Price: Low to High</SelectItem>
                    <SelectItem value="price-high" className="text-white hover:bg-white/10">Price: High to Low</SelectItem>
                    <SelectItem value="rating" className="text-white hover:bg-white/10">Highest Rated</SelectItem>
                    <SelectItem value="newest" className="text-white hover:bg-white/10">Newest First</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-white/20 rounded-md bg-white/10">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="border-0"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="border-0"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold mb-2 text-white">No products found</h3>
                <p className="text-white/70 mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button onClick={clearFilters} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Shop;
