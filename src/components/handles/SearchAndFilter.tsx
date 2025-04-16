
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface SearchAndFilterProps {
  searchQuery: string;
  platformFilter: string | null;
  statusFilter: string | null;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFilterChange: (type: 'platform' | 'status', value: string | null) => void;
  onClearFilters: () => void;
}

const SearchAndFilter = ({
  searchQuery,
  platformFilter,
  statusFilter,
  onSearchChange,
  onFilterChange,
  onClearFilters
}: SearchAndFilterProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          onChange={(e) => onFilterChange('platform', e.target.value || null)}
        >
          <option value="">All Platforms</option>
          <option value="twitter">Twitter</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
          <option value="tiktok">TikTok</option>
        </select>
        
        <select 
          className="px-3 py-2 border rounded-md bg-white text-sm"
          value={statusFilter || ''}
          onChange={(e) => onFilterChange('status', e.target.value || null)}
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
  );
};

export default SearchAndFilter;
