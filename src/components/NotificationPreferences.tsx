
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Bell, Mail, Smartphone, MessageSquare, Clock, Check } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPreferencesProps {
  defaultPreferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
  };
  onSave?: (preferences: {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'immediate' | 'hourly' | 'daily';
  }) => void;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  defaultPreferences = {
    email: true,
    push: true,
    sms: false,
    frequency: 'immediate'
  },
  onSave
}) => {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      // If an onSave callback was provided, call it
      if (onSave) {
        onSave(preferences);
      }

      // If user is logged in, we could save preferences to Supabase
      if (user) {
        // Example Supabase logic - uncomment and adjust as needed
        // await supabase
        //   .from('user_preferences')
        //   .upsert({ 
        //     user_id: user.id, 
        //     notifications: preferences 
        //   });
      }

      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving preferences",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-start mb-4">
        <div className="rounded-full bg-amber-100 p-2 mr-4">
          <Bell className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-lg mb-1">Notification Settings</h3>
          <p className="text-gray-600 mb-6">Choose how you want to be notified when a handle becomes available.</p>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-700">Notification Methods</h4>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-600" />
                  <Label htmlFor="email-notifications" className="cursor-pointer">Email Notifications</Label>
                </div>
                <Switch 
                  id="email-notifications" 
                  checked={preferences.email} 
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, email: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-gray-600" />
                  <Label htmlFor="push-notifications" className="cursor-pointer">Push Notifications</Label>
                </div>
                <Switch 
                  id="push-notifications" 
                  checked={preferences.push} 
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, push: checked }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4 text-gray-600" />
                  <Label htmlFor="sms-notifications" className="cursor-pointer">SMS Notifications</Label>
                </div>
                <Switch 
                  id="sms-notifications" 
                  checked={preferences.sms} 
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, sms: checked }))}
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-600" />
                <h4 className="font-medium text-gray-700">Notification Frequency</h4>
              </div>
              
              <RadioGroup 
                value={preferences.frequency} 
                onValueChange={(value: 'immediate' | 'hourly' | 'daily') => 
                  setPreferences(prev => ({ ...prev, frequency: value }))
                }
                className="flex flex-col space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="immediate" id="immediate" />
                  <Label htmlFor="immediate" className="cursor-pointer">Immediate (as soon as available)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hourly" id="hourly" />
                  <Label htmlFor="hourly" className="cursor-pointer">Hourly digest</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="cursor-pointer">Daily summary</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mt-4 flex justify-end">
        <Button 
          onClick={handleSavePreferences} 
          disabled={isSaving}
          className="bg-brand-blue hover:bg-brand-purple text-white"
        >
          {isSaving ? 'Saving...' : 'Save Notification Settings'}
          {!isSaving && <Check className="ml-2 h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default NotificationPreferences;
