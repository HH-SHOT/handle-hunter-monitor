
import { Handle, DbHandle, HandleStatus } from './types';

// Convert DB platform string to strict union type
export const convertToPlatformType = (
  platform: string
): 'twitter' | 'twitch' => {
  if (platform === 'twitter' || platform === 'twitch') {
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
    monitoringEnabled: handle.monitoring_enabled !== null ? handle.monitoring_enabled : true
  }));

// Get unique platforms from handles
export const getUniquePlatforms = (handles: Handle[]): string[] => {
  const platforms = new Set<string>();
  handles.forEach(handle => {
    platforms.add(handle.platform);
  });
  return Array.from(platforms);
};

// Filter handles by platform
export const filterHandlesByPlatform = (handles: Handle[], platform: string): Handle[] => {
  return handles.filter(handle => handle.platform === platform);
};

// Get counts of handles by status
export const getHandleStatusCounts = (handles: Handle[]) => {
  return {
    available: handles.filter(h => h.status === 'available').length,
    unavailable: handles.filter(h => h.status === 'unavailable').length,
    monitoring: handles.filter(h => h.status === 'monitoring').length,
    total: handles.length
  };
};
