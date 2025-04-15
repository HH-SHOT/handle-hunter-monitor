
import React from 'react';
import { 
  Twitter, 
  Instagram, 
  Facebook, 
  TrendingUp,
  Edit,
  Trash2,
  CircleCheck,
  XCircle,
  Clock,
  Bell,
  BellOff
} from 'lucide-react';
import { Handle } from './types';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HandleItemProps {
  handle: Handle;
  onEdit: (handle: Handle) => void;
  onDelete: (handle: Handle) => void;
  onToggleNotifications: (handle: Handle) => void;
}

const getPlatformIcon = (platform: string) => {
  switch (platform) {
    case 'twitter':
      return <Twitter className="h-4 w-4" />;
    case 'instagram':
      return <Instagram className="h-4 w-4" />;
    case 'facebook':
      return <Facebook className="h-4 w-4" />;
    case 'tiktok':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <Twitter className="h-4 w-4" />;
  }
};

const getStatusComponent = (status: string) => {
  switch (status) {
    case 'available':
      return (
        <div className="flex items-center text-green-600">
          <CircleCheck className="h-4 w-4 mr-1" />
          <span className="bg-green-100 px-2 py-0.5 rounded-full text-xs">Available</span>
        </div>
      );
    case 'unavailable':
      return (
        <div className="flex items-center text-red-600">
          <XCircle className="h-4 w-4 mr-1" />
          <span className="bg-red-100 px-2 py-0.5 rounded-full text-xs">Taken</span>
        </div>
      );
    case 'monitoring':
      return (
        <div className="flex items-center text-amber-600 animate-pulse-slow">
          <Clock className="h-4 w-4 mr-1" />
          <span className="bg-yellow-100 px-2 py-0.5 rounded-full text-xs">
            {status === 'available' ? 'Available' : 'Taken'}
          </span>
        </div>
      );
    default:
      return null;
  }
};

const HandleItem = ({ handle, onEdit, onDelete, onToggleNotifications }: HandleItemProps) => {
  // Determine the display status based on monitoring state
  const displayStatus = handle.status === 'monitoring' ? 
    (handle.status === 'available' ? 'Available' : 'Taken') : 
    handle.status;

  return (
    <tr key={handle.id} className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gray-100 p-1.5">
            {getPlatformIcon(handle.platform)}
          </div>
          <div>
            <span className="font-medium">@{handle.name}</span>
            <div className="text-sm text-gray-500">{handle.platform}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {getStatusComponent(handle.status)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {handle.lastChecked}
      </td>
      <td className="px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleNotifications(handle)}
          className={`${handle.notifications ? 'text-brand-blue' : 'text-gray-400'}`}
        >
          {handle.notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </Button>
      </td>
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <span className="sr-only">Actions</span>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 9.5C8.82843 9.5 9.5 8.82843 9.5 8C9.5 7.17157 8.82843 6.5 8 6.5C7.17157 6.5 6.5 7.17157 6.5 8C6.5 8.82843 7.17157 9.5 8 9.5Z" fill="currentColor" />
                <path d="M8 3.5C8.82843 3.5 9.5 2.82843 9.5 2C9.5 1.17157 8.82843 0.5 8 0.5C7.17157 0.5 6.5 1.17157 6.5 2C6.5 2.82843 7.17157 3.5 8 3.5Z" fill="currentColor" />
                <path d="M8 15.5C8.82843 15.5 9.5 14.8284 9.5 14C9.5 13.1716 8.82843 12.5 8 12.5C7.17157 12.5 6.5 13.1716 6.5 14C6.5 14.8284 7.17157 15.5 8 15.5Z" fill="currentColor" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(handle)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => onDelete(handle)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  );
};

export default HandleItem;
