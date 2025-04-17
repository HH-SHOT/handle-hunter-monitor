
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  RefreshCw, 
  PlusCircle,
  Bell,
  BellOff,
  Trash2,
  Search,
  Filter
} from 'lucide-react';
import { Handle, HandleFormData, DbHandle } from './types';
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import HandleList from './HandleList';
import AddHandleForm from './AddHandleForm';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockHandles } from './mockHandles';

// Validation functions
const validateHandles = (handles: Handle[]): string | null => {
  if (handles.length === 0) {
    return "Please add at least one handle to monitor";
  }
  return null;
};

const validateEmail = (email: string): string | null => {
  if (!email) {
    return "Email is required for notifications";
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  
  return null;
};

const HandleDashboard = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedHandle, setSelectedHandle] = useState<HandleFormData>({
    name: '',
    platform: 'twitter'
  });
  const [handles, setHandles] = useState<Handle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingHandles, setRefreshingHandles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    handles: string | null;
    email: string | null;
  }>({
    handles: null,
    email: null,
  });

  useEffect(() => {
    if (user) {
      fetchHandles();
    } else {
      setHandles(mockHandles);
      setLoading(false);
    }
  }, [user]);

  const fetchHandles = async () => {
    try {
      const { data, error } = await supabase
        .from('handles')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      const formattedHandles: Handle[] = data.map((handle: DbHandle) => ({
        id: handle.id,
        name: handle.name,
        platform: convertToPlatformType(handle.platform),
        status: convertToStatusType(handle.status),
        lastChecked: handle.last_checked ? new Date(handle.last_checked).toLocaleString() : 'never',
        notifications: handle.notifications_enabled !== null ? handle.notifications_enabled : true,
      }));
      
      setHandles(formattedHandles.length > 0 ? formattedHandles : mockHandles);
      
    } catch (error) {
      console.error('Error fetching handles:', error);
      toast({
        title: "Error fetching handles",
        description: "There was a problem loading your handles.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert platform string to our type
  const convertToPlatformType = (platform: string): 'twitter' | 'instagram' | 'facebook' | 'tiktok' => {
    if (platform === 'twitter' || platform === 'instagram' || platform === 'facebook' || platform === 'tiktok') {
      return platform;
    }
    return 'twitter'; // Default fallback
  };

  // Helper function to convert status string to our type
  const convertToStatusType = (status: string): 'available' | 'unavailable' | 'monitoring' => {
    if (status === 'available' || status === 'unavailable' || status === 'monitoring') {
      return status;
    }
    return 'monitoring'; // Default fallback
  };

  const handleRefresh = async () => {
    setLoading(true);
    
    if (!user) {
      // Mock refresh behavior for demo mode
      const updatedHandles = handles.map(handle => {
        if (handle.status === 'monitoring') {
          // Randomly set to available or unavailable
          const newStatus = Math.random() > 0.7 ? 'available' : 'unavailable';
          return { ...handle, status: newStatus, lastChecked: new Date().toLocaleString() };
        }
        return handle;
      });
      
      setHandles(updatedHandles);
      setLoading(false);
      
      toast({
        title: "Handles refreshed",
        description: "Your handles have been checked for availability.",
      });
      
      return;
    }
    
    try {
      // Call the edge function to refresh all handles
      const { data, error } = await supabase.functions.invoke('check-handles', {
        body: { refresh: true }
      });
      
      if (error) throw error;
      
      if (data.success) {
        // Fetch the handles again to get the updated data
        await fetchHandles();
        
        // Check if any handles changed status
        const changedHandles = data.results?.filter((result: any) => result.changed) || [];
        
        if (changedHandles.length > 0) {
          toast({
            title: `${changedHandles.length} handle${changedHandles.length > 1 ? 's' : ''} updated`,
            description: "Status changes have been detected during refresh.",
            variant: "default"
          });
        } else {
          toast({
            title: "Handles refreshed",
            description: "No status changes detected.",
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing handles:', error);
      toast({
        title: "Error refreshing handles",
        description: "There was a problem checking your handles.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckSingleHandle = async (handle: Handle) => {
    if (!user) {
      // Mock check for demo mode
      const newStatus = Math.random() > 0.7 ? 'available' : 'unavailable';
      setHandles(handles.map(h => 
        h.id === handle.id ? { ...h, status: newStatus, lastChecked: new Date().toLocaleString() } : h
      ));
      
      toast({
        title: `@${handle.name} checked`,
        description: `This handle is now ${newStatus}.`,
      });
      
      return;
    }
    
    try {
      setRefreshingHandles(prev => [...prev, handle.id]);
      
      // Call the edge function to check just this handle
      const { data, error } = await supabase.functions.invoke('check-handles', {
        body: { handleId: handle.id }
      });
      
      if (error) throw error;
      
      if (data.success && data.handle) {
        const updatedHandle = data.handle;
        
        // Update this handle in the local state
        setHandles(handles.map(h => 
          h.id === handle.id ? { 
            ...h, 
            status: convertToStatusType(updatedHandle.status), 
            lastChecked: new Date(updatedHandle.lastChecked).toLocaleString() 
          } : h
        ));
        
        toast({
          title: `@${handle.name} checked`,
          description: `This handle is now ${updatedHandle.status}.`,
        });
      }
    } catch (error) {
      console.error('Error checking handle:', error);
      toast({
        title: "Error checking handle",
        description: "There was a problem checking this handle.",
        variant: "destructive"
      });
    } finally {
      setRefreshingHandles(prev => prev.filter(id => id !== handle.id));
    }
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setSelectedHandle({
      name: '',
      platform: 'twitter'
    });
    setIsFormOpen(true);
  };

  const handleEdit = (handle: Handle) => {
    setIsEditMode(true);
    setSelectedHandle({
      id: handle.id,
      name: handle.name,
      platform: handle.platform
    });
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (type: 'platform' | 'status', value: string | null) => {
    if (type === 'platform') {
      setPlatformFilter(value);
    } else {
      setStatusFilter(value);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setPlatformFilter(null);
    setStatusFilter(null);
  };

  const getFilteredHandles = () => {
    return handles.filter(handle => {
      // Filter by search query
      const matchesSearch = handle.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by platform
      const matchesPlatform = !platformFilter || handle.platform === platformFilter;
      
      // Filter by status
      const matchesStatus = !statusFilter || handle.status === statusFilter;
      
      return matchesSearch && matchesPlatform && matchesStatus;
    });
  };

  const handleDelete = async (handleToDelete: Handle) => {
    if (!user) {
      // Mock deletion for demo mode
      setHandles(handles.filter(h => h.id !== handleToDelete.id));
      toast({
        title: "Handle removed",
        description: "The handle has been removed from your list.",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from('handles')
        .delete()
        .eq('id', handleToDelete.id);
      
      if (error) throw error;
      
      setHandles(handles.filter(h => h.id !== handleToDelete.id));
      
      toast({
        title: "Handle removed",
        description: "The handle has been removed from your monitoring list.",
      });
    } catch (error) {
      console.error('Error deleting handle:', error);
      toast({
        title: "Error removing handle",
        description: "There was a problem removing this handle.",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const handlesError = validateHandles(handles);
    const emailError = validateEmail(email);

    setErrors({
      handles: handlesError,
      email: emailError,
    });

    // If no errors, submit form
    if (!handlesError && !emailError) {
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);

        // Reset after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }, 1500);
    }
  };

  const handleSaveHandle = async (data: HandleFormData) => {
    if (!user) {
      // Mock saving for demo mode
      if (isEditMode) {
        // Update existing handle
        setHandles(handles.map(h => 
          h.id === data.id ? { ...h, name: data.name, platform: data.platform } : h
        ));
      } else {
        // Add new handle
        const newHandle: Handle = {
          id: `mock-${Date.now()}`,
          name: data.name,
          platform: data.platform,
          status: 'monitoring',
          lastChecked: 'just now',
          notifications: true
        };
        setHandles([...handles, newHandle]);
      }
      
      setIsFormOpen(false);
      toast({
        title: isEditMode ? "Handle updated" : "Handle added",
        description: isEditMode 
          ? "Your handle has been updated successfully." 
          : "Your new handle has been added for monitoring.",
      });
      return;
    }
    
    try {
      if (isEditMode && data.id) {
        // Update existing handle
        const { error } = await supabase
          .from('handles')
          .update({
            name: data.name,
            platform: data.platform,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
        
        if (error) throw error;
        
        setHandles(handles.map(h => 
          h.id === data.id ? { ...h, name: data.name, platform: data.platform } : h
        ));
        
      } else {
        // Add new handle
        const { data: newHandle, error } = await supabase
          .from('handles')
          .insert({
            name: data.name,
            platform: data.platform,
            status: 'monitoring',
            user_id: user?.id,
            notifications_enabled: true,
            last_checked: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        
        const formattedHandle: Handle = {
          id: newHandle.id,
          name: newHandle.name,
          platform: convertToPlatformType(newHandle.platform),
          status: convertToStatusType(newHandle.status),
          lastChecked: 'just now',
          notifications: true
        };
        
        setHandles([...handles, formattedHandle]);
      }
      
      setIsFormOpen(false);
      
      toast({
        title: isEditMode ? "Handle updated" : "Handle added",
        description: isEditMode 
          ? "Your handle has been updated successfully." 
          : "Your new handle has been added for monitoring.",
      });
    } catch (error) {
      console.error('Error saving handle:', error);
      toast({
        title: "Error saving handle",
        description: "There was a problem saving your handle.",
        variant: "destructive"
      });
    }
  };

  const handleToggleNotifications = async (handle: Handle) => {
    if (!user) {
      // Mock toggle for demo mode
      setHandles(handles.map(h => 
        h.id === handle.id ? { ...h, notifications: !h.notifications } : h
      ));
      return;
    }
    
    const newNotificationState = !handle.notifications;
    
    try {
      const { error } = await supabase
        .from('handles')
        .update({
          notifications_enabled: newNotificationState,
          updated_at: new Date().toISOString()
        })
        .eq('id', handle.id);
      
      if (error) throw error;
      
      setHandles(handles.map(h => 
        h.id === handle.id ? { ...h, notifications: newNotificationState } : h
      ));
      
      toast({
        title: `Notifications ${newNotificationState ? 'enabled' : 'disabled'}`,
        description: `You will ${newNotificationState ? 'now' : 'no longer'} receive notifications for @${handle.name}.`,
      });
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Error updating notifications",
        description: "There was a problem updating notification settings.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Handles</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh All'}
          </Button>
          
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Handle
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input 
              placeholder="Search handles..." 
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex gap-2">
            <select 
              className="px-3 py-2 border rounded-md bg-white text-sm"
              value={platformFilter || ''}
              onChange={(e) => handleFilterChange('platform', e.target.value || null)}
            >
              <option value="">All Platforms</option>
              <option value="twitter">Twitter</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
            </select>
            
            <select 
              className="px-3 py-2 border rounded-md bg-white text-sm"
              value={statusFilter || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || null)}
            >
              <option value="">All Statuses</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="monitoring">Monitoring</option>
            </select>
            
            <Button variant="ghost" size="sm" onClick={handleClearFilters}>
              Clear
            </Button>
          </div>
        </div>
        
        <div className="mb-4">
          {errors.handles && (
            <div className="text-red-500 text-sm mb-2">{errors.handles}</div>
          )}
        </div>
        
        <HandleList
          handles={getFilteredHandles()}
          loading={loading}
          refreshingHandles={refreshingHandles}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onToggleNotifications={handleToggleNotifications}
          onCheckHandle={handleCheckSingleHandle}
        />
        
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="border-t pt-6">
            <h3 className="font-medium mb-2">Notification Settings</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
                  Email for notifications
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                )}
              </div>
              <div className="flex items-end">
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isSuccess}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? 'Saving...' : isSuccess ? 'Saved!' : 'Save Settings'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <AddHandleForm
        isOpen={isFormOpen}
        isEdit={isEditMode}
        initialData={selectedHandle}
        onClose={handleClose}
        onSave={handleSaveHandle}
      />
    </div>
  );
};

export default HandleDashboard;
