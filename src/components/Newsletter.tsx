
import React, { useState } from 'react';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setEmail('');
  };

  return (
    <section className="py-20 bg-muted">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center px-4">
        <div>
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Sign Up For Newsletter</h3>
          <p className="text-muted-foreground">
            Get E-mail updates about our latest shop and <span className="text-primary font-semibold">special offers</span>
          </p>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 p-4 border border-input rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-background"
            required
          />
          <button
            type="submit"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors shadow-md hover:shadow-lg font-semibold"
          >
            Sign Up
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
