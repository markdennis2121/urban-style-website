
import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AboutSection from '../components/AboutSection';
import TeamSection from '../components/TeamSection';

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="py-20 mt-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 animate-fade-in">#KnowUs</h2>
          <p className="text-lg text-muted-foreground animate-fade-in">Learn more about our story and mission</p>
        </div>
      </section>

      {/* About Content */}
      <AboutSection />

      {/* Team Section */}
      <TeamSection />

      {/* App Download Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Download Our <span className="text-primary">App</span>
          </h2>
          <p className="text-muted-foreground mb-12 text-lg">
            Get our mobile app for a better shopping experience with exclusive deals and faster checkout
          </p>
          <div className="max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl bg-gradient-to-br from-primary/20 to-primary/10 p-12">
            <div className="text-center">
              <div className="w-32 h-32 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
                <img src="/favicon.png" alt="Urban Logo" className="w-full h-full object-contain" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-4">Urban Mobile App</h3>
              <p className="text-muted-foreground mb-8">Coming Soon - Experience shopping like never before</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="bg-card p-4 rounded-lg shadow-md">
                  <span className="text-sm text-muted-foreground">Download from App Store</span>
                </div>
                <div className="bg-card p-4 rounded-lg shadow-md">
                  <span className="text-sm text-muted-foreground">Get it on Google Play</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
