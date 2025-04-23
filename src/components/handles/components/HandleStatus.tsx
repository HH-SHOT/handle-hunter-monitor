
import React from 'react';
import { Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HandleStatusProps {
  status: string;
  isMonitoring: boolean;
}

const HandleStatus: React.FC<HandleStatusProps> = ({ status, isMonitoring }) => {
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
    switch(status) {
      case 'available':
        return 'Available';
      case 'unavailable':
        return 'Taken';
      case 'monitoring':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const statusBadge = (
    <Badge 
      variant="outline"
      className={`${getStatusBadgeStyles()} px-2.5 py-0.5 rounded-full text-xs font-medium`}
    >
      {getStatusDisplayText()}
    </Badge>
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
