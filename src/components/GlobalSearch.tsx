
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { searchItems, SearchableItem } from '@/utils/searchUtils';
import { Link, useNavigate } from 'react-router-dom';

interface SearchResult extends SearchableItem {
  type: 'product' | 'user' | 'admin';
  url: string;
  image?: string;
  price?: number;
}

interface GlobalSearchProps {
  placeholder?: string;
  className?: string;
  showResults?: boolean;
  onSearch?: (term: string) => void;
  items?: SearchResult[];
}

const GlobalSearch = ({ 
  placeholder = "Search...", 
  className = "", 
  showResults = true,
  onSearch,
  items = []
}: GlobalSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.trim() && items.length > 0) {
      const filteredResults = searchItems(items, searchTerm, ['name', 'category', 'description', 'email', 'username']);
      setResults(filteredResults.slice(0, 8)); // Limit to 8 results
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [searchTerm, items]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchTerm.trim()) {
      // Navigate to shop page with search term
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setIsOpen(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setResults([]);
    setIsOpen(false);
    onSearch?.('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyPress={handleKeyPress}
          className="pl-10 pr-10 bg-background/50 border-border/50 rounded-xl focus:ring-2 focus:ring-primary/20"
          onFocus={() => searchTerm && setIsOpen(true)}
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-y-auto border border-border/50 shadow-xl">
          <CardContent className="p-0">
            {results.map((result, index) => (
              <Link
                key={result.id}
                to={result.url}
                onClick={() => setIsOpen(false)}
                className="block hover:bg-muted/50 transition-colors"
              >
                <div className="p-4 border-b border-border/30 last:border-b-0">
                  <div className="flex items-center gap-3">
                    {result.image && (
                      <img 
                        src={result.image} 
                        alt={result.name}
                        className="w-10 h-10 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {result.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {result.type}
                        </Badge>
                        {result.category && (
                          <span className="text-xs text-muted-foreground">
                            {result.category}
                          </span>
                        )}
                        {result.price && (
                          <span className="text-xs font-medium text-primary">
                            ₱{result.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {/* Show all results option */}
            <div className="p-3 border-t border-border/30 bg-muted/20">
              <Link
                to={`/shop?search=${encodeURIComponent(searchTerm)}`}
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-primary hover:text-primary/80 font-medium"
              >
                View all results for "{searchTerm}"
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {showResults && isOpen && searchTerm && results.length === 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 border border-border/50 shadow-xl">
          <CardContent className="p-4 text-center text-muted-foreground">
            <p className="mb-2">No results found for "{searchTerm}"</p>
            <Link
              to={`/shop?search=${encodeURIComponent(searchTerm)}`}
              onClick={() => setIsOpen(false)}
              className="text-sm text-primary hover:text-primary/80 font-medium"
            >
              Search in all products
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GlobalSearch;
