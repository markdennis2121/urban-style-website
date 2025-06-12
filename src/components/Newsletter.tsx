
import React, { useState } from 'react';
import { Check } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5"></div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center px-4 relative">
        <div className="newstext">
          <h4 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 leading-tight">
            Subscribe to our <br />
            <span className="text-primary">Newsletter</span>
          </h4>
          <p className="text-muted-foreground text-lg mb-8">
            Stay updated with our latest collections and <br className="hidden sm:block" />
            exclusive offers right in your inbox
          </p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Exclusive Deals</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">New Arrivals</span>
            </div>
          </div>
        </div>
        <div className="form-container relative">
          <form 
            onSubmit={handleSubmit}
            className="bg-card p-2 rounded-full shadow-xl flex gap-2 transform hover:scale-105 transition-all duration-300"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="flex-1 px-6 py-4 text-foreground bg-transparent focus:outline-none"
              required
            />
            <button
              type="submit"
              className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 shadow-md hover:shadow-lg transform hover:translate-x-1"
            >
              Subscribe
              <span className="ml-2">→</span>
            </button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            By subscribing, you agree to our Privacy Policy
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
