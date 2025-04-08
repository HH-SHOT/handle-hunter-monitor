
import React from 'react';
import { Button } from '@/components/ui/button';

const CTASection = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-brand-blue to-brand-purple text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Secure Your Social Media Presence?</h2>
        <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
          Start monitoring your desired handles today and never miss an opportunity to claim the perfect username again.
        </p>
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button className="bg-white text-brand-blue hover:bg-brand-light hover:text-brand-purple text-lg px-8 py-6">
            Get Started for Free
          </Button>
          <Button variant="outline" className="border-white text-white hover:bg-white/20 text-lg px-8 py-6">
            View Demo
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
