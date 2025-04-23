
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, PlusCircle, Search, Layout, List } from 'lucide-react';
import { HandleStatus } from '../types';
import { Badge } from '@/components/ui/badge';

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
  onRefresh: () => void;
  isRefetching: boolean;
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
  onRefresh,
  isRefetching,
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
            className="flex items-center gap-2 bg-brand-blue hover:bg-brand-blue/90 text-white"
          >
            <PlusCircle className="h-4 w-4" />
            Add Handle
          </Button>
          
          <Button
            onClick={onRefresh}
            variant="outline"
            disabled={isRefetching}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <div className="hidden md:flex border rounded-md">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-r-none ${viewMode === 'list' ? 'bg-gray-200 text-gray-800 hover:bg-gray-200 hover:text-gray-800' : ''}`}
              onClick={() => onViewModeChange('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-l-none ${viewMode === 'table' ? 'bg-gray-200 text-gray-800 hover:bg-gray-200 hover:text-gray-800' : ''}`}
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
            className="pl-10 border-gray-200"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedPlatform === 'all' ? 'default' : 'outline'}
            size="sm"
            className={selectedPlatform === 'all' ? 'bg-gray-800 hover:bg-gray-700' : 'text-gray-600'}
            onClick={() => onPlatformFilter('all')}
          >
            All Platforms
          </Button>
          {platforms.map(platform => (
            <Button
              key={platform}
              variant={selectedPlatform === platform ? 'default' : 'outline'}
              size="sm"
              className={selectedPlatform === platform ? 'bg-gray-800 hover:bg-gray-700' : 'text-gray-600'}
              onClick={() => onPlatformFilter(platform)}
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Button>
          ))}
        </div>
        
        <div className="h-6 border-l mx-2 hidden md:block" />
        
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline"
            className={`cursor-pointer py-1 px-3 ${
              selectedStatuses.includes('available') 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-transparent border-green-300 text-green-600 hover:bg-green-50'
            }`}
            onClick={() => handleStatusChange('available')}
          >
            Available
          </Badge>
          <Badge 
            variant="outline"
            className={`cursor-pointer py-1 px-3 ${
              selectedStatuses.includes('unavailable') 
                ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                : 'bg-transparent border-red-300 text-red-600 hover:bg-red-50'
            }`}
            onClick={() => handleStatusChange('unavailable')}
          >
            Unavailable
          </Badge>
          <Badge 
            variant="outline"
            className={`cursor-pointer py-1 px-3 ${
              selectedStatuses.includes('monitoring') 
                ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' 
                : 'bg-transparent border-blue-300 text-blue-600 hover:bg-blue-50'
            }`}
            onClick={() => handleStatusChange('monitoring')}
          >
            Monitoring
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default HandleDashboardControls;
