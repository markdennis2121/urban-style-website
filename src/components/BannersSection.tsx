import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BannersSection = () => {
  const navigate = useNavigate();

  const handleExploreMore = () => {
    navigate('/shop');
  };

  const handleLearnMore = () => {
    navigate('/shop');
  };

  const handleCollection = () => {
    navigate('/shop');
  };

  const handleBannerClick = (category: string) => {
    navigate(`/shop?category=${category.toLowerCase()}`);
  };

  return (
    <>
      {/* Repair Service Banner */}
      <section className="py-24 relative">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop')"
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <h4 className="text-lg text-white mb-2">Repair Service</h4>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
            Up to <span className="text-red-500">70% off</span> - All t-shirts & Accessories
          </h2>
          <Button 
            size="lg" 
            className="transform hover:scale-105 transition-transform duration-300"
            onClick={handleExploreMore}
          >
            Explore More
          </Button>
        </div>
      </section>

      {/* Two Column Banners */}
      <section className="py-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            className="banner-box relative overflow-hidden rounded-2xl group cursor-pointer"
            onClick={() => handleBannerClick('dresses')}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=600&h=400&fit=crop')"
              }}
            ></div>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
            <div className="relative z-10 flex flex-col justify-center items-center text-center p-8 text-white min-h-[40vh]">
              <h4 className="text-lg font-semibold mb-2">crazy deals</h4>
              <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">buy 1 get 1 free</h2>
              <span className="text-sm mb-4 text-gray-100">The best classic dress is on sale at urban</span>
              <Button 
                variant="secondary" 
                className="transform hover:scale-105 transition-transform duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleLearnMore();
                }}
              >
                Learn More
              </Button>
            </div>
          </div>
          <div 
            className="banner-box relative overflow-hidden rounded-2xl group cursor-pointer"
            onClick={() => handleBannerClick('summer')}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&h=400&fit=crop')"
              }}
            ></div>
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors"></div>
            <div className="relative z-10 flex flex-col justify-center items-center text-center p-8 text-white min-h-[40vh]">
              <h4 className="text-lg font-semibold mb-2">spring/summer</h4>
              <h2 className="text-3xl font-bold mb-2 drop-shadow-lg">upcoming season</h2>
              <span className="text-sm mb-4 text-gray-100">The best classic dress is on sale at urban</span>
              <Button 
                variant="secondary" 
                className="transform hover:scale-105 transition-transform duration-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCollection();
                }}
              >
                Collection
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Three Column Banners */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-8 py-16 max-w-7xl mx-auto">
        <div 
          className="banner-box relative overflow-hidden rounded-2xl group cursor-pointer"
          onClick={() => handleBannerClick('sale')}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop')"
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
          <div className="relative z-10 flex flex-col justify-end items-start text-left p-8 min-h-[30vh]">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 drop-shadow-lg">SEASONAL SALE</h2>
            <h3 className="text-lg text-gray-200 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">Winter Collection -50% OFF</h3>
            <div className="h-1 w-12 bg-white mt-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </div>
        </div>
        
        <div 
          className="banner-box relative overflow-hidden rounded-2xl group cursor-pointer"
          onClick={() => handleBannerClick('footwear')}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop')"
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
          <div className="relative z-10 flex flex-col justify-end items-start text-left p-8 min-h-[30vh]">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 drop-shadow-lg">NEW FOOTWEAR</h2>
            <h3 className="text-lg text-gray-200 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">Spring / Summer 2025</h3>
            <div className="h-1 w-12 bg-white mt-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </div>
        </div>
        
        <div 
          className="banner-box relative overflow-hidden rounded-2xl group cursor-pointer"
          onClick={() => handleBannerClick('t-shirts')}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop')"
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>
          <div className="relative z-10 flex flex-col justify-end items-start text-left p-8 min-h-[30vh]">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 drop-shadow-lg">T-SHIRTS</h2>
            <h3 className="text-lg text-gray-200 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">New Trendy Prints</h3>
            <div className="h-1 w-12 bg-white mt-4 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BannersSection;
