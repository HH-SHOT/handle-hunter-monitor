
export interface Handle {
  id: string;
  name: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok';
  status: 'available' | 'unavailable' | 'monitoring';
  lastChecked: string;
  notifications: boolean;
}

export interface HandleFormData {
  id?: string;
  name: string;
  platform: 'twitter' | 'instagram' | 'facebook' | 'tiktok';
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
