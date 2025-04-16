
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Handle, HandleFormData } from './types';
import { validateHandles, validateEmail } from './handleUtils';
import { useHandleApi } from './useHandleApi';
import HandleList from './HandleList';
import AddHandleForm from './AddHandleForm';
import DashboardHeader from './DashboardHeader';
import SearchAndFilter from './SearchAndFilter';
import NotificationSettings from './NotificationSettings';

const HandleDashboard = () => {
  const { user } = useAuth();
  const {
    loading,
    refreshingHandles,
    fetchHandles,
    refreshAllHandles,
    checkSingleHandle,
    saveHandle,
    deleteHandle,
    toggleNotifications
  } = useHandleApi(user);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedHandle, setSelectedHandle] = useState<HandleFormData>({
    name: '',
    platform: 'twitter'
  });
  const [handles, setHandles] = useState<Handle[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
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

  useEffect(() => {
    const loadHandles = async () => {
      const data = await fetchHandles();
      setHandles(data);
      setLoading(false);
    };

    loadHandles();
  }, [user]);

  const handleRefresh = async () => {
    const updatedHandles = await refreshAllHandles(handles);
    setHandles(updatedHandles);
  };

  const handleCheckSingleHandle = async (handle: Handle) => {
    const updatedHandles = await checkSingleHandle(handle, handles);
    setHandles(updatedHandles);
  };

  const handleAddNew = () => {
    setIsEditMode(false);
    setSelectedHandle({
      name: '',
      platform: 'twitter'
    });
    setIsFormOpen(true);
  };

  const handleEdit = (handle: Handle) => {
    setIsEditMode(true);
    setSelectedHandle({
      id: handle.id,
      name: handle.name,
      platform: handle.platform
    });
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilterChange = (type: 'platform' | 'status', value: string | null) => {
    if (type === 'platform') {
      setPlatformFilter(value);
    } else {
      setStatusFilter(value);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setPlatformFilter(null);
    setStatusFilter(null);
  };

  const getFilteredHandles = () => {
    return handles.filter(handle => {
      // Filter by search query
      const matchesSearch = handle.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Filter by platform
      const matchesPlatform = !platformFilter || handle.platform === platformFilter;
      
      // Filter by status
      const matchesStatus = !statusFilter || handle.status === statusFilter;
      
      return matchesSearch && matchesPlatform && matchesStatus;
    });
  };

  const handleDelete = async (handleToDelete: Handle) => {
    const updatedHandles = await deleteHandle(handleToDelete, handles);
    setHandles(updatedHandles);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate inputs
    const handlesError = validateHandles(handles);
    const emailError = validateEmail(email);

    setErrors({
      handles: handlesError,
      email: emailError,
    });

    // If no errors, submit form
    if (!handlesError && !emailError) {
      setIsSubmitting(true);

      // Simulate API call
      setTimeout(() => {
        setIsSubmitting(false);
        setIsSuccess(true);

        // Reset after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }, 1500);
    }
  };

  const handleSaveHandle = async (data: HandleFormData) => {
    const updatedHandles = await saveHandle(data, isEditMode, handles);
    setHandles(updatedHandles);
    setIsFormOpen(false);
  };

  const handleToggleNotifications = async (handle: Handle) => {
    const updatedHandles = await toggleNotifications(handle, handles);
    setHandles(updatedHandles);
  };

  // Helper function to set loading state (used for useEffect)
  const setLoading = (isLoading: boolean) => {
    // This is just a wrapper for the loading state from useHandleApi
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <DashboardHeader 
        loading={loading} 
        onRefresh={handleRefresh} 
        onAddNew={handleAddNew} 
      />
      
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <SearchAndFilter
          searchQuery={searchQuery}
          platformFilter={platformFilter}
          statusFilter={statusFilter}
          onSearchChange={handleSearchChange}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />
        
        <div className="mb-4">
          {errors.handles && (
            <div className="text-red-500 text-sm mb-2">{errors.handles}</div>
          )}
        </div>
        
        <HandleList
          handles={getFilteredHandles()}
          loading={loading}
          refreshingHandles={refreshingHandles}
          onDelete={handleDelete}
          onEdit={handleEdit}
          onToggleNotifications={handleToggleNotifications}
          onCheckHandle={handleCheckSingleHandle}
        />
        
        <NotificationSettings
          email={email}
          errors={{ email: errors.email }}
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
          onEmailChange={(e) => setEmail(e.target.value)}
          onSubmit={handleSubmit}
        />
      </div>
      
      <AddHandleForm
        isOpen={isFormOpen}
        isEdit={isEditMode}
        initialData={selectedHandle}
        onClose={handleClose}
        onSave={handleSaveHandle}
      />
    </div>
  );
};

export default HandleDashboard;
