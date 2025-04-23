
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HandleFormData } from '../types';

interface PlatformSelectProps {
  value: HandleFormData['platform'];
  onValueChange: (value: HandleFormData['platform']) => void;
  disabled?: boolean;
}

const PlatformSelect: React.FC<PlatformSelectProps> = ({
  value,
  onValueChange,
  disabled
}) => {
  return (
    <div className="grid gap-2">
      <label htmlFor="platform" className="text-sm font-medium">Platform</label>
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select platform" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="twitter">Twitter</SelectItem>
          <SelectItem value="twitch">Twitch</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default PlatformSelect;
