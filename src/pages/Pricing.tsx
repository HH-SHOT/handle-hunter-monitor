
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingSection from '@/components/PricingSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import { Button } from '@/components/ui/button';
import { Check, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import faqsData from '@/data/faqs.json';
import pricingData from '@/data/pricing.json';

const ComparisonTable = () => {
  const navigate = useNavigate();
  const { comparisonTable } = pricingData;
  
  const handleChoosePlan = (plan: string) => {
    navigate('/auth', { state: { selectedPlan: plan } });
  };
  
  return (
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
          {comparisonTable.features.map((feature, index) => (
            <tr key={index}>
              <td className="px-6 py-4 text-sm text-gray-700">{feature.name}</td>
              <td className="px-6 py-4 text-center text-sm text-gray-700">
                {typeof feature.free === 'boolean' ? 
                  (feature.free ? <Check className="h-5 w-5 text-green-500 mx-auto"/> : <span className="text-gray-400">—</span>) : 
                  feature.free}
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-700 border-x border-gray-200 bg-brand-blue/5">
                {typeof feature.standard === 'boolean' ? 
                  (feature.standard ? <Check className="h-5 w-5 text-green-500 mx-auto"/> : <span className="text-gray-400">—</span>) : 
                  feature.standard}
              </td>
              <td className="px-6 py-4 text-center text-sm text-gray-700">
                {typeof feature.pro === 'boolean' ? 
                  (feature.pro ? <Check className="h-5 w-5 text-green-500 mx-auto"/> : <span className="text-gray-400">—</span>) : 
                  feature.pro}
              </td>
            </tr>
          ))}
          <tr>
            <td className="px-6 py-4 text-sm text-gray-700">Price</td>
            <td className="px-6 py-4 text-center text-sm font-medium text-gray-700">${comparisonTable.prices.free}/month</td>
            <td className="px-6 py-4 text-center text-sm font-medium text-brand-blue border-x border-gray-200 bg-brand-blue/5">${comparisonTable.prices.standard}/month</td>
            <td className="px-6 py-4 text-center text-sm font-medium text-gray-700">${comparisonTable.prices.pro}/month</td>
          </tr>
          <tr>
            <td className="px-6 py-4"></td>
            <td className="px-6 py-4 text-center">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white" onClick={() => handleChoosePlan('free')}>Get Started</Button>
            </td>
            <td className="px-6 py-4 text-center border-x border-gray-200 bg-brand-blue/5">
              <Button className="bg-brand-blue hover:bg-brand-purple text-white" onClick={() => handleChoosePlan('standard')}>Choose Standard</Button>
            </td>
            <td className="px-6 py-4 text-center">
              <Button className="bg-gray-800 hover:bg-gray-700 text-white" onClick={() => handleChoosePlan('pro')}>Choose Pro</Button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

const Pricing = () => {
  const navigate = useNavigate();
  
  const handleContactSupport = () => {
    navigate('/contact', { state: { subject: 'support' } });
  };
  
  const handleContactSales = () => {
    navigate('/contact', { state: { subject: 'enterprise' } });
  };
  
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
                <Button 
                  variant="link" 
                  onClick={handleContactSales} 
                  className="text-brand-blue hover:underline ml-1"
                >
                  Contact us
                </Button> 
                for enterprise pricing.
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
                {faqsData.map((item, index) => (
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
                <Button 
                  className="bg-brand-blue hover:bg-brand-purple text-white"
                  onClick={handleContactSupport}
                >
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
