
import { useState, useEffect } from 'react';
import { Handle, FilterOptions } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useHandleData = () => {
  const { user, loading: authLoading } = useAuth();
  const [handles, setHandles] = useState<Handle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        notifications: dbHandle.notifications_enabled || false,
        monitoringEnabled: dbHandle.monitoring_enabled || false
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

  useEffect(() => {
    if (!authLoading && user) {
      fetchHandles();
    }
  }, [user, authLoading]);

  const filteredHandles = handles.filter(handle => {
    if (filterOptions.searchTerm && 
        !handle.name.toLowerCase().includes(filterOptions.searchTerm.toLowerCase())) {
      return false;
    }
    
    if (filterOptions.platform !== 'all' && handle.platform !== filterOptions.platform) {
      return false;
    }
    
    return filterOptions.statuses.includes(handle.status);
  });

  const statusCounts = {
    available: handles.filter(h => h.status === 'available').length,
    unavailable: handles.filter(h => h.status === 'unavailable').length,
    monitoring: handles.filter(h => h.status === 'monitoring').length,
    total: handles.length
  };

  return {
    handles: filteredHandles,
    isLoading,
    filterOptions,
    setFilterOptions,
    fetchHandles,
    statusCounts,
  };
};
