import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DashboardDemo from '@/components/DashboardDemo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { toast } from "@/hooks/use-toast";
import { supabase, SubscriptionType, PlanType, HistoryType } from '@/integrations/supabase/client';
import NotificationPreferences from '@/components/NotificationPreferences';
import SubscriptionTier from '@/components/SubscriptionTier';
import { upgradeToPlan } from '@/utils/planUtils';
import {
  User,
  LogOut,
  Settings,
  CreditCard,
  Bell,
  BarChart3,
  RefreshCw
} from 'lucide-react';

interface SubscriptionWithPlan {
  id: string;
  status: string;
  expires_at: string | null;
  plans: {
    id: string;
    name: string;
    price: number;
    handle_limit: number;
    check_frequency: string;
  }
}

interface HistoryItem {
  id: string;
  checked_at: string;
  status: string;
  handles: {
    name: string;
    platform: string;
  }
}

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [handleUsage, setHandleUsage] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchSubscriptionData(user.id);
      fetchHistoryData();
      fetchHandleUsage();
    }
    setLoading(false);
  }, [user]);

  const fetchSubscriptionData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          plans:plan_id(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();
      
      if (error) throw error;
      
      setSubscription(data || { 
        id: '', 
        status: 'active', 
        expires_at: null, 
        plans: { 
          id: '', 
          name: 'Free', 
          price: 0, 
          handle_limit: 3, 
          check_frequency: 'daily' 
        } 
      });
    } catch (error) {
      console.error('Error fetching subscription:', error);
      toast({
        title: "Subscription Data Error",
        description: "There was a problem loading your subscription data.",
        variant: "destructive"
      });
    }
  };

  const fetchHistoryData = async () => {
    try {
      const { data, error } = await supabase
        .from('handle_history')
        .select(`
          *,
          handles:handle_id(name, platform)
        `)
        .order('checked_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchHandleUsage = async () => {
    if (!user) return setHandleUsage(0);
    const { data, error } = await supabase
      .from("handles")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user?.id);
    setHandleUsage(data?.length || 0);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleUpgrade = async (planName: 'Standard' | 'Pro') => {
    if (!user) return;
    
    const success = await upgradeToPlan(user.id, planName);
    
    if (success && user) {
      fetchSubscriptionData(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-brand-blue mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <ProtectedRoute>
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
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 flex items-center">
                    <div className="bg-brand-blue/10 rounded-full p-2 mr-3">
                      <User className="w-5 h-5 text-brand-blue" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 flex items-center">
                    <div className="bg-brand-purple/10 rounded-full p-2 mr-3">
                      <CreditCard className="w-5 h-5 text-brand-purple" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-500">Current Plan</p>
                      <p className="font-medium">{subscription?.plans?.name || 'Free'}</p>
                    </div>
                  </div>
                  
                  <Button variant="outline" className="border-gray-300" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="py-12">
            <div className="container mx-auto px-4">
              <div className="max-w-5xl mx-auto">
                <Tabs defaultValue="handles" className="space-y-8">
                  <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
                    <TabsTrigger value="handles">My Handles</TabsTrigger>
                    <TabsTrigger value="history">History</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="handles" className="p-1">
                    <DashboardDemo />
                  </TabsContent>
                  
                  <TabsContent value="history" className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                      <div className="border-b border-gray-200 p-4 bg-gray-50">
                        <h3 className="font-semibold text-gray-800">Recent Handle Status Changes</h3>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Handle</TableHead>
                              <TableHead>Platform</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Changed At</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {history.length > 0 ? (
                              history.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">@{item.handles?.name}</TableCell>
                                  <TableCell>{item.handles?.platform}</TableCell>
                                  <TableCell>
                                    <span 
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        item.status === 'available' 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-red-100 text-red-800'
                                      }`}
                                    >
                                      {item.status === 'available' ? 'Available' : 'Unavailable'}
                                    </span>
                                  </TableCell>
                                  <TableCell>
                                    {new Date(item.checked_at).toLocaleString()}
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                  No history available yet. Status changes will appear here.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                    
                    <NotificationPreferences 
                      defaultPreferences={{
                        email: true,
                        push: true,
                        sms: false,
                        frequency: 'immediate'
                      }}
                      onSave={(preferences) => {
                        console.log('Saved preferences:', preferences);
                        // Here you would typically save to Supabase
                      }}
                    />
                  </TabsContent>
                  
                  <TabsContent value="account" className="space-y-6">
                    <SubscriptionTier 
                      currentPlan={{
                        name: subscription?.plans?.name || 'Free',
                        price: subscription?.plans?.price || 0,
                        handleLimit: subscription?.plans?.handle_limit || 3,
                        checkFrequency: subscription?.plans?.check_frequency || 'daily',
                        usedHandles: handleUsage
                      }}
                      onUpgrade={handleUpgrade}
                    />
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex items-start mb-4">
                        <div className="rounded-full bg-blue-100 p-2 mr-4">
                          <Settings className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">Account Settings</h3>
                          <p className="text-gray-600 mb-4">Manage your account details and preferences.</p>
                          
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                              <input 
                                type="email" 
                                value={user?.email} 
                                disabled 
                                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4 mt-4 flex justify-between">
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                          Delete Account
                        </Button>
                        <Button onClick={handleSignOut} variant="outline">
                          <LogOut className="w-4 h-4 mr-2" /> Sign Out
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
          
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
                    <Button 
                      className="w-full bg-brand-blue hover:bg-brand-purple text-white"
                      onClick={() => handleUpgrade('Standard')}
                    >
                      Upgrade to Standard - $5/month
                    </Button>
                  </div>
                  <div className="border border-brand-purple rounded-lg p-4 bg-gradient-to-br from-brand-blue/5 to-brand-purple/5">
                    <h3 className="font-semibold text-lg mb-2">Pro Plan</h3>
                    <p className="text-gray-600 mb-4">Monitor up to 30 handles with real-time checks</p>
                    <Button 
                      className="w-full bg-brand-purple hover:bg-brand-blue text-white"
                      onClick={() => handleUpgrade('Pro')}
                    >
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
    </ProtectedRoute>
  );
};

export default Dashboard;
