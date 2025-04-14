
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, CheckCircle2, ArrowUpRight, Clock } from 'lucide-react';
import { upgradeToPlan } from "@/utils/planUtils";
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionTierProps {
  currentPlan: {
    name: string;
    price: number;
    handleLimit: number;
    checkFrequency: string;
    usedHandles?: number;
  };
  onUpgrade?: (plan: string) => void;
}

const SubscriptionTier: React.FC<SubscriptionTierProps> = ({
  currentPlan,
  onUpgrade
}) => {
  const { user } = useAuth();
  
  const getPlanColor = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return 'bg-gray-100 text-gray-800';
      case 'standard':
        return 'bg-blue-100 text-blue-800';
      case 'pro':
        return 'bg-purple-100 text-purple-800';
      case 'business':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFeaturesByPlan = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free':
        return [
          'Monitor up to 3 handles',
          'Daily availability checks',
          'Email notifications',
          'Basic dashboard'
        ];
      case 'standard':
        return [
          'Monitor up to 10 handles',
          'Hourly availability checks',
          'Email & push notifications',
          'Full dashboard access',
          'Priority support'
        ];
      case 'pro':
        return [
          'Monitor up to 30 handles',
          'Real-time availability checks',
          'All notification types',
          'Advanced analytics',
          'Priority support',
          'API access'
        ];
      case 'business':
        return [
          'Unlimited handles',
          'Real-time availability checks',
          'All notification types',
          'Advanced analytics',
          'Dedicated support',
          'API access',
          'Custom integration'
        ];
      default:
        return ['No features available'];
    }
  };

  const handleUpgrade = async (planName: string) => {
    if (!user) return;
    
    if (onUpgrade) {
      onUpgrade(planName);
    } else {
      // Use default upgrade function
      await upgradeToPlan(user.id, planName as 'Standard' | 'Pro');
    }
  };

  // Calculate usage percentage
  const usagePercentage = currentPlan.usedHandles 
    ? Math.min(Math.round((currentPlan.usedHandles / currentPlan.handleLimit) * 100), 100) 
    : 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start mb-6">
        <div className="rounded-full bg-green-100 p-2 mr-4">
          <CreditCard className="h-5 w-5 text-green-600" />
        </div>
        <div>
          <div className="flex items-center mb-2">
            <h3 className="font-semibold text-lg mr-3">Your Subscription</h3>
            <Badge className={getPlanColor(currentPlan.name)}>
              {currentPlan.name} Plan
            </Badge>
          </div>
          <p className="text-gray-600 mb-4">
            {currentPlan.name === 'Free' 
              ? 'You are currently on the free plan with limited features.' 
              : `You are paying $${currentPlan.price}/month for the ${currentPlan.name} plan.`}
          </p>
        </div>
      </div>

      {/* Usage Bar */}
      {currentPlan.usedHandles !== undefined && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Handle Usage</span>
            <span className="text-sm font-medium">
              {currentPlan.usedHandles} / {currentPlan.handleLimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full ${
                usagePercentage > 90 ? 'bg-red-500' : 
                usagePercentage > 70 ? 'bg-yellow-500' : 'bg-green-500'
              }`} 
              style={{ width: `${usagePercentage}%` }}
            ></div>
          </div>
          {usagePercentage > 80 && (
            <p className="text-sm text-amber-600 mt-2 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              You're approaching your handle limit. Consider upgrading.
            </p>
          )}
        </div>
      )}

      {/* Plan Features */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 mb-3">Plan Features</h4>
        <ul className="space-y-2">
          {getFeaturesByPlan(currentPlan.name).map((feature, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade Button - only show if not on Business plan */}
      {currentPlan.name.toLowerCase() !== 'business' && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-sm text-gray-600 mb-4">
            Upgrade your plan to unlock more features and monitor more handles.
          </p>
          <div className="flex space-x-2">
            {currentPlan.name.toLowerCase() !== 'standard' && currentPlan.name.toLowerCase() !== 'pro' && (
              <Button 
                onClick={() => handleUpgrade('Standard')} 
                className="flex-1 bg-brand-blue hover:bg-brand-purple text-white"
              >
                Upgrade to Standard
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            )}
            {currentPlan.name.toLowerCase() !== 'pro' && currentPlan.name.toLowerCase() !== 'business' && (
              <Button 
                onClick={() => handleUpgrade('Pro')} 
                className="flex-1 bg-brand-purple hover:bg-brand-blue text-white"
              >
                Upgrade to Pro
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionTier;
