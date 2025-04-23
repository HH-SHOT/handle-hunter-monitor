
import React from "react";
import { Handle } from "../types";
import { RefreshCw } from "lucide-react";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import HandleItem from "../HandleItem";

interface HandleTableProps {
  handles: Handle[];
  loading?: boolean;
  refreshingHandles?: string[];
  onDelete: (handle: Handle) => void;
  onEdit?: (handle: Handle) => void;
  onToggleNotifications: (handle: Handle) => void;
  onToggleMonitoring: (handle: Handle) => void;
  onCheckHandle?: (handle: Handle) => void;
}

const HandleTable: React.FC<HandleTableProps> = ({
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
      <div className="text-center py-10 border border-dashed rounded-lg bg-gray-50">
        <p className="text-gray-500">No handles found. Add a handle to start monitoring.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm bg-white">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-500">Handle</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-500">Status</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-500">Monitoring</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-500">Last Checked</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-500">Notifications</TableHead>
            <TableHead className="text-xs font-medium uppercase tracking-wider text-gray-500">Actions</TableHead>
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
              onCheckHandle={onCheckHandle}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HandleTable;
