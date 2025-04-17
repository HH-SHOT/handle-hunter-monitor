
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface NotificationSettingsProps {
  email: string;
  errors: {
    email: string | null;
  };
  isSubmitting: boolean;
  isSuccess: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const NotificationSettings = ({
  email,
  errors,
  isSubmitting,
  isSuccess,
  onEmailChange,
  onSubmit
}: NotificationSettingsProps) => {
  return (
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
              onChange={onEmailChange}
              placeholder="your@email.com"
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <div className="text-red-500 text-sm mt-1">{errors.email}</div>
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
};

export default NotificationSettings;
