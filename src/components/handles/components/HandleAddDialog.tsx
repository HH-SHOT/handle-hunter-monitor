
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AddHandleForm from '../AddHandleForm';
import { HandleFormData } from '../types';

interface HandleAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: HandleFormData) => Promise<boolean>;
}

const HandleAddDialog: React.FC<HandleAddDialogProps> = ({
  open,
  onOpenChange,
  onSave,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Handle</DialogTitle>
        </DialogHeader>
        <AddHandleForm onSave={onSave} />
      </DialogContent>
    </Dialog>
  );
};

export default HandleAddDialog;
