
import { Handle, DbHandle } from './types';

// Convert DB platform string to strict union type
export const convertToPlatformType = (
  platform: string
): 'twitter' | 'instagram' | 'twitch' | 'tiktok' => {
  if (platform === 'twitter' || platform === 'instagram' || platform === 'twitch' || platform === 'tiktok') {
    return platform;
  }
  return 'twitter'; // fallback
};

export const convertToStatusType = (
  status: string
): 'available' | 'unavailable' | 'monitoring' => {
  if (status === 'available' || status === 'unavailable' || status === 'monitoring') {
    return status as 'available' | 'unavailable' | 'monitoring';
  }
  return 'monitoring'; // fallback
};

export const formatHandlesFromDb = (data: DbHandle[]): Handle[] =>
  data.map((handle: DbHandle) => ({
    id: handle.id,
    name: handle.name,
    platform: convertToPlatformType(handle.platform),
    status: convertToStatusType(handle.status),
    lastChecked: handle.last_checked ? new Date(handle.last_checked).toLocaleString() : 'never',
    notifications: handle.notifications_enabled !== null ? handle.notifications_enabled : true,
  }));

