
import { useState, useEffect, useCallback } from 'react';
import { Handle, FilterOptions } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { convertToPlatformType, convertToStatusType } from '../handleUtils';

export const useHandleData = () => {
  const { user, loading: authLoading } = useAuth();
  const [handles, setHandles] = useState<Handle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: '',
    platform: 'all',
    statuses: ['available', 'unavailable', 'monitoring']
  });

  const fetchHandles = useCallback(async () => {
    if (!user) {
      setError('Authentication required to fetch handles');
      setIsLoading(false);
      return;
    }
    
    try {
      setError(null);
      
      const { data, error } = await supabase
        .from('handles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error fetching handles:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      if (!data) {
        console.warn('No data returned from handle query');
        setHandles([]);
        return;
      }

      const formattedHandles: Handle[] = data.map(dbHandle => ({
        id: dbHandle.id,
        name: dbHandle.name,
        platform: convertToPlatformType(dbHandle.platform),
        status: convertToStatusType(dbHandle.status),
        lastChecked: dbHandle.last_checked ? new Date(dbHandle.last_checked).toLocaleString() : 'never',
        notifications: dbHandle.notifications_enabled || false,
        monitoringEnabled: dbHandle.monitoring_enabled || false
      }));

      setHandles(formattedHandles);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error fetching handles:', error);
      setError(errorMessage);
      toast({
        title: 'Error Loading Handles',
        description: `Failed to load your handles: ${errorMessage}`,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, [user]);

  // Initial load
  useEffect(() => {
    if (!authLoading && user) {
      fetchHandles();
    }
  }, [user, authLoading, fetchHandles]);

  // Manual refetch function
  const refetchHandles = useCallback(async () => {
    setIsRefetching(true);
    await fetchHandles();
    toast({
      title: 'Data Refreshed',
      description: 'Handle data has been refreshed successfully.',
    });
  }, [fetchHandles]);

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
    isRefetching,
    error,
    filterOptions,
    setFilterOptions,
    fetchHandles,
    refetchHandles,
    statusCounts,
  };
};
