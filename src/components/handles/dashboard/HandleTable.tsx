
import React from "react";
import { Handle } from "../types";
import { Table, TableHeader, TableBody, TableHead, TableRow } from "@/components/ui/table";
import HandleItem from "../HandleItem";

interface HandleTableProps {
  handles: Handle[];
  loading?: boolean;
  refreshingHandles?: string[];
  onDelete: (handle: Handle) => void;
  onEdit?: (handle: Handle) => void;
  onToggleNotifications: (handle: Handle) => void;
  onToggleMonitoring: (handle: Handle) => void;
}

const HandleTable: React.FC<HandleTableProps> = ({
  handles,
  loading = false,
  refreshingHandles = [],
  onDelete,
  onEdit,
  onToggleNotifications,
  onToggleMonitoring,
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
    <div className="overflow-x-auto -mx-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Handle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Monitoring</TableHead>
            <TableHead>Last Checked</TableHead>
            <TableHead>Notifications</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {handles.map(handle => (
            <HandleItem
              key={handle.id}
              handle={handle}
              isRefreshing={refreshingHandles?.includes(handle.id)}
              onDelete={onDelete}
              onEdit={onEdit}
              onToggleNotifications={onToggleNotifications}
              onToggleMonitoring={onToggleMonitoring}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HandleTable;
