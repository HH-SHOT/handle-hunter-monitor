
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

// Platform check methods information
export interface PlatformMethodInfo {
  platform: string;
  isOptimal: boolean;
  checkMethod: string;
  notes: string;
}

// Import the Handle type from the main types file
import { Handle } from '../types';
