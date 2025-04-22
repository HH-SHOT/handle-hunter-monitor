
import React from 'react';
import { Monitor } from 'lucide-react';

interface HandleStatusProps {
  status: string;
  isMonitoring: boolean;
}

const HandleStatus: React.FC<HandleStatusProps> = ({ status, isMonitoring }) => {
  const statusBadge = (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === 'available' 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}
    >
      {status === 'available' ? 'Available' : 'Taken'}
    </span>
  );

  const monitoringBadge = isMonitoring ? (
    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
      <Monitor className="h-3 w-3 mr-1" />
      Monitoring
    </span>
  ) : null;

  return (
    <div className="flex items-center">
      {statusBadge}
      {monitoringBadge}
    </div>
  );
};

export default HandleStatus;
