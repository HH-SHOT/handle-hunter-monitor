import { useState } from 'react';
import { Handle, HandleFormData } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useHandleOperations = () => {
  const { user } = useAuth();
  const [refreshingHandles, setRefreshingHandles] = useState<string[]>([]);

  const handleAddHandle = async (formData: HandleFormData) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to add handles.',
        variant: 'destructive'
      });
      return false;
    }

    try {
      const handleId = formData.id || uuidv4();
      
      console.log('DEBUG: Attempting to add handle', {
        handleId,
        name: formData.name,
        platform: formData.platform,
        userId: user.id
      });
      
      const { data, error } = await supabase
        .from('handles')
        .insert({
          id: handleId,
          name: formData.name,
          platform: formData.platform,
          status: 'monitoring',
          user_id: user.id,
          notifications_enabled: true,
          monitoring_enabled: true
        })
        .select()
        .single();
      
      if (error) {
        console.error('ERROR: Failed to add handle', {
          error: error.message,
          details: error
        });
        toast({
          title: 'Handle Addition Error',
          description: `Could not add handle: ${error.message}`,
          variant: 'destructive'
        });
        return false;
      }
      
      console.log('DEBUG: Handle added successfully', { handle: data });
      
      await checkHandle(handleId);
      
      toast({
        title: 'Handle Added',
        description: `@${formData.name} is now being monitored.`,
      });

      return true;
    } catch (error) {
      console.error('CRITICAL: Unexpected error in handleAddHandle', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
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
      return false;
    }

    try {
      const { error } = await supabase
        .from('handles')
        .delete()
        .eq('id', handle.id);
      
      if (error) throw error;
      
      toast({
        title: 'Handle Removed',
        description: `@${handle.name} has been removed from monitoring.`,
      });
      return true;
    } catch (error) {
      console.error('Error deleting handle:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove the handle. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleToggleNotifications = async (handle: Handle) => {
    if (!user) {
      toast({
        title: 'Demo Mode',
        description: 'Notification toggles are not available in demo mode. Please sign in.',
      });
      return false;
    }

    try {
      const newNotificationState = !handle.notifications;
      
      const { error } = await supabase
        .from('handles')
        .update({ notifications_enabled: newNotificationState })
        .eq('id', handle.id);
      
      if (error) throw error;
      
      toast({
        title: newNotificationState ? 'Notifications Enabled' : 'Notifications Disabled',
        description: `Notifications ${newNotificationState ? 'enabled' : 'disabled'} for @${handle.name}.`,
      });
      return true;
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification settings. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleToggleMonitoring = async (handle: Handle) => {
    if (!user) {
      toast({
        title: 'Demo Mode',
        description: 'Monitoring toggles are not available in demo mode. Please sign in.',
      });
      return false;
    }

    try {
      const newMonitoringState = !handle.monitoringEnabled;
      
      const { error } = await supabase
        .from('handles')
        .update({ monitoring_enabled: newMonitoringState })
        .eq('id', handle.id);
      
      if (error) throw error;
      
      toast({
        title: newMonitoringState ? 'Monitoring Enabled' : 'Monitoring Disabled',
        description: `Monitoring ${newMonitoringState ? 'enabled' : 'disabled'} for @${handle.name}.`,
      });
      return true;
    } catch (error) {
      console.error('Error toggling monitoring:', error);
      toast({
        title: 'Error',
        description: 'Failed to update monitoring settings. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const checkHandle = async (handleId: string) => {
    try {
      const response = await fetch(`https://mausvzbzorurkcoruhev.supabase.co/functions/v1/check-handles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({ handleId })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Check Handle Error:', { 
          status: response.status, 
          statusText: response.statusText,
          errorText 
        });
        throw new Error(`Handle check failed: ${errorText}`);
      }

      const result = await response.json();
      console.log('Handle Check Result:', result);
      return result;
    } catch (error) {
      console.error('CRITICAL: Error checking handle:', error);
      throw error;
    }
  };

  const handleCheckHandle = async (handle: Handle) => {
    if (!user) {
      toast({
        title: 'Demo Mode',
        description: 'Check handle operation is not available in demo mode. Please sign in.',
      });
      return false;
    }

    try {
      setRefreshingHandles(prev => [...prev, handle.id]);
      await checkHandle(handle.id);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Handle Checked',
        description: `@${handle.name} has been checked for availability.`,
      });
      return true;
    } catch (error) {
      console.error('Error checking handle:', error);
      toast({
        title: 'Error',
        description: 'Failed to check handle. Please try again.',
        variant: 'destructive'
      });
      return false;
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
      return false;
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
      
      toast({
        title: 'Handles Refreshed',
        description: 'All handles have been checked for availability.',
      });
      return true;
    } catch (error) {
      console.error('Error refreshing handles:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh handles. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  const handleClearHistory = async () => {
    if (!user) {
      toast({
        title: 'Demo Mode',
        description: 'Clear history operation is not available in demo mode. Please sign in.',
      });
      return false;
    }

    try {
      const { data: userHandles, error: handleError } = await supabase
        .from('handles')
        .select('id')
        .eq('user_id', user.id);
        
      if (handleError) throw handleError;
      
      if (!userHandles || userHandles.length === 0) {
        toast({
          title: 'No History',
          description: 'You have no handle history to clear.',
        });
        return false;
      }
      
      const handleIds = userHandles.map(h => h.id);
      
      const { error } = await supabase
        .from('handle_history')
        .delete()
        .in('handle_id', handleIds);
      
      if (error) throw error;
      
      toast({
        title: 'History Cleared',
        description: 'Your handle history has been cleared successfully.',
      });
      return true;
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear history. Please try again.',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    refreshingHandles,
    handleAddHandle,
    handleDeleteHandle,
    handleToggleNotifications,
    handleToggleMonitoring,
    handleCheckHandle,
    handleRefreshAll,
    handleClearHistory,
  };
};
