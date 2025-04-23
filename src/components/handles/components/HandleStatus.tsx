
import React, { useEffect, useState } from 'react';
import { Monitor, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HandleStatusProps {
  status: string;
  isMonitoring: boolean;
  queuePosition?: number;
}

const HandleStatus: React.FC<HandleStatusProps> = ({ status, isMonitoring, queuePosition }) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  // Start a timer when checking starts to provide feedback on long-running checks
  useEffect(() => {
    if (status === 'monitoring') {
      const timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      setElapsedTime(0);
    }
  }, [status]);

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

  // Get display text for the status with estimated time
  const getStatusDisplayText = () => {
    if (status === 'monitoring') {
      // Only show position when it's more than 1
      if (queuePosition && queuePosition > 1) {
        return `Checking... (#${queuePosition})`;
      }
      return 'Checking...';
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

  // Calculate estimated time remaining
  const getEstimatedTime = () => {
    if (!queuePosition || queuePosition <= 1) return null;
    
    const concurrentChecks = 10; // This should match the server setting
    const avgTimePerTask = 1; // Average seconds per task for API-based checks
    
    // Calculate batch position (which batch this will be in)
    const batchPosition = Math.ceil(queuePosition / concurrentChecks);
    const estimatedSeconds = batchPosition * avgTimePerTask;
    
    if (estimatedSeconds < 5) {
      return 'a few seconds';
    } else if (estimatedSeconds < 60) {
      return `~${estimatedSeconds} seconds`;
    } else {
      return `~${Math.ceil(estimatedSeconds / 60)} minutes`;
    }
  };

  // Show timeout warning for long-running checks
  const getTimeoutMessage = () => {
    if (status === 'monitoring' && elapsedTime > 30) {
      return "Check taking longer than expected. Please try again.";
    }
    return null;
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
            {status === 'monitoring' && elapsedTime > 15 && " (slow)"}
          </Badge>
        </TooltipTrigger>
        {status === 'monitoring' && (
          <TooltipContent>
            <p>
              {getTimeoutMessage() || 
                (queuePosition 
                  ? `Position in queue: ${queuePosition}${getEstimatedTime() ? ` (ETA: ${getEstimatedTime()})` : ''}` 
                  : 'Checking handle availability')}
            </p>
            {elapsedTime > 15 && (
              <p className="text-amber-500 mt-1 text-xs">
                {elapsedTime > 30 
                  ? "Connection may be slow. Consider trying again." 
                  : "Taking longer than expected."}
              </p>
            )}
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
