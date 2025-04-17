
import { useState } from 'react';
import { Handle } from '../types';

export const useHandleFilters = (handles: Handle[]) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (type: 'platform' | 'status', value: string | null) => {
    if (type === 'platform') {
      setPlatformFilter(value);
    } else {
      setStatusFilter(value);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setPlatformFilter(null);
    setStatusFilter(null);
  };

  const getFilteredHandles = () => {
    return handles.filter(handle => {
      const matchesSearch = handle.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = !platformFilter || handle.platform === platformFilter;
      const matchesStatus = !statusFilter || handle.status === statusFilter;
      return matchesSearch && matchesPlatform && matchesStatus;
    });
  };

  return {
    searchQuery,
    platformFilter,
    statusFilter,
    handleSearchChange,
    handleFilterChange,
    handleClearFilters,
    getFilteredHandles
  };
};
