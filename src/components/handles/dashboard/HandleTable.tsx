
import React from "react";
import { Handle } from "../types";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Bell, BellOff, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HandleTableProps {
  handles: Handle[];
  loading?: boolean;
  refreshingHandles?: string[];
  onDelete: (handle: Handle) => void;
  onEdit?: (handle: Handle) => void;
  onToggleNotifications: (handle: Handle) => void;
  onCheckHandle?: (handle: Handle) => void;
}

const HandleTable: React.FC<HandleTableProps> = ({
  handles,
  loading = false,
  refreshingHandles = [],
  onDelete,
  onEdit,
  onToggleNotifications,
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
    <div className="overflow-x-auto -mx-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Handle</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Checked</TableHead>
            <TableHead>Notifications</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {handles.map(handle => (
            <TableRow key={handle.id}>
              <TableCell className="font-medium">@{handle.name}</TableCell>
              <TableCell>{handle.platform}</TableCell>
              <TableCell>
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    handle.status === 'available' 
                      ? 'bg-green-100 text-green-800' 
                      : handle.status === 'unavailable'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {handle.status.charAt(0).toUpperCase() + handle.status.slice(1)}
                </span>
              </TableCell>
              <TableCell>
                {refreshingHandles?.includes(handle.id) ? (
                  <span className="flex items-center">
                    <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                    Checking...
                  </span>
                ) : (
                  handle.lastChecked
                )}
              </TableCell>
              <TableCell>
                <Button variant="ghost" onClick={() => onToggleNotifications(handle)}>
                  {handle.notifications ? (
                    <Bell className="h-4 w-4 text-brand-blue" />
                  ) : (
                    <BellOff className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  {onCheckHandle && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => onCheckHandle(handle)}
                            disabled={refreshingHandles?.includes(handle.id)}
                          >
                            <RefreshCw className={`h-4 w-4 ${refreshingHandles?.includes(handle.id) ? 'animate-spin' : ''}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Check availability now</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {onEdit && (
                    <Button variant="ghost" size="sm" onClick={() => onEdit(handle)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => onDelete(handle)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HandleTable;
