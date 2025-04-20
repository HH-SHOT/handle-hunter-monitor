import React from 'react';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Basic monitoring for individuals.',
    features: [
      'Monitor up to 3 handles',
      'Daily availability checks',
      'Email notifications',
      'Basic analytics'
    ],
    cta: 'Start Free',
    popular: false
  },
  {
    name: 'Standard',
    price: '$5',
    period: '/month',
    description: 'Perfect for creators and small brands.',
    features: [
      'Monitor up to 10 handles',
      'Hourly availability checks',
      'Email & SMS notifications',
      'Advanced analytics',
      'Priority support'
    ],
    cta: 'Get Started',
    popular: true
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For businesses and agencies.',
    features: [
      'Monitor up to 30 handles',
      'Real-time availability checks',
      'All notification options',
      'Full analytics suite',
      '24/7 priority support',
      'API access'
    ],
    cta: 'Get Started',
    popular: false
  }
];

const PricingSection = ({ onGetStarted }: { onGetStarted?: () => void }) => {
  return (
    <section className="py-20 bg-brand-light">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. All plans include core monitoring features.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl shadow-sm border ${plan.popular ? 'border-brand-blue ring-2 ring-brand-blue/20 shadow-lg transform md:-translate-y-4' : 'border-gray-200'} overflow-hidden transition-all`}
            >
              {plan.popular && (
                <div className="bg-brand-blue text-white text-center py-2 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-gray-500">{plan.period}</span>}
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <Button 
                  className={`w-full ${plan.popular ? 'bg-brand-blue hover:bg-brand-purple' : 'bg-gray-800 hover:bg-gray-700'} text-white`}
                  onClick={onGetStarted}
                >
                  {plan.cta}
                </Button>
              </div>
              
              <div className="border-t border-gray-100 p-6">
                <p className="font-medium mb-4">What's included:</p>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
