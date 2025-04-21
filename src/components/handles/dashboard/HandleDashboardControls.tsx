
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, PlusCircle, Search, Layout, List } from 'lucide-react';
import { HandleStatus } from '../types';

interface HandleDashboardControlsProps {
  searchTerm: string;
  onSearch: (term: string) => void;
  platforms: string[];
  selectedPlatform: string;
  onPlatformFilter: (platform: string) => void;
  selectedStatuses: HandleStatus[];
  onStatusFilter: (statuses: HandleStatus[]) => void;
  viewMode: 'list' | 'table';
  onViewModeChange: (mode: 'list' | 'table') => void;
  onAddHandle: () => void;
}

const HandleDashboardControls: React.FC<HandleDashboardControlsProps> = ({
  searchTerm,
  onSearch,
  platforms,
  selectedPlatform,
  onPlatformFilter,
  selectedStatuses,
  onStatusFilter,
  viewMode,
  onViewModeChange,
  onAddHandle,
}) => {
  const handleStatusChange = (status: HandleStatus) => {
    let newStatuses = [...selectedStatuses];
    
    if (newStatuses.includes(status)) {
      // Remove status if already selected
      newStatuses = newStatuses.filter(s => s !== status);
    } else {
      // Add status if not selected
      newStatuses.push(status);
    }
    
    // Don't allow empty selection, revert to all statuses if trying to deselect all
    if (newStatuses.length === 0) {
      newStatuses = ['available', 'unavailable', 'monitoring'];
    }
    
    onStatusFilter(newStatuses);
  };

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2">
          <Button
            onClick={onAddHandle}
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Add Handle
          </Button>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-r-none"
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className="rounded-l-none"
              onClick={() => onViewModeChange('table')}
            >
              <Layout className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search handles..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedPlatform === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPlatformFilter('all')}
          >
            All Platforms
          </Button>
          {platforms.map(platform => (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPlatformFilter(platform)}
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Button>
          ))}
        </div>
        
        <div className="h-6 border-l mx-2" />
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedStatuses.includes('available') ? 'default' : 'outline'}
            size="sm"
            className={selectedStatuses.includes('available') ? 'bg-green-600 hover:bg-green-700' : 'text-green-600 border-green-600 hover:bg-green-50'}
            onClick={() => handleStatusChange('available')}
          >
            Available
          </Button>
          <Button
            variant={selectedStatuses.includes('unavailable') ? 'default' : 'outline'}
            size="sm"
            className={selectedStatuses.includes('unavailable') ? 'bg-red-600 hover:bg-red-700' : 'text-red-600 border-red-600 hover:bg-red-50'}
            onClick={() => handleStatusChange('unavailable')}
          >
            Unavailable
          </Button>
          <Button
            variant={selectedStatuses.includes('monitoring') ? 'default' : 'outline'}
            size="sm"
            className={selectedStatuses.includes('monitoring') ? 'bg-blue-600 hover:bg-blue-700' : 'text-blue-600 border-blue-600 hover:bg-blue-50'}
            onClick={() => handleStatusChange('monitoring')}
          >
            Monitoring
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HandleDashboardControls;
