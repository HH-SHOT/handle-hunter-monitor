
import { Handle } from './types';

export const mockHandles: Handle[] = [
  {
    id: 'mock-1',
    name: 'twitter_example',
    platform: 'twitter',
    status: 'monitoring',
    lastChecked: 'just now',
    notifications: true
  },
  {
    id: 'mock-2',
    name: 'instagram_example',
    platform: 'instagram',
    status: 'unavailable',
    lastChecked: '10 minutes ago',
    notifications: true
  },
  {
    id: 'mock-3',
    name: 'facebook_example',
    platform: 'facebook',
    status: 'available',
    lastChecked: '1 hour ago',
    notifications: false
  }
];
