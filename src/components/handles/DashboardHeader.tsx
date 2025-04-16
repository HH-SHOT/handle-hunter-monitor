
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, PlusCircle } from 'lucide-react';

interface DashboardHeaderProps {
  loading: boolean;
  onRefresh: () => void;
  onAddNew: () => void;
}

const DashboardHeader = ({ loading, onRefresh, onAddNew }: DashboardHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold">Your Handles</h2>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh All'}
        </Button>
        
        <Button onClick={onAddNew} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Handle
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
