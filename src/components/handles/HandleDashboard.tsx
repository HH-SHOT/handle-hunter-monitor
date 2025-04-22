
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { getUniquePlatforms } from './handleUtils';
import { useDashboardData } from './hooks/useDashboardData';
import HandleAddDialog from './components/HandleAddDialog';
import HandleList from './HandleList';
import HandleTable from './dashboard/HandleTable';
import HandleActionBar from './dashboard/HandleActionBar';
import HandleDashboardControls from './dashboard/HandleDashboardControls';

const HandleDashboard: React.FC = () => {
  const {
    handles,
    isLoading,
    refreshingHandles,
    filterOptions,
    setFilterOptions,
    statusCounts,
    handleAddHandle,
    handleDeleteHandle,
    handleToggleNotifications,
    handleToggleMonitoring,
    handleCheckHandle,
    handleRefreshAll,
    handleClearHistory,
  } = useDashboardData();

  const [showAddHandleDialog, setShowAddHandleDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'table'>('list');

  const platforms = getUniquePlatforms(handles);
  
  // Filter handles based on current filter options
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-blue" />
        <span className="ml-3 text-gray-600">Loading handles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HandleDashboardControls
        searchTerm={filterOptions.searchTerm}
        onSearch={(term) => setFilterOptions(prev => ({ ...prev, searchTerm: term }))}
        platforms={platforms}
        selectedPlatform={filterOptions.platform}
        onPlatformFilter={(platform) => setFilterOptions(prev => ({ ...prev, platform }))}
        selectedStatuses={filterOptions.statuses}
        onStatusFilter={(statuses) => setFilterOptions(prev => ({ ...prev, statuses }))}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddHandle={() => setShowAddHandleDialog(true)}
      />

      <HandleActionBar
        statusCounts={statusCounts}
        onClearAll={handleClearHistory}
        onRefreshAll={handleRefreshAll}
      />

      {viewMode === 'list' ? (
        <HandleList
          handles={filteredHandles}
          refreshingHandles={refreshingHandles}
          onDelete={handleDeleteHandle}
          onToggleNotifications={handleToggleNotifications}
          onToggleMonitoring={handleToggleMonitoring}
          onCheckHandle={handleCheckHandle}
        />
      ) : (
        <HandleTable
          handles={filteredHandles}
          refreshingHandles={refreshingHandles}
          onDelete={handleDeleteHandle}
          onToggleNotifications={handleToggleNotifications}
          onToggleMonitoring={handleToggleMonitoring}
          onCheckHandle={handleCheckHandle}
        />
      )}

      <HandleAddDialog
        open={showAddHandleDialog}
        onOpenChange={setShowAddHandleDialog}
        onSave={handleAddHandle}
      />
    </div>
  );
};

export default HandleDashboard;
