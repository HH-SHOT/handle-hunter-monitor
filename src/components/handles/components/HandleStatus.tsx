
import React from 'react';
import { Monitor, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HandleStatusProps {
  status: string;
  isMonitoring: boolean;
  queuePosition?: number;
}

const HandleStatus: React.FC<HandleStatusProps> = ({ status, isMonitoring, queuePosition }) => {
  // Define colors based on status
  const getStatusBadgeStyles = () => {
    switch(status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unavailable':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'monitoring':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get display text for the status
  const getStatusDisplayText = () => {
    if (status === 'monitoring' && queuePosition) {
      return `Pending (#${queuePosition})`;
    }
    
    switch(status) {
      case 'available':
        return 'Available';
      case 'unavailable':
        return 'Taken';
      case 'monitoring':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  const statusBadge = (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge 
            variant="outline"
            className={`${getStatusBadgeStyles()} px-2.5 py-0.5 rounded-full text-xs font-medium`}
          >
            {status === 'monitoring' && <Clock className="h-3 w-3 mr-1 inline animate-spin" />}
            {getStatusDisplayText()}
          </Badge>
        </TooltipTrigger>
        {status === 'monitoring' && (
          <TooltipContent>
            <p>
              {queuePosition 
                ? `Position in queue: ${queuePosition}` 
                : 'Checking handle availability'}
            </p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  const monitoringBadge = isMonitoring ? (
    <Badge
      variant="outline"
      className="ml-2 bg-blue-100 text-blue-800 border-blue-200 px-2.5 py-0.5 rounded-full text-xs font-medium"
    >
      <Monitor className="h-3 w-3 mr-1" />
      Monitoring
    </Badge>
  ) : null;

  return (
    <div className="flex items-center">
      {statusBadge}
      {monitoringBadge}
    </div>
  );
};

export default HandleStatus;
