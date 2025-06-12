
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: "Spring Fashion Trends 2024",
    excerpt: "Discover the hottest fashion trends for the upcoming spring season and how to incorporate them into your wardrobe.",
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600",
    category: "Fashion",
    author: "Sarah Johnson",
    date: "March 15, 2024",
    readTime: "5 min read"
  },
  {
    id: 2,
    title: "Sustainable Fashion: A Guide to Eco-Friendly Shopping",
    excerpt: "Learn how to make more sustainable fashion choices and support brands that care about the environment.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
    category: "Sustainability",
    author: "Mike Chen",
    date: "March 12, 2024",
    readTime: "7 min read"
  },
  {
    id: 3,
    title: "Building a Capsule Wardrobe",
    excerpt: "Create a versatile and minimalist wardrobe with these essential pieces that work for any occasion.",
    image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=600",
    category: "Style Tips",
    author: "Emma Wilson",
    date: "March 10, 2024",
    readTime: "6 min read"
  },
  {
    id: 4,
    title: "The Art of Layering",
    excerpt: "Master the art of layering to create stylish outfits that work in any season.",
    image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=600",
    category: "Style Tips",
    author: "David Kim",
    date: "March 8, 2024",
    readTime: "4 min read"
  },
  {
    id: 5,
    title: "Color Theory in Fashion",
    excerpt: "Understand how to use colors effectively in your outfits to create the perfect look.",
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600",
    category: "Fashion",
    author: "Lisa Rodriguez",
    date: "March 5, 2024",
    readTime: "8 min read"
  },
  {
    id: 6,
    title: "Accessorizing Like a Pro",
    excerpt: "Learn how to use accessories to elevate your outfits and express your personal style.",
    image: "https://images.unsplash.com/photo-1609081219090-a6d81d3085bf?w=600",
    category: "Accessories",
    author: "Rachel Green",
    date: "March 1, 2024",
    readTime: "5 min read"
  }
];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="pt-24 pb-8 bg-muted">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-foreground mb-4">Fashion Blog</h1>
          <p className="text-muted-foreground">Stay updated with the latest fashion trends and style tips</p>
        </div>
      </section>

      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          {/* Featured Post */}
          <div className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="relative overflow-hidden rounded-xl shadow-lg group">
                <img 
                  src={blogPosts[0].image} 
                  alt={blogPosts[0].title}
                  className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="space-y-4">
                <Badge>{blogPosts[0].category}</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  {blogPosts[0].title}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {blogPosts[0].excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{blogPosts[0].author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{blogPosts[0].date}</span>
                  </div>
                  <span>{blogPosts[0].readTime}</span>
                </div>
                <Link to={`/blog/${blogPosts[0].id}`} className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post, index) => (
              <article 
                key={post.id} 
                className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge>{post.category}</Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 hover:text-primary transition-colors">
                    <Link to={`/blog/${post.id}`}>
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{post.date}</span>
                      </div>
                    </div>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 bg-primary rounded-xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
            <p className="mb-6 opacity-90">
              Subscribe to our newsletter to get the latest fashion tips and trends delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <button className="px-6 py-3 bg-white text-primary rounded-full font-semibold hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Blog;
