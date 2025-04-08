
import React from 'react';
import { Bell, Clock, Zap, BarChart3, Shield, Globe } from 'lucide-react';

const features = [
  {
    icon: <Bell className="w-10 h-10 text-brand-blue p-2 bg-brand-blue/10 rounded-lg" />,
    title: 'Real-time Monitoring',
    description: 'Instantly check the availability of social media handles as soon as they become relevant.'
  },
  {
    icon: <Clock className="w-10 h-10 text-brand-blue p-2 bg-brand-blue/10 rounded-lg" />,
    title: 'Instant Notifications',
    description: 'Get alerted immediately when your desired username becomes available for registration.'
  },
  {
    icon: <Zap className="w-10 h-10 text-brand-blue p-2 bg-brand-blue/10 rounded-lg" />,
    title: 'Effortless Setup',
    description: 'Our user-friendly interface and intuitive design make using HandleHunter a breeze.'
  },
  {
    icon: <BarChart3 className="w-10 h-10 text-brand-blue p-2 bg-brand-blue/10 rounded-lg" />,
    title: 'Strategic Advantage',
    description: 'Stay ahead of competitors by securing the ideal username that aligns with your goals.'
  },
  {
    icon: <Shield className="w-10 h-10 text-brand-blue p-2 bg-brand-blue/10 rounded-lg" />,
    title: 'Brand Protection',
    description: 'Safeguard your brand identity across multiple social media platforms simultaneously.'
  },
  {
    icon: <Globe className="w-10 h-10 text-brand-blue p-2 bg-brand-blue/10 rounded-lg" />,
    title: 'Brand Building',
    description: 'Establish a consistent online presence across social media platforms effortlessly.'
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our solution is tailored to address a crucial aspect of your online presence – monitoring social media handles effectively.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-blue/20 transition-all"
            >
              <div className="mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
