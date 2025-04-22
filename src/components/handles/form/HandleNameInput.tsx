
import React from 'react';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

interface HandleNameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
}

const HandleNameInput: React.FC<HandleNameInputProps> = ({
  value,
  onChange,
  error,
  disabled
}) => {
  return (
    <div className="grid gap-2">
      <label htmlFor="name" className="text-sm font-medium">Handle Name</label>
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">@</span>
        <Input
          id="name"
          name="name"
          value={value}
          onChange={onChange}
          className="pl-8"
          placeholder="username"
          disabled={disabled}
        />
      </div>
      {error && (
        <div className="text-red-500 text-sm flex items-center mt-1">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  );
};

export default HandleNameInput;
