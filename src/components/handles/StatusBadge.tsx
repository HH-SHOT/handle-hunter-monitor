
import React from 'react';
import { CircleCheck, XCircle, Clock } from 'lucide-react';

type StatusType = 'available' | 'unavailable' | 'monitoring';

interface StatusBadgeProps {
  status: StatusType | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
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
          <span className="bg-yellow-100 px-2 py-0.5 rounded-full text-xs">Monitoring</span>
        </div>
      );
    default:
      return null;
  }
};

export default StatusBadge;
