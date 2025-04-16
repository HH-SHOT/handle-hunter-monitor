
import { Handle, DbHandle } from './types';

export const convertToPlatformType = (platform: string): 'twitter' | 'instagram' | 'facebook' | 'tiktok' => {
  if (platform === 'twitter' || platform === 'instagram' || platform === 'facebook' || platform === 'tiktok') {
    return platform;
  }
  return 'twitter'; // Default fallback
};

export const convertToStatusType = (status: string): 'available' | 'unavailable' | 'monitoring' => {
  if (status === 'available' || status === 'unavailable' || status === 'monitoring') {
    return status;
  }
  return 'monitoring'; // Default fallback
};

export const validateHandles = (handles: Handle[]): string | null => {
  if (handles.length === 0) {
    return "Please add at least one handle to monitor";
  }
  return null;
};

export const validateEmail = (email: string): string | null => {
  if (!email) {
    return "Email is required for notifications";
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  
  return null;
};

export const formatHandlesFromDb = (data: DbHandle[]): Handle[] => {
  return data.map((handle) => ({
    id: handle.id,
    name: handle.name,
    platform: convertToPlatformType(handle.platform),
    status: convertToStatusType(handle.status),
    lastChecked: handle.last_checked ? new Date(handle.last_checked).toLocaleString() : 'never',
    notifications: handle.notifications_enabled !== null ? handle.notifications_enabled : true,
  }));
};
