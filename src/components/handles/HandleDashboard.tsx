
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Plus,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { Handle, HandleFormData } from './types';
import { toast } from "@/hooks/use-toast";
import { supabase, HandleType } from '@/integrations/supabase/client';
import HandleList from './HandleList';
import AddHandleForm from './AddHandleForm';
import { Separator } from '@/components/ui/separator';

// Mock data for initial development
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

const HandleDashboard = () => {
  const { user } = useAuth();
  const [handles, setHandles] = useState<Handle[]>(mockHandles);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentHandle, setCurrentHandle] = useState<HandleFormData>({
    name: '',
    platform: 'twitter'
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch handles from Supabase
  useEffect(() => {
    if (user) {
      fetchHandles();
    }
  }, [user]);

  const fetchHandles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('handles')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const formattedHandles = data.map((handle: HandleType) => ({
        id: handle.id,
        name: handle.name,
        platform: handle.platform as 'twitter' | 'instagram' | 'facebook' | 'tiktok',
        status: handle.status as 'available' | 'unavailable' | 'monitoring',
        lastChecked: new Date(handle.last_checked).toLocaleString(),
        notifications: handle.notifications,
      }));
      
      setHandles(formattedHandles.length > 0 ? formattedHandles : mockHandles);
    } catch (error) {
      console.error('Error fetching handles:', error);
      toast({
        title: "Failed to Load Handles",
        description: "There was a problem loading your handles.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchHandles();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleDelete = async (handle: Handle) => {
    try {
      setLoading(true);
      // First delete any history records for this handle
      await supabase
        .from('handle_history')
        .delete()
        .eq('handle_id', handle.id);
        
      // Then delete the handle itself
      const { error } = await supabase
        .from('handles')
        .delete()
        .eq('id', handle.id);
      
      if (error) throw error;
      
      setHandles(handles.filter(h => h.id !== handle.id));
      toast({
        title: "Handle Deleted",
        description: `@${handle.name} has been removed from monitoring.`,
      });
    } catch (error) {
      console.error('Error deleting handle:', error);
      toast({
        title: "Delete Failed",
        description: "There was a problem removing this handle.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (handle: Handle) => {
    setCurrentHandle({
      id: handle.id,
      name: handle.name,
      platform: handle.platform
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setCurrentHandle({
      name: '',
      platform: 'twitter'
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleSave = async (data: HandleFormData) => {
    try {
      setLoading(true);
      if (isEditing && data.id) {
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
        
        setHandles(handles.map(h => h.id === data.id ? {
          ...h,
          name: data.name,
          platform: data.platform
        } : h));
        
        toast({
          title: "Handle Updated",
          description: `@${data.name} has been updated.`,
        });
      } else {
        // Add new handle
        const { data: newHandle, error } = await supabase
          .from('handles')
          .insert({
            name: data.name,
            platform: data.platform,
            status: 'monitoring',
            user_id: user?.id,
            notifications: true,
            last_checked: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        
        const formattedHandle: Handle = {
          id: newHandle.id,
          name: newHandle.name,
          platform: newHandle.platform,
          status: newHandle.status,
          lastChecked: 'just now',
          notifications: true
        };
        
        setHandles([formattedHandle, ...handles]);
        
        toast({
          title: "Handle Added",
          description: `@${data.name} is now being monitored.`,
        });
      }
    } catch (error) {
      console.error('Error saving handle:', error);
      toast({
        title: "Save Failed",
        description: "There was a problem saving this handle.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setIsDialogOpen(false);
    }
  };

  const handleToggleNotifications = async (handle: Handle) => {
    try {
      const newNotificationState = !handle.notifications;
      
      const { error } = await supabase
        .from('handles')
        .update({
          notifications: newNotificationState,
          updated_at: new Date().toISOString()
        })
        .eq('id', handle.id);
      
      if (error) throw error;
      
      setHandles(handles.map(h => h.id === handle.id ? {
        ...h,
        notifications: newNotificationState
      } : h));
      
      toast({
        title: newNotificationState ? "Notifications Enabled" : "Notifications Disabled",
        description: `You will ${newNotificationState ? 'now' : 'no longer'} receive alerts for @${handle.name}.`,
      });
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Update Failed",
        description: "There was a problem updating notification settings.",
        variant: "destructive"
      });
    }
  };

  const filteredHandles = handles.filter(handle => 
    handle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    handle.platform.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-4">
          <h3 className="font-semibold text-gray-800">Your Handles</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search handles..."
                className="pl-8 w-[200px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Add Handle
            </Button>
          </div>
        </div>
        
        <HandleList 
          handles={filteredHandles}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggleNotifications={handleToggleNotifications}
        />
      </div>
      
      <AddHandleForm 
        isOpen={isDialogOpen}
        isEdit={isEditing}
        initialData={currentHandle}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};

export default HandleDashboard;
