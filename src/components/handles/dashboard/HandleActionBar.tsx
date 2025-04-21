
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw } from "lucide-react";

interface Props {
  statusCounts: {
    available: number;
    unavailable: number;
    monitoring: number;
    total: number;
  };
  onClearAll: () => void;
  onRefreshAll: () => void;
  isClearing?: boolean;
  canUndo?: boolean;
  onUndo?: () => void;
}

const HandleActionBar: React.FC<Props> = ({ 
  statusCounts, 
  onClearAll, 
  onRefreshAll, 
  isClearing = false, 
  canUndo = false, 
  onUndo 
}) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
    <div className="grid grid-cols-4 gap-2 w-full md:w-auto">
      <div className="bg-gray-100 rounded-lg p-2 text-center">
        <p className="text-sm text-gray-500">Total</p>
        <p className="font-semibold text-lg">{statusCounts.total}</p>
      </div>
      <div className="bg-green-100 rounded-lg p-2 text-center">
        <p className="text-sm text-green-600">Available</p>
        <p className="font-semibold text-lg text-green-600">{statusCounts.available}</p>
      </div>
      <div className="bg-red-100 rounded-lg p-2 text-center">
        <p className="text-sm text-red-600">Unavailable</p>
        <p className="font-semibold text-lg text-red-600">{statusCounts.unavailable}</p>
      </div>
      <div className="bg-blue-100 rounded-lg p-2 text-center">
        <p className="text-sm text-blue-600">Monitoring</p>
        <p className="font-semibold text-lg text-blue-600">{statusCounts.monitoring}</p>
      </div>
    </div>

    <div className="flex gap-2 w-full md:w-auto justify-end">
      <Button
        variant="outline"
        onClick={onRefreshAll}
        className="flex items-center gap-2"
      >
        <RefreshCw className="h-4 w-4" /> Refresh All
      </Button>
      <Button
        variant="destructive"
        onClick={onClearAll}
        disabled={isClearing}
        className="flex items-center gap-2"
      >
        <Trash2 className="h-4 w-4" /> Clear All
      </Button>
    </div>
  </div>
);

export default HandleActionBar;
