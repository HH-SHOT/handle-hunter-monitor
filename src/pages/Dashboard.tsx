
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DashboardDemo from '@/components/DashboardDemo';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="bg-brand-light py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">Your Handle Dashboard</h1>
              <p className="text-gray-600 mb-8">
                Monitor and track your social media handles in one place. Get real-time notifications when your desired handles become available.
              </p>
              <Button className="bg-brand-blue hover:bg-brand-purple text-white">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
        
        <DashboardDemo />
        
        <div className="py-12 bg-gradient-to-r from-gray-50 to-brand-light">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
              <h2 className="text-2xl font-bold mb-4">Want more monitoring power?</h2>
              <p className="text-gray-600 mb-6">
                Upgrade to our Standard or Pro plan to monitor more handles, get faster checks, and access premium features.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-brand-blue rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-2">Standard Plan</h3>
                  <p className="text-gray-600 mb-4">Monitor up to 10 handles with hourly checks</p>
                  <Button className="w-full bg-brand-blue hover:bg-brand-purple text-white">
                    Upgrade to Standard - $5/month
                  </Button>
                </div>
                <div className="border border-brand-purple rounded-lg p-4 bg-gradient-to-br from-brand-blue/5 to-brand-purple/5">
                  <h3 className="font-semibold text-lg mb-2">Pro Plan</h3>
                  <p className="text-gray-600 mb-4">Monitor up to 30 handles with real-time checks</p>
                  <Button className="w-full bg-brand-purple hover:bg-brand-blue text-white">
                    Upgrade to Pro - $12/month
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
