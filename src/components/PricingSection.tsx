
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionTierProps } from './SubscriptionTier';
import pricingData from '@/data/pricing.json';

// This is a separate component just for the pricing page
const PricingTier = ({ 
  name, 
  price, 
  description, 
  features, 
  highlighted, 
  buttonText, 
  onButtonClick 
}: {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted: boolean;
  buttonText: string;
  onButtonClick: () => void;
}) => (
  <div className={`rounded-lg shadow-lg p-6 ${highlighted ? 'border-2 border-brand-blue ring-4 ring-brand-blue/20 relative' : 'border border-gray-200'}`}>
    {highlighted && (
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-brand-purple text-white text-sm font-bold rounded-full px-4 py-1">
        Popular Choice
      </div>
    )}
    <h3 className="text-xl font-bold mb-2">{name}</h3>
    <div className="mb-4">
      <span className="text-3xl font-bold">${price}</span>
      {price > 0 && <span className="text-gray-500">/month</span>}
    </div>
    <p className="text-gray-600 mb-6">{description}</p>
    <ul className="mb-8 space-y-3">
      {features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
    <button 
      onClick={onButtonClick}
      className={`w-full py-3 px-4 rounded-lg font-medium ${
        highlighted 
          ? 'bg-brand-blue hover:bg-brand-purple text-white' 
          : 'bg-white border border-brand-blue text-brand-blue hover:bg-gray-50'
      } transition-colors`}
    >
      {buttonText}
    </button>
  </div>
);

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
          {pricingData.plans.map((plan, index) => (
            <PricingTier 
              key={index}
              name={plan.name}
              price={plan.price}
              description={plan.description}
              features={plan.features}
              highlighted={plan.highlighted}
              buttonText={plan.buttonText}
              onButtonClick={handleGetStarted}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
