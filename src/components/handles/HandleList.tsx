
import React from 'react';
import { Handle } from './types';
import HandleItem from './HandleItem';
import { toast } from "@/hooks/use-toast";

interface HandleListProps {
  handles: Handle[];
  loading?: boolean;
  refreshingHandles?: string[];
  onDelete: (handle: Handle) => void;
  onEdit?: (handle: Handle) => void;
  onToggleNotifications: (handle: Handle) => void;
  onToggleMonitoring: (handle: Handle) => void;
  onCheckHandle?: (handle: Handle) => void;
}

const HandleList: React.FC<HandleListProps> = ({
  handles,
  loading = false,
  refreshingHandles = [],
  onDelete,
  onEdit,
  onToggleNotifications,
  onToggleMonitoring,
  onCheckHandle,
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent"></div>
        <span className="ml-3 text-gray-600">Loading handles...</span>
      </div>
    );
  }

  if (handles.length === 0) {
    return (
      <div className="text-center py-10 border border-dashed rounded-lg">
        <p className="text-gray-500">No handles found. Add a handle to start monitoring.</p>
      </div>
    );
  }

  // Add error toast for rate limits
  const handleRefreshError = (error: any) => {
    if (error?.message?.includes('rate limit')) {
      toast({
        title: "Rate Limit Reached",
        description: "Please try again in a few minutes.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh handles. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left px-4 py-3 font-medium">Handle</th>
            <th className="text-left px-4 py-3 font-medium">Status</th>
            <th className="text-left px-4 py-3 font-medium">Monitoring</th>
            <th className="text-left px-4 py-3 font-medium">Last Checked</th>
            <th className="text-left px-4 py-3 font-medium">Notifications</th>
            <th className="text-right px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {handles.map(handle => (
            <HandleItem 
              key={handle.id}
              handle={handle}
              onEdit={onEdit ? () => onEdit(handle) : undefined}
              onDelete={() => onDelete(handle)}
              onToggleNotifications={() => onToggleNotifications(handle)}
              onToggleMonitoring={() => onToggleMonitoring(handle)}
              isRefreshing={refreshingHandles?.includes(handle.id)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HandleList;
