
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Handle, DbHandle, HandleFormData } from './types';
import { formatHandlesFromDb } from './handleUtils';
import { toast } from "@/hooks/use-toast";
import { mockHandles } from './mockHandles';

export const useHandleApi = (user: any) => {
  const [loading, setLoading] = useState(true);
  const [refreshingHandles, setRefreshingHandles] = useState<string[]>([]);

  const fetchHandles = async (): Promise<Handle[]> => {
    try {
      // For demo mode or when there's no user
      if (!user) {
        setLoading(false);
        return mockHandles;
      }

      const { data, error } = await supabase
        .from('handles')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      const formattedHandles = formatHandlesFromDb(data as DbHandle[]);
      return formattedHandles.length > 0 ? formattedHandles : mockHandles;
      
    } catch (error) {
      console.error('Error fetching handles:', error);
      toast({
        title: "Error fetching handles",
        description: "There was a problem loading your handles.",
        variant: "destructive"
      });
      return mockHandles;
    } finally {
      setLoading(false);
    }
  };

  const refreshAllHandles = async (handles: Handle[]): Promise<Handle[]> => {
    setLoading(true);
    
    if (!user) {
      // Mock refresh behavior for demo mode
      const updatedHandles = handles.map(handle => {
        if (handle.status === 'monitoring') {
          // Randomly set to available or unavailable
          const newStatus = Math.random() > 0.7 ? 'available' : 'unavailable';
          return { ...handle, status: newStatus as 'available' | 'unavailable', lastChecked: new Date().toLocaleString() };
        }
        return handle;
      });
      
      toast({
        title: "Handles refreshed",
        description: "Your handles have been checked for availability.",
      });
      
      setLoading(false);
      return updatedHandles;
    }
    
    try {
      // Call the edge function to refresh all handles
      const { data, error } = await supabase.functions.invoke('check-handles', {
        body: { refresh: true }
      });
      
      if (error) throw error;
      
      if (data.success) {
        // Fetch the handles again to get the updated data
        const updatedHandles = await fetchHandles();
        
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
        
        return updatedHandles;
      }
      return handles;
    } catch (error) {
      console.error('Error refreshing handles:', error);
      toast({
        title: "Error refreshing handles",
        description: "There was a problem checking your handles.",
        variant: "destructive"
      });
      return handles;
    } finally {
      setLoading(false);
    }
  };

  const checkSingleHandle = async (handle: Handle, allHandles: Handle[]): Promise<Handle[]> => {
    if (!user) {
      // Mock check for demo mode
      const newStatus = Math.random() > 0.7 ? 'available' : 'unavailable';
      const updatedHandles = allHandles.map(h => 
        h.id === handle.id 
          ? { ...h, status: newStatus as 'available' | 'unavailable', lastChecked: new Date().toLocaleString() } 
          : h
      );
      
      toast({
        title: `@${handle.name} checked`,
        description: `This handle is now ${newStatus}.`,
      });
      
      return updatedHandles;
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
        const updatedHandles = allHandles.map(h => 
          h.id === handle.id ? { 
            ...h, 
            status: updatedHandle.status as 'available' | 'unavailable' | 'monitoring', 
            lastChecked: new Date(updatedHandle.lastChecked).toLocaleString() 
          } : h
        );
        
        toast({
          title: `@${handle.name} checked`,
          description: `This handle is now ${updatedHandle.status}.`,
        });

        return updatedHandles;
      }
      return allHandles;
    } catch (error) {
      console.error('Error checking handle:', error);
      toast({
        title: "Error checking handle",
        description: "There was a problem checking this handle.",
        variant: "destructive"
      });
      return allHandles;
    } finally {
      setRefreshingHandles(prev => prev.filter(id => id !== handle.id));
    }
  };

  const saveHandle = async (data: HandleFormData, isEditMode: boolean, allHandles: Handle[]): Promise<Handle[]> => {
    if (!user) {
      // Mock saving for demo mode
      if (isEditMode) {
        // Update existing handle
        const updatedHandles = allHandles.map(h => 
          h.id === data.id ? { ...h, name: data.name, platform: data.platform } : h
        );
        
        toast({
          title: "Handle updated",
          description: "Your handle has been updated successfully.",
        });
        
        return updatedHandles;
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
        
        toast({
          title: "Handle added",
          description: "Your new handle has been added for monitoring.",
        });
        
        return [...allHandles, newHandle];
      }
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
        
        const updatedHandles = allHandles.map(h => 
          h.id === data.id ? { ...h, name: data.name, platform: data.platform } : h
        );
        
        toast({
          title: "Handle updated",
          description: "Your handle has been updated successfully.",
        });
        
        return updatedHandles;
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
          platform: data.platform,
          status: 'monitoring',
          lastChecked: 'just now',
          notifications: true
        };
        
        toast({
          title: "Handle added",
          description: "Your new handle has been added for monitoring.",
        });
        
        return [...allHandles, formattedHandle];
      }
    } catch (error) {
      console.error('Error saving handle:', error);
      toast({
        title: "Error saving handle",
        description: "There was a problem saving your handle.",
        variant: "destructive"
      });
      return allHandles;
    }
  };

  const deleteHandle = async (handleToDelete: Handle, allHandles: Handle[]): Promise<Handle[]> => {
    if (!user) {
      // Mock deletion for demo mode
      toast({
        title: "Handle removed",
        description: "The handle has been removed from your list.",
      });
      return allHandles.filter(h => h.id !== handleToDelete.id);
    }
    
    try {
      // First, delete any associated history records (to solve foreign key constraint)
      const { error: historyError } = await supabase
        .from('handle_history')
        .delete()
        .eq('handle_id', handleToDelete.id);
      
      if (historyError) throw historyError;
      
      // Then delete the handle itself
      const { error } = await supabase
        .from('handles')
        .delete()
        .eq('id', handleToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: "Handle removed",
        description: "The handle has been removed from your monitoring list.",
      });
      
      return allHandles.filter(h => h.id !== handleToDelete.id);
    } catch (error) {
      console.error('Error deleting handle:', error);
      toast({
        title: "Error removing handle",
        description: "There was a problem removing this handle.",
        variant: "destructive"
      });
      return allHandles;
    }
  };

  const toggleNotifications = async (handle: Handle, allHandles: Handle[]): Promise<Handle[]> => {
    if (!user) {
      // Mock toggle for demo mode
      return allHandles.map(h => 
        h.id === handle.id ? { ...h, notifications: !h.notifications } : h
      );
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
      
      const updatedHandles = allHandles.map(h => 
        h.id === handle.id ? { ...h, notifications: newNotificationState } : h
      );
      
      toast({
        title: `Notifications ${newNotificationState ? 'enabled' : 'disabled'}`,
        description: `You will ${newNotificationState ? 'now' : 'no longer'} receive notifications for @${handle.name}.`,
      });
      
      return updatedHandles;
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Error updating notifications",
        description: "There was a problem updating notification settings.",
        variant: "destructive"
      });
      return allHandles;
    }
  };

  return {
    loading,
    setLoading,
    refreshingHandles,
    fetchHandles,
    refreshAllHandles,
    checkSingleHandle,
    saveHandle,
    deleteHandle,
    toggleNotifications
  };
};
