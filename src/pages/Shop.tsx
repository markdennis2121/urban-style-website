import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import { Search, Filter, Grid, List } from 'lucide-react';
import { searchItems } from '@/utils/searchUtils';

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  // Initialize search term from URL params only once
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);

  // Update URL when search term changes (but not on initial load)
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (searchTerm !== urlSearch) {
      const params = new URLSearchParams(searchParams);
      if (searchTerm.trim()) {
        params.set('search', searchTerm);
      } else {
        params.delete('search');
      }
      setSearchParams(params, { replace: true });
    }
  }, [searchTerm]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .gt('stock', 0)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Raw products from database:', data);
      console.log('Number of products loaded:', data?.length || 0);
      
      const transformedProducts = data.map(product => {
        console.log('Transforming product:', product.name, 'Category:', product.category, 'Image field:', product.image);
        
        // Fix empty category field - assign "Shoes" category if the product name contains "shoe" or similar
        let category = product.category;
        if (!category || category.trim() === '') {
          const productName = product.name.toLowerCase();
          if (productName.includes('shoe') || productName.includes('sneaker') || productName.includes('boot')) {
            category = 'Shoes';
            console.log('Fixed empty category for:', product.name, 'assigned to Shoes');
          } else {
            category = 'Uncategorized';
            console.log('Product has empty category:', product.name, 'assigned to Uncategorized');
          }
        }
        
        return {
          ...product,
          category: category,
          image: product.image || '/placeholder.svg',
          brand: product.brand || 'Admin Added',
          rating: 4.5,
          reviews: 0,
          isNew: product.is_new_arrival || false,
          isSale: false,
          inStock: product.stock > 0,
          originalPrice: null
        };
      });
      
      console.log('Transformed products:', transformedProducts);
      console.log('Categories found in products:', [...new Set(transformedProducts.map(p => p.category))]);
      setDbProducts(transformedProducts);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Only use database products now
  const allProducts = useMemo(() => {
    console.log('All products before filtering:', dbProducts.length);
    return dbProducts;
  }, [dbProducts]);

  const filteredProducts = useMemo(() => {
    console.log('Starting filter process...');
    console.log('Search term:', searchTerm);
    console.log('Selected category:', selectedCategory);
    console.log('Selected brand:', selectedBrand);
    console.log('Price range:', priceRange);
    
    let filtered = allProducts;
    console.log('Products before any filtering:', filtered.length);

    // Apply search filter using the search utility
    if (searchTerm.trim()) {
      filtered = searchItems(filtered, searchTerm, ['name', 'category', 'description', 'brand']);
      console.log('After search filter:', filtered.length, 'products found');
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      const beforeCategoryFilter = filtered.length;
      filtered = filtered.filter(product => {
        const matches = product.category === selectedCategory;
        if (!matches) {
          console.log(`Product "${product.name}" filtered out - category "${product.category}" doesn't match "${selectedCategory}"`);
        }
        return matches;
      });
      console.log(`Category filter: ${beforeCategoryFilter} -> ${filtered.length} (looking for category: "${selectedCategory}")`);
    }

    // Apply brand filter
    if (selectedBrand !== 'All Brands') {
      const beforeBrandFilter = filtered.length;
      filtered = filtered.filter(product => product.brand === selectedBrand);
      console.log(`Brand filter: ${beforeBrandFilter} -> ${filtered.length} (looking for brand: "${selectedBrand}")`);
    }

    // Apply price filter
    const beforePriceFilter = filtered.length;
    filtered = filtered.filter(product => {
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      if (!matchesPrice) {
        console.log(`Product "${product.name}" filtered out by price - ₱${product.price} not in range ₱${priceRange[0]}-₱${priceRange[1]}`);
      }
      return matchesPrice;
    });
    console.log(`Price filter: ${beforePriceFilter} -> ${filtered.length} (range: ${priceRange[0]}-${priceRange[1]})`);

    // Apply sorting
    const sortedProducts = filtered.sort((a, b) => {
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

    console.log('Final filtered products:', sortedProducts.length);
    console.log('Final filtered products details:', sortedProducts.map(p => ({ name: p.name, category: p.category, price: p.price })));
    
    return sortedProducts;
  }, [allProducts, searchTerm, selectedCategory, selectedBrand, priceRange, sortBy]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedBrand('All Brands');
    setPriceRange([0, 5000]);
    setSortBy('name');
    // Clear URL params
    setSearchParams({}, { replace: true });
  };

  const activeFiltersCount = [
    searchTerm,
    selectedCategory !== 'All' ? selectedCategory : null,
    selectedBrand !== 'All Brands' ? selectedBrand : null,
    priceRange[0] !== 0 || priceRange[1] !== 5000 ? 'price' : null,
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-background">
      <Header />
      
      {/* Page Header */}
      <section className="pt-24 pb-8 bg-gradient-to-r from-muted/30 via-background to-muted/30 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Shop Collection
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 mb-6 rounded-full"></div>
          <p className="text-xl text-muted-foreground font-light">Discover our complete collection of fashion items</p>
          {searchTerm && (
            <p className="text-lg text-muted-foreground mt-2">
              Search results for: <span className="font-medium text-foreground">"{searchTerm}"</span>
            </p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 sticky top-24 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Filters
                </h3>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                      {activeFiltersCount}
                    </Badge>
                  )}
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground hover:text-foreground">
                    Clear All
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-foreground">Search Products</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background/80 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-foreground">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="bg-background/80 border-border/50 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    {categories.map(category => (
                      <SelectItem key={category} value={category} className="hover:bg-muted rounded-lg">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Brand */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-foreground">Brand</label>
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="bg-background/80 border-border/50 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    {brands.map(brand => (
                      <SelectItem key={brand} value={brand} className="hover:bg-muted rounded-lg">
                        {brand}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-3 text-foreground">
                  Price Range: ₱{priceRange[0].toLocaleString()} - ₱{priceRange[1].toLocaleString()}
                </label>
                <div className="px-2">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={5000}
                    min={0}
                    step={100}
                    className="mt-3"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>₱0</span>
                    <span>₱5,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden bg-card/60 border-border/50 hover:bg-muted rounded-xl backdrop-blur-sm"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-2 bg-primary/20 text-primary border-primary/30">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
                <span className="text-sm text-muted-foreground font-medium">
                  {filteredProducts.length} products found
                  {searchTerm && ` for "${searchTerm}"`}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 bg-card/60 border-border/50 rounded-xl backdrop-blur-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border rounded-xl">
                    <SelectItem value="name" className="hover:bg-muted rounded-lg">Sort by Name</SelectItem>
                    <SelectItem value="price-low" className="hover:bg-muted rounded-lg">Price: Low to High</SelectItem>
                    <SelectItem value="price-high" className="hover:bg-muted rounded-lg">Price: High to Low</SelectItem>
                    <SelectItem value="rating" className="hover:bg-muted rounded-lg">Highest Rated</SelectItem>
                    <SelectItem value="newest" className="hover:bg-muted rounded-lg">Newest First</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-border/50 rounded-xl bg-card/60 backdrop-blur-sm">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="border-0 rounded-l-xl"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="border-0 rounded-r-xl"
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
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8'
                  : 'space-y-6'
              }>
                {filteredProducts.map((product, index) => (
                  <div 
                    key={product.id}
                    className="animate-fade-in hover:scale-105 transition-all duration-500"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-8xl mb-6 opacity-50">🔍</div>
                <h3 className="text-2xl font-bold mb-4 text-foreground">No products found</h3>
                <p className="text-muted-foreground mb-6 text-lg">
                  {searchTerm 
                    ? `No results found for "${searchTerm}". Try different keywords or adjust your filters.`
                    : 'No products available. Add products through the admin dashboard!'
                  }
                </p>
                <Button onClick={clearFilters} className="bg-primary hover:bg-primary/90 rounded-xl px-8 py-3">
                  Clear All Filters
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
