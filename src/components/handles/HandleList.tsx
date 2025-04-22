
import React from 'react';
import { Handle } from './types';
import { RefreshCw } from 'lucide-react';
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
        <RefreshCw className="h-8 w-8 animate-spin text-brand-blue" />
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

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50">
          <tr className="border-b">
            <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Handle</th>
            <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
            <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Monitoring</th>
            <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Last Checked</th>
            <th className="text-left px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Notifications</th>
            <th className="text-right px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {handles.map(handle => (
            <HandleItem 
              key={handle.id}
              handle={handle}
              isRefreshing={refreshingHandles?.includes(handle.id)}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleNotifications={onToggleNotifications}
              onToggleMonitoring={onToggleMonitoring}
              onCheckHandle={onCheckHandle}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HandleList;
