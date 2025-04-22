
export interface FilterOptions {
  searchTerm: string;
  platform: string;
  statuses: ('available' | 'unavailable' | 'monitoring')[];
}

export interface DashboardData {
  handles: Handle[];
  isLoading: boolean;
  refreshingHandles: string[];
  filterOptions: FilterOptions;
  statusCounts: {
    available: number;
    unavailable: number;
    monitoring: number;
    total: number;
  };
}

// Import the Handle type from the main types file
import { Handle } from '../types';
