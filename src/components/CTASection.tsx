
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/auth');
  };
  
  return (
    <div className="py-16 bg-gradient-to-r from-brand-blue to-brand-purple">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Secure Your Perfect Handle?</h2>
        <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
          Start monitoring your desired usernames today and never miss out on the perfect handle again.
        </p>
        <Button 
          size="lg" 
          className="bg-white text-brand-blue hover:bg-gray-100 px-8 py-6 text-lg"
          onClick={handleGetStarted}
        >
          Get Started Now
        </Button>
      </div>
    </div>
  );
};

export default CTASection;
