
import React from 'react';
import { Monitor } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HandleStatusProps {
  status: string;
  isMonitoring: boolean;
}

const HandleStatus: React.FC<HandleStatusProps> = ({ status, isMonitoring }) => {
  const statusBadge = (
    <Badge 
      variant="outline"
      className={`
        ${status === 'available' 
          ? 'bg-green-100 text-green-800 border-green-200' 
          : 'bg-red-100 text-red-800 border-red-200'
        } px-2.5 py-0.5 rounded-full text-xs font-medium`}
    >
      {status === 'available' ? 'Available' : 'Taken'}
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
