export interface Handle {
  id: string;
  name: string;
  platform: 'twitter' | 'twitch';
  status: HandleStatus;
  lastChecked: string;
  notifications: boolean;
  monitoringEnabled: boolean;
}

export type HandleStatus = 'available' | 'unavailable' | 'monitoring';

export interface HandleFormData {
  id?: string;
  name: string;
  platform: 'twitter' | 'twitch';
}

export interface DbHandle {
  id: string;
  name: string;
  platform: string;
  status: string;
  last_checked: string | null;
  notifications_enabled: boolean | null;
  monitoring_enabled: boolean | null;
  created_at: string;
  user_id: string;
}

export interface HandleStatusCounts {
  available: number;
  unavailable: number;
  monitoring: number;
  total: number;
}

export interface FilterOptions {
  searchTerm: string;
  platform: string;
  statuses: HandleStatus[];
}
