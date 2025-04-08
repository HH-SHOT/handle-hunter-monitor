
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  return (
    <div className="pt-24 pb-16 md:pt-32 md:pb-24 bg-gradient-to-br from-brand-light via-white to-brand-light">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-12 md:mb-0 md:pr-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">Monitor Social Media Handles</span> in Real-time
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-lg">
              Track and secure the perfect username across platforms. Get notified instantly when your desired handles become available.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Button className="bg-brand-blue hover:bg-brand-purple text-white px-8 py-6 text-lg">
                Get Started Free
              </Button>
              <Button variant="outline" className="group border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white px-8 py-6 text-lg">
                See How It Works
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
          <div className="md:w-1/2">
            <div className="bg-white rounded-xl shadow-xl p-4 md:p-6 border border-gray-100">
              <div className="rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 p-4 md:p-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center mr-4">
                      <span className="text-brand-blue font-semibold">@</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-10 bg-white rounded-md border border-gray-200 flex items-center px-4">
                        <span className="text-gray-800">productlaunch</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center justify-center h-10 w-24 rounded-md bg-red-100 text-red-600 font-medium text-sm">
                      Taken
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center mr-4">
                      <span className="text-brand-blue font-semibold">@</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-10 bg-white rounded-md border border-gray-200 flex items-center px-4">
                        <span className="text-gray-800">launch_app</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center justify-center h-10 w-24 rounded-md bg-green-100 text-green-600 font-medium text-sm">
                      Available
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-brand-blue/10 flex items-center justify-center mr-4">
                      <span className="text-brand-blue font-semibold">@</span>
                    </div>
                    <div className="flex-1">
                      <div className="h-10 bg-white rounded-md border border-gray-200 flex items-center px-4">
                        <span className="text-gray-800">newproduct</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center justify-center h-10 w-24 rounded-md bg-amber-100 text-amber-600 font-medium text-sm animate-pulse-slow">
                      Monitoring
                    </div>
                  </div>
                  
                  <div className="pt-3">
                    <Button className="w-full bg-brand-blue hover:bg-brand-purple text-white py-5">
                      Add Handle to Monitor
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
