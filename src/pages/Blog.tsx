
import React, { useState } from 'react';
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
  const [featuredPost, setFeaturedPost] = useState(blogPosts[0]);
  const [otherPosts, setOtherPosts] = useState(blogPosts.slice(1));

  const handlePostClick = (clickedPost: typeof blogPosts[0]) => {
    if (clickedPost.id === featuredPost.id) return;

    // Find the clicked post in otherPosts
    const clickedIndex = otherPosts.findIndex(post => post.id === clickedPost.id);
    if (clickedIndex === -1) return;

    // Create new arrays with the swap
    const newOtherPosts = [...otherPosts];
    newOtherPosts[clickedIndex] = featuredPost;
    
    setFeaturedPost(clickedPost);
    setOtherPosts(newOtherPosts);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="pt-24 pb-8 bg-muted/50 backdrop-blur-sm border-b border-border">
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
                  src={featuredPost.image} 
                  alt={featuredPost.title}
                  className="w-full h-96 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <Badge className="bg-primary/90 text-primary-foreground">{featuredPost.category}</Badge>
                </div>
              </div>
              <div className="space-y-4">
                <Badge variant="outline" className="border-primary/20">{featuredPost.category}</Badge>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground hover:text-primary transition-colors">
                  {featuredPost.title}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    <span>{featuredPost.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{featuredPost.date}</span>
                  </div>
                  <span>{featuredPost.readTime}</span>
                </div>
                <Link to={`/blog/${featuredPost.id}`} className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {otherPosts.map((post, index) => (
              <article 
                key={post.id} 
                className="bg-card/50 backdrop-blur-sm rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 animate-fade-in cursor-pointer group border border-border"
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handlePostClick(post)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-primary/90 text-primary-foreground">{post.category}</Badge>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-3 line-clamp-2 group-hover:text-primary transition-colors text-foreground">
                    {post.title}
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
          <div className="mt-16 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 backdrop-blur-sm rounded-xl p-8 text-center border border-primary/20">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Stay Updated</h2>
            <p className="mb-6 text-muted-foreground">
              Subscribe to our newsletter to get the latest fashion tips and trends delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors">
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
