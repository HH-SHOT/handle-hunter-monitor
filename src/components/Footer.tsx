
import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Twitter, Instagram, Facebook, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="w-6 h-6 text-brand-blue" />
              <span className="text-xl font-bold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">HandleHunter</span>
            </div>
            <p className="text-gray-600 mb-4">
              Real-time monitoring of social media handles to help you secure your online identity.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-brand-blue transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-blue transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-blue transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-brand-blue transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-600 hover:text-brand-blue transition-colors">Features</Link></li>
              <li><Link to="/pricing" className="text-gray-600 hover:text-brand-blue transition-colors">Pricing</Link></li>
              <li><Link to="/dashboard" className="text-gray-600 hover:text-brand-blue transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">Documentation</a></li>
              <li><a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">Help Center</a></li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">© 2025 HandleHunter. All rights reserved.</p>
          <div className="mt-4 md:mt-0">
            <select className="bg-white border border-gray-300 text-gray-700 py-1 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue">
              <option>English</option>
              <option>Español</option>
              <option>Français</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
