
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { HandleFormData } from './types';

interface AddHandleFormProps {
  isOpen: boolean;
  isEdit: boolean;
  initialData: HandleFormData;
  onClose: () => void;
  onSave: (data: HandleFormData) => void;
}

const AddHandleForm = ({ 
  isOpen, 
  isEdit, 
  initialData, 
  onClose, 
  onSave 
}: AddHandleFormProps) => {
  const [formData, setFormData] = useState<HandleFormData>(initialData);
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Handle name is required');
      return;
    }
    
    if (formData.name.includes('@')) {
      setError('Please enter the handle name without the @ symbol');
      return;
    }
    
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Handle' : 'Add New Handle'}</DialogTitle>
        </DialogHeader>
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
              >
                <option value="twitter">Twitter</option>
                <option value="instagram">Instagram</option>
                <option value="twitch">Twitch</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isEdit ? 'Update Handle' : 'Add Handle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddHandleForm;
