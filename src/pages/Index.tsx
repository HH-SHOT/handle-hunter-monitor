import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import CTASection from '@/components/CTASection';
import DashboardDemo from '@/components/DashboardDemo';

const Index = () => {
  const navigate = useNavigate ? useNavigate() : null;
  // Utility for navigation in the Hero section, landing, etc.
  const handlePricing = () => {
    if (navigate) navigate('/pricing');
    else window.location.href = '/pricing';
  };
  const handleSignIn = () => {
    if (navigate) navigate('/auth');
    else window.location.href = '/auth';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection 
          onTryNow={handleSignIn}
          onGetStarted={handleSignIn}
          onViewPricing={handlePricing}
        />
        <FeaturesSection />
        <DashboardDemo />
        <PricingSection onGetStarted={handleSignIn} />
        <TestimonialsSection />
        <CTASection onGetStarted={handleSignIn} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
