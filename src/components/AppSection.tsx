
import React from 'react';

const AppSection = () => {
  return (
    <section className="py-20 bg-muted">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Download Our <span className="text-primary">App</span>
        </h2>
        <p className="text-muted-foreground mb-8 text-lg">Get our mobile app for a better shopping experience</p>
        <div className="relative max-w-3xl mx-auto rounded-xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="aspect-video flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">▶</span>
              </div>
              <p className="text-muted-foreground">App Demo Video Placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppSection;
