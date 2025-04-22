
import { useState, useEffect } from 'react';
import { Handle, HandleFormData } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useDashboardData = () => {
  const { user, loading: authLoading } = useAuth();
  const [handles, setHandles] = useState<Handle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshingHandles, setRefreshingHandles] = useState<string[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    platform: 'all',
    statuses: ['available', 'unavailable', 'monitoring']
  });

  const fetchHandles = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('handles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedHandles: Handle[] = data.map(dbHandle => ({
        id: dbHandle.id,
        name: dbHandle.name,
        platform: dbHandle.platform as 'twitter' | 'instagram' | 'twitch' | 'tiktok',
        status: dbHandle.status as 'available' | 'unavailable' | 'monitoring',
        lastChecked: dbHandle.last_checked ? new Date(dbHandle.last_checked).toLocaleString() : 'never',
        notifications: dbHandle.notifications_enabled || false
      }));

      setHandles(formattedHandles);
    } catch (error) {
      console.error('Error fetching handles:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your handles. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHandle = async (formData: HandleFormData) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to add handles.',
        variant: 'destructive'
      });
      return;
    }

    try {
      const handleId = formData.id || uuidv4();
      
      const { error } = await supabase
        .from('handles')
        .insert({
          id: handleId,
          name: formData.name,
          platform: formData.platform,
          status: 'monitoring',
          user_id: user.id,
          notifications_enabled: true
        })
        .select()
        .single();
      
      if (error) throw error;
      
      await checkHandle(handleId);
      await fetchHandles();
      
      toast({
        title: 'Handle Added',
        description: `@${formData.name} is now being monitored.`,
      });

      return true;
    } catch (error) {
      console.error('Error adding handle:', error);
      toast({
        title: 'Error',
        description: 'Failed to add the handle. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleDeleteHandle = async (handle: Handle) => {
    if (!user) {
      toast({
        title: 'Demo Mode',
        description: 'Delete operations are not available in demo mode. Please sign in.',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('handles')
        .delete()
        .eq('id', handle.id);
      
      if (error) throw error;
      
      await fetchHandles();
      
      toast({
        title: 'Handle Removed',
        description: `@${handle.name} has been removed from monitoring.`,
      });
    } catch (error) {
      console.error('Error deleting handle:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove the handle. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleToggleNotifications = async (handle: Handle) => {
    if (!user) {
      toast({
        title: 'Demo Mode',
        description: 'Notification toggles are not available in demo mode. Please sign in.',
      });
      return;
    }

    try {
      const newNotificationState = !handle.notifications;
      
      const { error } = await supabase
        .from('handles')
        .update({ notifications_enabled: newNotificationState })
        .eq('id', handle.id);
      
      if (error) throw error;
      
      await fetchHandles();
      
      toast({
        title: newNotificationState ? 'Notifications Enabled' : 'Notifications Disabled',
        description: `Notifications ${newNotificationState ? 'enabled' : 'disabled'} for @${handle.name}.`,
      });
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const checkHandle = async (handleId: string) => {
    try {
      await fetch(`https://mausvzbzorurkcoruhev.supabase.co/functions/v1/check-handles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ handleId })
      });
    } catch (error) {
      console.error('Error checking handle:', error);
    }
  };

  const handleCheckHandle = async (handle: Handle) => {
    if (!user) {
      toast({
        title: 'Demo Mode',
        description: 'Check handle operation is not available in demo mode. Please sign in.',
      });
      return;
    }

    try {
      setRefreshingHandles(prev => [...prev, handle.id]);
      await checkHandle(handle.id);
      await new Promise(resolve => setTimeout(resolve, 1500));
      await fetchHandles();
      
      toast({
        title: 'Handle Checked',
        description: `@${handle.name} has been checked for availability.`,
      });
    } catch (error) {
      console.error('Error checking handle:', error);
      toast({
        title: 'Error',
        description: 'Failed to check handle. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setRefreshingHandles(prev => prev.filter(id => id !== handle.id));
    }
  };

  const handleRefreshAll = async () => {
    if (!user) {
      toast({
        title: 'Demo Mode',
        description: 'Refresh operation is not available in demo mode. Please sign in.',
      });
      return;
    }

    try {
      toast({
        title: 'Refreshing Handles',
        description: 'Checking the availability of your handles...',
      });
      
      await fetch(`https://mausvzbzorurkcoruhev.supabase.co/functions/v1/check-handles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ refresh: true })
      });
      
      await fetchHandles();
      
      toast({
        title: 'Handles Refreshed',
        description: `${handles.length} handles have been checked for availability.`,
      });
    } catch (error) {
      console.error('Error refreshing handles:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh handles. Please try again.',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchHandles();
    }
  }, [user, authLoading]);

  return {
    handles,
    isLoading,
    refreshingHandles,
    filterOptions,
    setFilterOptions,
    handleAddHandle,
    handleDeleteHandle,
    handleToggleNotifications,
    handleCheckHandle,
    handleRefreshAll,
  };
};
