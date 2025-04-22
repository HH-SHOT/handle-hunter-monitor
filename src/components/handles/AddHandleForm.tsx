
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { HandleFormData } from './types';
import { v4 as uuidv4 } from 'uuid';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import HandleNameInput from './form/HandleNameInput';
import PlatformSelect from './form/PlatformSelect';

interface AddHandleFormProps {
  isEdit?: boolean;
  initialData?: HandleFormData;
  onClose?: () => void;
  onSave: (data: HandleFormData) => void;
}

const AddHandleForm: React.FC<AddHandleFormProps> = ({
  isEdit = false,
  initialData = { name: '', platform: 'twitter' },
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<HandleFormData>(initialData);
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handlePlatformChange = (value: HandleFormData['platform']) => {
    setFormData(prev => ({ ...prev, platform: value }));
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
      
      const cleanName = formData.name.startsWith('@') 
        ? formData.name.substring(1) 
        : formData.name;
      
      const finalFormData = {
        ...formData,
        id: formData.id || uuidv4(),
        name: cleanName,
      };
      
      await onSave(finalFormData);
    } catch (error) {
      console.error('Error in handle form submission:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <HandleNameInput
          value={formData.name}
          onChange={handleChange}
          error={error}
          disabled={isSubmitting}
        />
        
        <PlatformSelect
          value={formData.platform}
          onValueChange={handlePlatformChange}
          disabled={isSubmitting}
        />
      </div>
      
      <div className="flex justify-end gap-2 mt-4">
        <DialogClose asChild>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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
