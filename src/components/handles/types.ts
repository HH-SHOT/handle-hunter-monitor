
export interface Handle {
  id: string;
  name: string;
  platform: 'twitter' | 'instagram' | 'twitch' | 'tiktok';
  status: 'available' | 'unavailable' | 'monitoring';
  lastChecked: string;
  notifications: boolean;
}

export type HandleStatus = 'available' | 'unavailable' | 'monitoring';

export interface HandleFormData {
  id?: string;
  name: string;
  platform: 'twitter' | 'instagram' | 'twitch' | 'tiktok';
}

export interface DbHandle {
  id: string;
  name: string;
  platform: string;
  status: string;
  last_checked: string | null;
  notifications_enabled: boolean | null;
  created_at: string;
  user_id: string;
}

export interface HandleStatusCounts {
  available: number;
  unavailable: number;
  monitoring: number;
  total: number;
}
