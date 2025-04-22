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

  const handleToggleMonitoring = async (handle: Handle) => {
    if (!user) {
      toast({
        title: 'Demo Mode',
        description: 'Monitoring toggles are not available in demo mode. Please sign in.',
      });
      return;
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
    } catch (error) {
      console.error('Error toggling monitoring:', error);
      toast({
        title: 'Error',
        description: 'Failed to update monitoring settings. Please try again.',
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
      
      toast({
        title: 'Handles Refreshed',
        description: 'All handles have been checked for availability.',
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

  return {
    refreshingHandles,
    handleAddHandle,
    handleDeleteHandle,
    handleToggleNotifications,
    handleToggleMonitoring,
    handleCheckHandle,
    handleRefreshAll,
  };
};
