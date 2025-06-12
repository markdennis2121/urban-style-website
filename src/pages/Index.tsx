
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import ProductsSection from '../components/ProductsSection';
import NewArrivalsSection from '../components/NewArrivalsSection';
import BannersSection from '../components/BannersSection';
import Newsletter from '../components/Newsletter';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturesSection />
      <ProductsSection />
      <NewArrivalsSection />
      <BannersSection />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
