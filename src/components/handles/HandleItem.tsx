
import React from 'react';
import { RefreshCw, Bell, BellOff } from 'lucide-react';
import { Handle } from './types';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Switch } from "@/components/ui/switch";
import PlatformIcon from './components/PlatformIcon';
import HandleStatus from './components/HandleStatus';
import HandleActions from './components/HandleActions';

interface HandleItemProps {
  handle: Handle;
  isRefreshing?: boolean;
  onEdit?: (handle: Handle) => void;
  onDelete: (handle: Handle) => void;
  onToggleNotifications: (handle: Handle) => void;
  onToggleMonitoring: (handle: Handle) => void;
  onCheckHandle?: (handle: Handle) => void;
}

const HandleItem = ({
  handle,
  isRefreshing = false,
  onEdit,
  onDelete,
  onToggleNotifications,
  onToggleMonitoring,
  onCheckHandle,
}: HandleItemProps) => {
  const handleToggleNotificationsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onToggleNotifications(handle);
  };

  const handleRefreshClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCheckHandle && !isRefreshing) {
      onCheckHandle(handle);
    }
  };

  return (
    <tr key={handle.id} className="border-b hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gray-100 p-1.5">
            <PlatformIcon platform={handle.platform} />
          </div>
          <div>
            <span className="font-medium">@{handle.name}</span>
            <div className="text-sm text-gray-500">{handle.platform}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <HandleStatus status={handle.status} isMonitoring={handle.monitoringEnabled} />
      </td>
      <td className="px-4 py-3">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Switch
                  checked={handle.monitoringEnabled}
                  onCheckedChange={() => onToggleMonitoring(handle)}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{handle.monitoringEnabled ? 'Disable' : 'Enable'} monitoring</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            {isRefreshing ? (
              <span className="flex items-center">
                <RefreshCw className="h-3 w-3 animate-spin mr-2" />
                Checking...
              </span>
            ) : (
              handle.lastChecked
            )}
          </div>
          {onCheckHandle && !isRefreshing && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefreshClick}
              className="text-gray-400 hover:text-brand-blue"
              type="button"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleNotificationsClick}
          className={`${handle.notifications ? 'text-brand-blue' : 'text-gray-400'}`}
          type="button"
        >
          {handle.notifications ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        </Button>
      </td>
      <td className="px-4 py-3 text-right">
        <HandleActions
          handle={handle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
};

export default HandleItem;
