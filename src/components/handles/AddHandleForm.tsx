
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { HandleFormData } from './types';
import { v4 as uuidv4 } from 'uuid';
import { DialogClose } from '@/components/ui/dialog';

interface AddHandleFormProps {
  isOpen?: boolean;
  isEdit?: boolean;
  initialData?: HandleFormData;
  onClose?: () => void;
  onSave: (data: HandleFormData) => void;
}

const AddHandleForm = ({ 
  isEdit = false, 
  initialData = { name: '', platform: 'twitter' }, 
  onSave,
  onClose
}: AddHandleFormProps) => {
  const [formData, setFormData] = useState<HandleFormData>(initialData);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (!formData.name.trim()) {
        setError('Handle name is required');
        setIsSubmitting(false);
        return;
      }
      
      // Remove @ symbol if user added it
      const cleanName = formData.name.startsWith('@') 
        ? formData.name.substring(1) 
        : formData.name;
      
      const finalFormData = {
        ...formData,
        id: formData.id || uuidv4(),
        name: cleanName
      };
      
      await onSave(finalFormData);
    } catch (error) {
      console.error('Error in handle form submission:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <label htmlFor="name" className="text-sm font-medium">Handle Name</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">@</span>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="pl-8"
              placeholder="username"
              disabled={isSubmitting}
            />
          </div>
          {error && (
            <div className="text-red-500 text-sm flex items-center mt-1">
              <AlertCircle className="h-4 w-4 mr-1" />
              {error}
            </div>
          )}
        </div>
        
        <div className="grid gap-2">
          <label htmlFor="platform" className="text-sm font-medium">Platform</label>
          <select
            id="platform"
            name="platform"
            value={formData.platform}
            onChange={handleChange}
            className="rounded-md border border-gray-300 p-2"
            disabled={isSubmitting}
          >
            <option value="twitter">Twitter</option>
            <option value="instagram">Instagram</option>
            <option value="twitch">Twitch</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">
                <RefreshCw className="h-4 w-4" />
              </span>
              {isEdit ? 'Updating...' : 'Adding...'}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Handle' : 'Add Handle'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AddHandleForm;
