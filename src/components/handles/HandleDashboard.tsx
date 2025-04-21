
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import HandleList from './HandleList';
import AddHandleForm from './AddHandleForm';
import { mockHandles } from './mockHandles';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Handle, HandleStatus } from './types';
import HandleActionBar from './dashboard/HandleActionBar';
import HandleDashboardControls from './dashboard/HandleDashboardControls';
import HandleTable from './dashboard/HandleTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUniquePlatforms, filterHandlesByPlatform, getHandleStatusCounts } from './handleUtils';

/**
 * The main dashboard component for handle management.
 */
const HandleDashboard: React.FC = () => {
  // State for handles and UI controls
  const [handles, setHandles] = useState<Handle[]>(mockHandles);
  const [filteredHandles, setFilteredHandles] = useState<Handle[]>(mockHandles);
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
  const handleAddHandle = (newHandle: Handle) => {
    setHandles([...handles, newHandle]);
    setShowAddHandleDialog(false);
    toast({
      title: 'Handle Added',
      description: `@${newHandle.name} is now being monitored.`,
    });
  };

  const handleDeleteHandle = (id: string) => {
    const handleToDelete = handles.find((h) => h.id === id);
    if (!handleToDelete) return;

    setHandles(handles.filter((handle) => handle.id !== id));
    toast({
      title: 'Handle Removed',
      description: `@${handleToDelete.name} has been removed from monitoring.`,
      action: (
        <Button
          onClick={async () => {
            setHandles((prevHandles) => [...prevHandles, handleToDelete]);
            toast({
              title: 'Handle Restored',
              description: `@${handleToDelete.name} has been restored.`,
            });
          }}
        >
          Undo
        </Button>
      ),
    });
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

  const confirmClearAll = () => {
    setLastDeletedHandles([...handles]);
    setHandles([]);
    setIsDeleteAllDialogOpen(false);
    
    toast({
      title: 'All Handles Removed',
      description: `${lastDeletedHandles.length} handles have been removed from monitoring.`,
      action: (
        <Button
          onClick={async () => {
            setHandles(lastDeletedHandles);
            toast({
              title: 'Handles Restored',
              description: `${lastDeletedHandles.length} handles have been restored.`,
            });
          }}
        >
          Undo
        </Button>
      ),
    });
  };

  const handleRefreshAll = async () => {
    // Simulate refreshing by updating the lastChecked time
    const updatedHandles = handles.map(handle => ({
      ...handle,
      lastChecked: new Date().toISOString()
    }));
    
    setHandles(updatedHandles as Handle[]);
    
    toast({
      title: 'Handles Refreshed',
      description: `${handles.length} handles have been checked for availability.`,
    });
  };

  const handleToggleNotifications = (id: string) => {
    const updatedHandles = handles.map(handle => 
      handle.id === id ? { ...handle, notifications: !handle.notifications } : handle
    );
    setHandles(updatedHandles);
  };

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
          <AddHandleForm onAddHandle={handleAddHandle} />
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
