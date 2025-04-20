
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HandleNotificationSettingsProps {
  email: string;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  onChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const HandleNotificationSettings: React.FC<HandleNotificationSettingsProps> = ({
  email,
  isSubmitting,
  isSuccess,
  error,
  onChange,
  onSubmit,
}) => (
  <form onSubmit={onSubmit} className="mt-6">
    <div className="border-t pt-6">
      <h3 className="font-medium mb-2">Notification Settings</h3>
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
            Email for notifications
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={e => onChange(e.target.value)}
            placeholder="your@email.com"
            className={error ? "border-red-500" : ""}
          />
          {error && (
            <div className="text-red-500 text-sm mt-1">{error}</div>
          )}
        </div>
        <div className="flex items-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || isSuccess}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? 'Saving...' : isSuccess ? 'Saved!' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  </form>
);

export default HandleNotificationSettings;
