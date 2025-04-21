
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import HandleList from './HandleList';
import AddHandleForm from './AddHandleForm';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Handle, HandleFormData, HandleStatus, DbHandle } from './types';
import HandleActionBar from './dashboard/HandleActionBar';
import HandleDashboardControls from './dashboard/HandleDashboardControls';
import HandleTable from './dashboard/HandleTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUniquePlatforms, filterHandlesByPlatform, getHandleStatusCounts } from './handleUtils';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { RefreshCw } from 'lucide-react';

/**
 * The main dashboard component for handle management.
 */
const HandleDashboard: React.FC = () => {
  // Auth context to get the current user
  const { user } = useAuth();

  // State for handles and UI controls
  const [handles, setHandles] = useState<Handle[]>([]);
  const [filteredHandles, setFilteredHandles] = useState<Handle[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedStatuses, setSelectedStatuses] = useState<HandleStatus[]>([
    'available',
    'unavailable',
    'monitoring',
  ]);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');
  const [showAddHandleDialog, setShowAddHandleDialog] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [lastDeletedHandles, setLastDeletedHandles] = useState<Handle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch handles from Supabase when the component mounts or when the user changes
  useEffect(() => {
    if (user) {
      fetchHandles();
    }
  }, [user]);

  // Fetch handles from Supabase
  const fetchHandles = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('handles')
        .select('*')
        .eq('user_id', user?.id || '')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Convert the DB handles to the Handle type
      const formattedHandles: Handle[] = (data || []).map((dbHandle: DbHandle) => ({
        id: dbHandle.id,
        name: dbHandle.name,
        platform: dbHandle.platform as 'twitter' | 'instagram' | 'twitch' | 'tiktok',
        status: dbHandle.status as HandleStatus,
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

  // Metrics
  const platforms = getUniquePlatforms(handles);
  const statusCounts = getHandleStatusCounts(handles);

  // Filter handles based on search, platform, and status
  useEffect(() => {
    let result = [...handles];

    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearch = searchTerm.toLowerCase();
      result = result.filter((handle) =>
        handle.name.toLowerCase().includes(lowerCaseSearch)
      );
    }

    // Filter by platform
    if (selectedPlatform !== 'all') {
      result = filterHandlesByPlatform(result, selectedPlatform);
    }

    // Filter by status
    if (selectedStatuses.length > 0 && selectedStatuses.length < 3) {
      result = result.filter((handle) => selectedStatuses.includes(handle.status));
    }

    setFilteredHandles(result);
  }, [handles, searchTerm, selectedPlatform, selectedStatuses]);

  // Handlers
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
      
      const { data, error } = await supabase
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
      
      // Call the check handle endpoint to start monitoring
      try {
        await fetch(`https://mausvzbzorurkcoruhev.supabase.co/functions/v1/check-handles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.auth.getSession()}`
          },
          body: JSON.stringify({ handleId: handleId })
        });
      } catch (checkError) {
        console.error('Error checking handle:', checkError);
        // Continue anyway, as the handle is still created
      }
      
      // Add the new handle to the local state
      const newHandle: Handle = {
        id: handleId,
        name: formData.name,
        platform: formData.platform,
        status: 'monitoring',
        lastChecked: 'just now',
        notifications: true
      };
      
      setHandles(prevHandles => [newHandle, ...prevHandles]);
      setShowAddHandleDialog(false);
      
      toast({
        title: 'Handle Added',
        description: `@${newHandle.name} is now being monitored.`,
      });
    } catch (error) {
      console.error('Error adding handle:', error);
      toast({
        title: 'Error',
        description: 'Failed to add the handle. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteHandle = async (handle: Handle) => {
    try {
      const { error } = await supabase
        .from('handles')
        .delete()
        .eq('id', handle.id);
      
      if (error) throw error;
      
      setHandles(handles.filter((h) => h.id !== handle.id));
      
      toast({
        title: 'Handle Removed',
        description: `@${handle.name} has been removed from monitoring.`,
        action: (
          <Button
            onClick={async () => {
              try {
                // Re-insert the deleted handle
                const { error: restoreError } = await supabase
                  .from('handles')
                  .insert({
                    id: handle.id,
                    name: handle.name,
                    platform: handle.platform,
                    status: handle.status,
                    user_id: user?.id || '',
                    notifications_enabled: handle.notifications
                  });
                
                if (restoreError) throw restoreError;
                
                setHandles((prevHandles) => [...prevHandles, handle]);
                
                toast({
                  title: 'Handle Restored',
                  description: `@${handle.name} has been restored.`,
                });
              } catch (error) {
                console.error('Error restoring handle:', error);
                toast({
                  title: 'Error',
                  description: 'Failed to restore the handle. Please try again.',
                  variant: 'destructive'
                });
              }
            }}
          >
            Undo
          </Button>
        ),
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handlePlatformFilter = (platform: string) => {
    setSelectedPlatform(platform);
  };

  const handleStatusFilter = (statuses: HandleStatus[]) => {
    setSelectedStatuses(statuses);
  };

  const handleViewModeChange = (mode: 'list' | 'table') => {
    setViewMode(mode);
  };

  const handleClearAll = () => {
    setIsDeleteAllDialogOpen(true);
  };

  const confirmClearAll = async () => {
    try {
      setLastDeletedHandles([...handles]);
      
      // Delete all handles for the current user
      const { error } = await supabase
        .from('handles')
        .delete()
        .eq('user_id', user?.id || '');
      
      if (error) throw error;
      
      setHandles([]);
      setIsDeleteAllDialogOpen(false);
      
      toast({
        title: 'All Handles Removed',
        description: `${lastDeletedHandles.length} handles have been removed from monitoring.`,
        action: (
          <Button
            onClick={async () => {
              try {
                // Re-insert all deleted handles
                const handleData = lastDeletedHandles.map(h => ({
                  id: h.id,
                  name: h.name,
                  platform: h.platform,
                  status: h.status,
                  user_id: user?.id || '',
                  notifications_enabled: h.notifications
                }));
                
                const { error: restoreError } = await supabase
                  .from('handles')
                  .insert(handleData);
                
                if (restoreError) throw restoreError;
                
                setHandles(lastDeletedHandles);
                
                toast({
                  title: 'Handles Restored',
                  description: `${lastDeletedHandles.length} handles have been restored.`,
                });
              } catch (error) {
                console.error('Error restoring handles:', error);
                toast({
                  title: 'Error',
                  description: 'Failed to restore handles. Please try again.',
                  variant: 'destructive'
                });
              }
            }}
          >
            Undo
          </Button>
        ),
      });
    } catch (error) {
      console.error('Error removing all handles:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove all handles. Please try again.',
        variant: 'destructive'
      });
      setIsDeleteAllDialogOpen(false);
    }
  };

  const handleRefreshAll = async () => {
    try {
      toast({
        title: 'Refreshing Handles',
        description: 'Checking the availability of your handles...',
      });
      
      // Call the check-handles edge function to refresh all handles
      const response = await fetch(`https://mausvzbzorurkcoruhev.supabase.co/functions/v1/check-handles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.auth.getSession()}`
        },
        body: JSON.stringify({ refresh: true })
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh handles');
      }
      
      // Refetch the handles to get the updated data
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

  const handleToggleNotifications = async (handle: Handle) => {
    try {
      const newNotificationState = !handle.notifications;
      
      const { error } = await supabase
        .from('handles')
        .update({ notifications_enabled: newNotificationState })
        .eq('id', handle.id);
      
      if (error) throw error;
      
      const updatedHandles = handles.map(h => 
        h.id === handle.id ? { ...h, notifications: newNotificationState } : h
      );
      
      setHandles(updatedHandles);
      
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

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-background rounded-lg border shadow-sm p-4 sm:p-6 flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-blue mb-4" />
        <p className="text-muted-foreground">Loading your handles...</p>
      </div>
    );
  }

  return (
    <div className="bg-background rounded-lg border shadow-sm p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-1">Handle Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor and track your handles across different platforms.
        </p>
      </div>
      
      {/* Dashboard Controls */}
      <HandleDashboardControls
        searchTerm={searchTerm}
        onSearch={handleSearch}
        platforms={platforms}
        selectedPlatform={selectedPlatform}
        onPlatformFilter={handlePlatformFilter}
        selectedStatuses={selectedStatuses}
        onStatusFilter={handleStatusFilter}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onAddHandle={() => setShowAddHandleDialog(true)}
      />
      
      {/* Status Counts & Action Bar */}
      <HandleActionBar
        statusCounts={statusCounts}
        onClearAll={handleClearAll}
        onRefreshAll={handleRefreshAll}
      />
      
      {/* Handle Display */}
      <div className="mt-6">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="all">All Handles</TabsTrigger>
            <TabsTrigger value="available">Available</TabsTrigger>
            <TabsTrigger value="unavailable">Unavailable</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            {filteredHandles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">No handles found.</p>
                <Button size="sm" onClick={() => setShowAddHandleDialog(true)}>
                  Add Your First Handle
                </Button>
              </div>
            ) : viewMode === 'list' ? (
              <HandleList
                handles={filteredHandles}
                onDelete={handleDeleteHandle}
                onToggleNotifications={handleToggleNotifications}
              />
            ) : (
              <HandleTable
                handles={filteredHandles}
                onDelete={handleDeleteHandle}
                onToggleNotifications={handleToggleNotifications}
              />
            )}
          </TabsContent>
          
          <TabsContent value="available" className="mt-0">
            {viewMode === 'list' ? (
              <HandleList
                handles={filteredHandles.filter(h => h.status === 'available')}
                onDelete={handleDeleteHandle}
                onToggleNotifications={handleToggleNotifications}
              />
            ) : (
              <HandleTable
                handles={filteredHandles.filter(h => h.status === 'available')}
                onDelete={handleDeleteHandle}
                onToggleNotifications={handleToggleNotifications}
              />
            )}
          </TabsContent>
          
          <TabsContent value="unavailable" className="mt-0">
            {viewMode === 'list' ? (
              <HandleList
                handles={filteredHandles.filter(h => h.status === 'unavailable')}
                onDelete={handleDeleteHandle}
                onToggleNotifications={handleToggleNotifications}
              />
            ) : (
              <HandleTable
                handles={filteredHandles.filter(h => h.status === 'unavailable')}
                onDelete={handleDeleteHandle}
                onToggleNotifications={handleToggleNotifications}
              />
            )}
          </TabsContent>
          
          <TabsContent value="monitoring" className="mt-0">
            {viewMode === 'list' ? (
              <HandleList
                handles={filteredHandles.filter(h => h.status === 'monitoring')}
                onDelete={handleDeleteHandle}
                onToggleNotifications={handleToggleNotifications}
              />
            ) : (
              <HandleTable
                handles={filteredHandles.filter(h => h.status === 'monitoring')}
                onDelete={handleDeleteHandle}
                onToggleNotifications={handleToggleNotifications}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Add Handle Dialog */}
      <Dialog open={showAddHandleDialog} onOpenChange={setShowAddHandleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Handle</DialogTitle>
          </DialogHeader>
          <AddHandleForm onSave={handleAddHandle} />
        </DialogContent>
      </Dialog>
      
      {/* Delete All Confirmation Dialog */}
      <Dialog open={isDeleteAllDialogOpen} onOpenChange={setIsDeleteAllDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove All Handles</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              Are you sure you want to remove all {handles.length} handles from monitoring? This action can be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteAllDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmClearAll}>
              Remove All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HandleDashboard;
