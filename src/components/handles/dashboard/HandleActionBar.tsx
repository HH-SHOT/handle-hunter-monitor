
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    <div className="grid grid-cols-4 gap-3 w-full md:w-auto">
      <Card className="bg-white border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <p className="text-sm text-gray-500">Total</p>
          <p className="font-semibold text-xl">{statusCounts.total}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-green-50 border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <p className="text-sm text-green-600">Available</p>
          <p className="font-semibold text-xl text-green-600">{statusCounts.available}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-red-50 border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <p className="text-sm text-red-600">Unavailable</p>
          <p className="font-semibold text-xl text-red-600">{statusCounts.unavailable}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-blue-50 border-0 shadow-sm">
        <CardContent className="p-3 text-center">
          <p className="text-sm text-blue-600">Monitoring</p>
          <p className="font-semibold text-xl text-blue-600">{statusCounts.monitoring}</p>
        </CardContent>
      </Card>
    </div>

    <div className="flex gap-2 w-full md:w-auto justify-end">
      <Button
        variant="outline"
        onClick={onRefreshAll}
        className="flex items-center gap-2 border-gray-200"
      >
        <RefreshCw className="h-4 w-4" /> Refresh All
      </Button>
      <Button
        variant="outline"
        onClick={onClearAll}
        className="flex items-center gap-2 text-amber-600 border-amber-200 hover:bg-amber-50"
      >
        <XCircle className="h-4 w-4" /> Clear History
      </Button>
    </div>
  </div>
);

export default HandleActionBar;
