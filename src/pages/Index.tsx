
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MobileOptimizedHero from '../components/MobileOptimizedHero';
import FeaturesSection from '../components/FeaturesSection';
import MobileOptimizedProducts from '../components/MobileOptimizedProducts';
import NewArrivalsSection from '../components/NewArrivalsSection';
import BannersSection from '../components/BannersSection';
import Newsletter from '../components/Newsletter';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <MobileOptimizedHero />
      <FeaturesSection />
      <MobileOptimizedProducts />
      <NewArrivalsSection />
      <BannersSection />
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Index;
