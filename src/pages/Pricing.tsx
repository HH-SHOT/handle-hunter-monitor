
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import { Button } from '@/components/ui/button';
import { Check, HelpCircle } from 'lucide-react';

const faqItems = [
  {
    question: "How does handle monitoring work?",
    answer: "Our system checks the availability of social media handles at regular intervals by querying the platform APIs. When a username becomes available, we immediately notify you through your chosen notification methods."
  },
  {
    question: "Can I monitor handles across multiple platforms?",
    answer: "Yes, HandleHunter allows you to monitor usernames across all major social media platforms, including Twitter, Instagram, Facebook, and more, all from a single dashboard."
  },
  {
    question: "How frequently are handles checked?",
    answer: "The checking frequency depends on your plan. Free users get daily checks, Standard users get hourly checks, and Pro users get real-time monitoring with immediate notifications."
  },
  {
    question: "What happens when a handle becomes available?",
    answer: "As soon as a handle becomes available, you'll receive an instant notification via your chosen methods (email, SMS, or app notification). You can then quickly claim the username on the respective platform."
  },
  {
    question: "Can I upgrade or downgrade my plan later?",
    answer: "Absolutely! You can upgrade or downgrade your subscription at any time. When upgrading, you'll get immediate access to the new features. When downgrading, the changes will take effect at the end of your current billing cycle."
  },
  {
    question: "Is there a limit to how many handles I can monitor?",
    answer: "Yes, each plan has a specific limit. Free users can monitor up to 3 handles, Standard users can monitor up to 10 handles, and Pro users can monitor up to 30 handles simultaneously."
  }
];

const ComparisonTable = () => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Features</th>
          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Free</th>
          <th className="px-6 py-4 text-center text-sm font-semibold text-brand-blue border-x border-gray-200 bg-brand-blue/5">Standard</th>
          <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Pro</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        <tr>
          <td className="px-6 py-4 text-sm text-gray-700">Handles monitoring limit</td>
          <td className="px-6 py-4 text-center text-sm text-gray-700">3</td>
          <td className="px-6 py-4 text-center text-sm text-gray-700 border-x border-gray-200 bg-brand-blue/5">10</td>
          <td className="px-6 py-4 text-center text-sm text-gray-700">30</td>
        </tr>
        <tr>
          <td className="px-6 py-4 text-sm text-gray-700">Check frequency</td>
          <td className="px-6 py-4 text-center text-sm text-gray-700">Daily</td>
          <td className="px-6 py-4 text-center text-sm text-gray-700 border-x border-gray-200 bg-brand-blue/5">Hourly</td>
          <td className="px-6 py-4 text-center text-sm text-gray-700">Real-time</td>
        </tr>
        <tr>
          <td className="px-6 py-4 text-sm text-gray-700">Email notifications</td>
          <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto"/></td>
          <td className="px-6 py-4 text-center border-x border-gray-200 bg-brand-blue/5"><Check className="h-5 w-5 text-green-500 mx-auto"/></td>
          <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto"/></td>
        </tr>
        <tr>
          <td className="px-6 py-4 text-sm text-gray-700">SMS notifications</td>
          <td className="px-6 py-4 text-center text-gray-400">—</td>
          <td className="px-6 py-4 text-center border-x border-gray-200 bg-brand-blue/5"><Check className="h-5 w-5 text-green-500 mx-auto"/></td>
          <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto"/></td>
        </tr>
        <tr>
          <td className="px-6 py-4 text-sm text-gray-700">Analytics</td>
          <td className="px-6 py-4 text-center text-sm text-gray-700">Basic</td>
          <td className="px-6 py-4 text-center text-sm text-gray-700 border-x border-gray-200 bg-brand-blue/5">Advanced</td>
          <td className="px-6 py-4 text-center text-sm text-gray-700">Full Suite</td>
        </tr>
        <tr>
          <td className="px-6 py-4 text-sm text-gray-700">API Access</td>
          <td className="px-6 py-4 text-center text-gray-400">—</td>
          <td className="px-6 py-4 text-center text-gray-400 border-x border-gray-200 bg-brand-blue/5">—</td>
          <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto"/></td>
        </tr>
        <tr>
          <td className="px-6 py-4 text-sm text-gray-700">Priority Support</td>
          <td className="px-6 py-4 text-center text-gray-400">—</td>
          <td className="px-6 py-4 text-center border-x border-gray-200 bg-brand-blue/5"><Check className="h-5 w-5 text-green-500 mx-auto"/></td>
          <td className="px-6 py-4 text-center"><Check className="h-5 w-5 text-green-500 mx-auto"/></td>
        </tr>
        <tr>
          <td className="px-6 py-4 text-sm text-gray-700">Price</td>
          <td className="px-6 py-4 text-center text-sm font-medium text-gray-700">$0</td>
          <td className="px-6 py-4 text-center text-sm font-medium text-brand-blue border-x border-gray-200 bg-brand-blue/5">$5/month</td>
          <td className="px-6 py-4 text-center text-sm font-medium text-gray-700">$12/month</td>
        </tr>
        <tr>
          <td className="px-6 py-4"></td>
          <td className="px-6 py-4 text-center">
            <Button className="bg-gray-800 hover:bg-gray-700 text-white">Get Started</Button>
          </td>
          <td className="px-6 py-4 text-center border-x border-gray-200 bg-brand-blue/5">
            <Button className="bg-brand-blue hover:bg-brand-purple text-white">Choose Standard</Button>
          </td>
          <td className="px-6 py-4 text-center">
            <Button className="bg-gray-800 hover:bg-gray-700 text-white">Choose Pro</Button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

const Pricing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="bg-brand-light py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, Transparent <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">Pricing</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
              Choose the plan that fits your needs. All plans include our core monitoring features.
            </p>
            <p className="text-gray-500">No hidden fees. Cancel anytime.</p>
          </div>
        </div>
        
        <PricingSection />
        
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Compare Plans</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Find the plan that's right for your handle monitoring needs.
              </p>
            </div>
            
            <ComparisonTable />
            
            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Need a custom plan for your business or agency? 
                <a href="#" className="text-brand-blue hover:underline ml-1">Contact us</a> for enterprise pricing.
              </p>
            </div>
          </div>
        </section>
        
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to know about HandleHunter and our services.
              </p>
            </div>
            
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                {faqItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="flex items-start text-lg font-semibold mb-3">
                      <HelpCircle className="w-5 h-5 text-brand-blue mr-2 flex-shrink-0 mt-1" />
                      <span>{item.question}</span>
                    </h3>
                    <p className="text-gray-600 pl-7">{item.answer}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-gray-600 mb-4">Still have questions?</p>
                <Button className="bg-brand-blue hover:bg-brand-purple text-white">
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
