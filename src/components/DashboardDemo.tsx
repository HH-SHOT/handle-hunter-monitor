
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Bell, 
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  MoreVertical,
  Twitter,
  Instagram,
  Facebook,
  TrendingUp
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';

interface Handle {
  id: string;
  name: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok';
  status: 'available' | 'unavailable' | 'monitoring';
  lastChecked: string;
  notifications: boolean;
}

const mockHandles: Handle[] = [
  { 
    id: '1', 
    name: 'productlaunch', 
    platform: 'twitter',
    status: 'unavailable', 
    lastChecked: '2 minutes ago',
    notifications: true
  },
  { 
    id: '2', 
    name: 'appmaker', 
    platform: 'instagram',
    status: 'available', 
    lastChecked: '5 minutes ago',
    notifications: true
  },
  { 
    id: '3', 
    name: 'techbrand', 
    platform: 'twitter',
    status: 'monitoring', 
    lastChecked: 'just now',
    notifications: true
  },
  { 
    id: '4', 
    name: 'newproduct', 
    platform: 'facebook',
    status: 'unavailable', 
    lastChecked: '15 minutes ago',
    notifications: false
  },
  { 
    id: '5', 
    name: 'digitalservices', 
    platform: 'twitter',
    status: 'unavailable', 
    lastChecked: '32 minutes ago',
    notifications: true
  }
];

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-4 w-4" />;
    case 'instagram':
      return <Instagram className="h-4 w-4" />;
    case 'facebook':
      return <Facebook className="h-4 w-4" />;
    case 'tiktok':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <Twitter className="h-4 w-4" />;
  }
};

const getStatusComponent = (status: string) => {
  switch (status) {
    case 'available':
      return (
        <div className="flex items-center text-green-600">
          <CheckCircle2 className="h-4 w-4 mr-1" />
          <span>Available</span>
        </div>
      );
    case 'unavailable':
      return (
        <div className="flex items-center text-red-600">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>Unavailable</span>
        </div>
      );
    case 'monitoring':
      return (
        <div className="flex items-center text-amber-600 animate-pulse-slow">
          <Clock className="h-4 w-4 mr-1" />
          <span>Monitoring</span>
        </div>
      );
    default:
      return null;
  }
};

