
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
