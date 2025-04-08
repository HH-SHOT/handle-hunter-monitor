
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FeaturesSection from '@/components/FeaturesSection';
import CTASection from '@/components/CTASection';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Zap, 
  Shield, 
  BarChart3, 
  RefreshCw, 
  Smartphone,
  Layers,
  Clock
} from 'lucide-react';

const FeatureDetails = [
  {
    icon: <Bell className="w-12 h-12 text-brand-blue p-2" />,
    title: 'Real-time Monitoring',
    description: 'Our system continuously checks the availability of your desired handles across major social platforms. Never miss when a handle becomes available again.',
    details: [
      'Automatic scanning of social platforms',
      'Customizable check intervals',
      'Status history and tracking',
      'Multi-platform monitoring'
    ]
  },
  {
    icon: <Zap className="w-12 h-12 text-brand-blue p-2" />,
    title: 'Instant Notifications',
    description: 'Get alerted immediately when your desired username becomes available. Choose from various notification methods to stay informed wherever you are.',
    details: [
      'Email notifications',
      'SMS alerts',
      'Browser notifications',
      'Mobile app push notifications'
    ]
  },
  {
    icon: <Shield className="w-12 h-12 text-brand-blue p-2" />,
    title: 'Brand Protection',
    description: 'Safeguard your brand identity by monitoring and securing consistent usernames across all major social media platforms.',
    details: [
      'Brand name watching',
      'Similar name monitoring',
      'Typo and variation detection',
      'Comprehensive coverage'
    ]
  },
  {
    icon: <BarChart3 className="w-12 h-12 text-brand-blue p-2" />,
    title: 'Advanced Analytics',
    description: 'Gain insights into handle availability patterns and optimize your monitoring strategy with detailed analytics.',
    details: [
      'Availability trends',
      'Platform-specific insights',
      'Custom reports and exports',
      'Historical data analysis'
    ]
  }
];

const Features = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="bg-gradient-to-br from-brand-light via-white to-brand-light py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">Powerful Features</span> for Handle Monitoring
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Discover all the tools and capabilities that make HandleHunter the best solution for monitoring social media handles.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-brand-blue hover:bg-brand-purple text-white px-8 py-6">
                Try It Now
              </Button>
              <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-8 py-6">
                View Pricing
              </Button>
            </div>
          </div>
        </div>
        
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            {FeatureDetails.map((feature, index) => (
              <div 
                key={index}
                className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center mb-24 last:mb-0`}
              >
                <div className="md:w-1/2 mb-8 md:mb-0">
                  <div className={`bg-gray-50 border border-gray-100 rounded-xl p-8 md:p-12 ${index % 2 === 1 ? 'md:ml-12' : 'md:mr-12'}`}>
                    <div className="mb-6 inline-block rounded-full bg-brand-blue/10 p-3">
                      {feature.icon}
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{feature.title}</h2>
                    <p className="text-gray-600 mb-6">{feature.description}</p>
                    <ul className="space-y-2">
                      {feature.details.map((detail, i) => (
                        <li key={i} className="flex items-start">
                          <div className="mr-3 text-brand-blue">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="md:w-1/2">
                  <div className={`bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden ${index % 2 === 1 ? 'md:mr-12' : 'md:ml-12'}`}>
                    <div className="h-64 bg-gray-100 flex items-center justify-center">
                      <div className="text-4xl text-brand-blue opacity-50">
                        {index === 0 && <RefreshCw className="w-24 h-24" />}
                        {index === 1 && <Bell className="w-24 h-24" />}
                        {index === 2 && <Shield className="w-24 h-24" />}
                        {index === 3 && <BarChart3 className="w-24 h-24" />}
                      </div>
                    </div>
                    <div className="p-6 bg-white">
                      <h3 className="font-semibold text-lg mb-2">More {feature.title} Features</h3>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center">
                          <Clock className="w-5 h-5 text-brand-blue mr-2" />
                          <span className="text-sm">Flexible timing</span>
                        </div>
                        <div className="flex items-center">
                          <Layers className="w-5 h-5 text-brand-blue mr-2" />
                          <span className="text-sm">Multi-platform</span>
                        </div>
                        <div className="flex items-center">
                          <Smartphone className="w-5 h-5 text-brand-blue mr-2" />
                          <span className="text-sm">Mobile ready</span>
                        </div>
                        <div className="flex items-center">
                          <Zap className="w-5 h-5 text-brand-blue mr-2" />
                          <span className="text-sm">Instant updates</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Features;