const DashboardDemo = () => {
  const [handles, setHandles] = useState<Handle[]>(mockHandles);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newHandle, setNewHandle] = useState({
    name: '',
    platform: 'twitter' as const
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
      
      if (data.session) {
        fetchHandles();
      }
    };
    
    checkAuth();
  }, []);

  const fetchHandles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('handles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedHandles = data.map(h => ({
          id: h.id,
          name: h.name,
          platform: h.platform,
          status: h.status,
          lastChecked: formatTimeAgo(h.last_checked),
          notifications: h.notifications_enabled
        }));
        setHandles(formattedHandles);
      }
    } catch (error) {
      console.error('Error fetching handles:', error);
      toast({
        title: "Error fetching handles",
        description: "There was a problem loading your handles.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'never';
    
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newHandle.name.trim()) {
      toast({
        title: "Handle name required",
        description: "Please enter a handle name to monitor.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    try {
      // Normalize handle name (remove @ if present)
      const normalizedName = newHandle.name.replace(/^@/, '');
      
      const { data, error } = await supabase
        .from('handles')
        .insert({
          name: normalizedName,
          platform: newHandle.platform,
          status: 'monitoring',
          last_checked: new Date().toISOString(),
          notifications_enabled: true
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Handle added successfully",
        description: `Now monitoring @${normalizedName} on ${newHandle.platform}`,
      });
      
      if (data && data[0]) {
        const newHandleObj = {
          id: data[0].id,
          name: normalizedName,
          platform: newHandle.platform,
          status: 'monitoring',
          lastChecked: 'just now',
          notifications: true
        };
        
        setHandles(prev => [newHandleObj, ...prev]);
      }
      
      setNewHandle({ name: '', platform: 'twitter' });
      setShowAddForm(false);
    } catch (error: any) {
      console.error('Error adding handle:', error);
      toast({
        title: "Error adding handle",
        description: error.message || "There was a problem adding your handle.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNotifications = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('handles')
        .update({ notifications_enabled: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setHandles(prev => 
        prev.map(handle => 
          handle.id === id 
            ? { ...handle, notifications: !currentStatus } 
            : handle
        )
      );
      
      toast({
        title: `Notifications ${!currentStatus ? 'enabled' : 'disabled'}`,
        description: `You will ${!currentStatus ? 'now' : 'no longer'} receive notifications for this handle.`,
      });
    } catch (error: any) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Error updating notifications",
        description: error.message || "There was a problem updating your notification settings.",
        variant: "destructive"
      });
    }
  };

  const refreshHandles = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.functions.invoke('check-handles', {
        body: { refresh: true }
      });
      
      if (error) throw error;
      
      toast({
        title: "Refresh initiated",
        description: "Your handles are being checked for availability. This may take a moment.",
      });
      
      // Wait a moment then refresh the data
      setTimeout(() => {
        fetchHandles();
      }, 2000);
    } catch (error: any) {
      console.error('Error refreshing handles:', error);
      toast({
        title: "Error refreshing handles",
        description: error.message || "There was a problem checking your handles.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const deleteHandle = async (id: string) => {
    try {
      const { error } = await supabase
        .from('handles')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setHandles(prev => prev.filter(handle => handle.id !== id));
      
      toast({
        title: "Handle removed",
        description: "The handle has been removed from monitoring.",
      });
    } catch (error: any) {
      console.error('Error deleting handle:', error);
      toast({
        title: "Error removing handle",
        description: error.message || "There was a problem removing your handle.",
        variant: "destructive"
      });
    }
  };

  const filteredHandles = handles.filter(handle => 
    handle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    handle.platform.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section className="py-10 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Monitor Your Handles</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Track the availability of your desired social media handles across platforms. Get notified when they become available.
          </p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-4xl mx-auto">
          <div className="border-b border-gray-200 p-4 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-800">Handle Monitor</h3>
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-sm"
                onClick={refreshHandles}
                disabled={isLoading || !isAuthenticated}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                size="sm" 
                className="bg-brand-blue hover:bg-brand-purple text-white text-sm"
                onClick={() => setShowAddForm(!showAddForm)}
                disabled={!isAuthenticated}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Handle
              </Button>
            </div>
          </div>
          
          {showAddForm && (
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <form onSubmit={handleAddSubmit} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Enter handle name (e.g. handlesaas)"
                    value={newHandle.name}
                    onChange={(e) => setNewHandle(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div className="sm:w-1/4">
                  <select 
                    value={newHandle.platform}
                    onChange={(e) => setNewHandle(prev => ({ ...prev, platform: e.target.value as 'twitter' | 'instagram' | 'facebook' | 'tiktok' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="twitter">Twitter</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <Button type="submit" disabled={isLoading} className="bg-brand-blue hover:bg-brand-purple text-white">
                  {isLoading ? 'Adding...' : 'Add'}
                </Button>
              </form>
            </div>
          )}
          
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Search handles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline" size="sm" className="sm:w-auto">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {filteredHandles.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Handle
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Checked
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredHandles.map((handle) => (
                    <tr key={handle.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                            {getPlatformIcon(handle.platform)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">@{handle.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {getStatusComponent(handle.status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {handle.lastChecked}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => toggleNotifications(handle.id, handle.notifications)}
                          >
                            <Bell className={`h-4 w-4 ${handle.notifications ? 'text-brand-blue' : 'text-gray-400'}`} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => deleteHandle(handle.id)}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <div className="text-gray-500 mb-4">No handles found</div>
                {!isAuthenticated ? (
                  <div className="text-sm text-gray-400">
                    Sign in to start monitoring handles
                  </div>
                ) : searchTerm ? (
                  <div className="text-sm text-gray-400">
                    No handles match your search
                  </div>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={() => setShowAddForm(true)}
                    className="bg-brand-blue hover:bg-brand-purple text-white"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add your first handle
                  </Button>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">
              {isAuthenticated ? (
                <>Showing {filteredHandles.length} of {handles.length} handles. <a href="/dashboard" className="text-brand-blue hover:underline">View all in dashboard</a></>
              ) : (
                <a href="/dashboard" className="text-brand-blue hover:underline">Sign in to start monitoring handles</a>
              )}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardDemo;
