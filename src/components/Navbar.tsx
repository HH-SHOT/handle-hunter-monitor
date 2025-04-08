
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bell, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-sm py-4 fixed top-0 w-full z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Bell className="w-6 h-6 text-brand-blue" />
          <span className="text-xl font-bold bg-gradient-to-r from-brand-blue to-brand-purple bg-clip-text text-transparent">HandleHunter</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-brand-blue transition-colors">Home</Link>
          <Link to="/features" className="text-gray-700 hover:text-brand-blue transition-colors">Features</Link>
          <Link to="/pricing" className="text-gray-700 hover:text-brand-blue transition-colors">Pricing</Link>
          <Link to="/dashboard" className="text-gray-700 hover:text-brand-blue transition-colors">Dashboard</Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white transition-colors">
            Login
          </Button>
          <Button className="bg-brand-blue hover:bg-brand-purple text-white transition-colors">
            Get Started
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="md:hidden text-gray-700">
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white p-4 shadow-lg absolute top-16 left-0 right-0">
          <div className="flex flex-col space-y-4">
            <Link to="/" className="text-gray-700 hover:text-brand-blue transition-colors py-2">Home</Link>
            <Link to="/features" className="text-gray-700 hover:text-brand-blue transition-colors py-2">Features</Link>
            <Link to="/pricing" className="text-gray-700 hover:text-brand-blue transition-colors py-2">Pricing</Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-brand-blue transition-colors py-2">Dashboard</Link>
            <div className="flex flex-col space-y-2 pt-2 border-t">
              <Button variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white w-full">
                Login
              </Button>
              <Button className="bg-brand-blue hover:bg-brand-purple text-white w-full">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
