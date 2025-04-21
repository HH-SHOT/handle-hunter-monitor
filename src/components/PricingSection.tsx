
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionTier from './SubscriptionTier';

const PricingSection = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/auth');
  };
  
  return (
    <div id="pricing" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your handle monitoring needs. All plans include our core monitoring features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <SubscriptionTier 
            name="Free"
            price={0}
            description="Perfect for getting started with handle monitoring"
            features={[
              "Monitor up to 3 handles",
              "Daily availability checks",
              "Email notifications",
              "Basic dashboard access"
            ]}
            highlighted={false}
            buttonText="Get Started"
            onButtonClick={handleGetStarted}
          />
          
          <SubscriptionTier 
            name="Standard"
            price={9.99}
            description="More frequent checks for serious handle hunters"
            features={[
              "Monitor up to 10 handles",
              "12-hour availability checks",
              "Email and SMS notifications",
              "Full dashboard access",
              "Handle history tracking"
            ]}
            highlighted={true}
            buttonText="Get Started"
            onButtonClick={handleGetStarted}
          />
          
          <SubscriptionTier 
            name="Pro"
            price={19.99}
            description="Maximum monitoring for professional users"
            features={[
              "Unlimited handle monitoring",
              "Hourly availability checks",
              "Priority notifications",
              "Advanced analytics",
              "API access",
              "Priority support"
            ]}
            highlighted={false}
            buttonText="Get Started"
            onButtonClick={handleGetStarted}
          />
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
