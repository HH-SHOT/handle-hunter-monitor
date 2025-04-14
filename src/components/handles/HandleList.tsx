
import React from 'react';
import { Table, TableHeader, TableBody, TableHead, TableRow } from '@/components/ui/table';
import { Handle } from './types';
import HandleItem from './HandleItem';
import { Skeleton } from '@/components/ui/skeleton';

interface HandleListProps {
  handles: Handle[];
  loading: boolean;
  onEdit: (handle: Handle) => void;
  onDelete: (handle: Handle) => void;
  onToggleNotifications: (handle: Handle) => void;
}

const HandleList = ({ 
  handles, 
  loading, 
  onEdit, 
  onDelete, 
  onToggleNotifications 
}: HandleListProps) => {
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Handle</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Checked</TableHead>
            <TableHead>Notifications</TableHead>
            <TableHead>
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {handles.length === 0 ? (
            <TableRow>
              <td colSpan={5} className="text-center py-8 text-gray-500">
                No handles available. Add one to start monitoring.
              </td>
            </TableRow>
          ) : (
            handles.map((handle) => (
              <HandleItem
                key={handle.id}
                handle={handle}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleNotifications={onToggleNotifications}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default HandleList;
