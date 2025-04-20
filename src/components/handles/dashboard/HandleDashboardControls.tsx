
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, PlusCircle, Search } from 'lucide-react';

interface HandleDashboardControlsProps {
  loading: boolean;
  searchQuery: string;
  platformFilter: string | null;
  statusFilter: string | null;
  onRefresh: () => void;
  onAddNew: () => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterChange: (type: 'platform' | 'status', value: string | null) => void;
  onClearFilters: () => void;
}

const HandleDashboardControls: React.FC<HandleDashboardControlsProps> = ({
  loading,
  searchQuery,
  platformFilter,
  statusFilter,
  onRefresh,
  onAddNew,
  onSearchChange,
  onFilterChange,
  onClearFilters,
}) => (
  <div className="mb-6 flex justify-between items-center">
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
    <div className="flex flex-col sm:flex-row gap-4 w-full ml-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          placeholder="Search handles..." 
          className="pl-10"
          value={searchQuery}
          onChange={onSearchChange}
        />
      </div>
      <div className="flex gap-2">
        <select 
          className="px-3 py-2 border rounded-md bg-white text-sm"
          value={platformFilter || ''}
          onChange={e => onFilterChange('platform', e.target.value || null)}
        >
          <option value="">All Platforms</option>
          <option value="twitter">Twitter</option>
          <option value="instagram">Instagram</option>
          <option value="twitch">Twitch</option>
          <option value="tiktok">TikTok</option>
        </select>
        <select 
          className="px-3 py-2 border rounded-md bg-white text-sm"
          value={statusFilter || ''}
          onChange={e => onFilterChange('status', e.target.value || null)}
        >
          <option value="">All Statuses</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
          <option value="monitoring">Monitoring</option>
        </select>
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear
        </Button>
      </div>
    </div>
  </div>
);

export default HandleDashboardControls;
