
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Handle } from '../types';
import { validateHandles, validateEmail } from '../handleUtils';

export const useNotificationSettings = (handles: Handle[]) => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{
    handles: string | null;
    email: string | null;
  }>({
    handles: null,
    email: null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const handlesError = validateHandles(handles);
    const emailError = validateEmail(email);

    setErrors({
      handles: handlesError,
      email: emailError,
    });

    if (!handlesError && !emailError) {
      setIsSubmitting(true);

      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);

        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }, 1500);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return {
    email,
    errors,
    isSubmitting,
    isSuccess,
    handleSubmit,
    handleEmailChange
  };
};
