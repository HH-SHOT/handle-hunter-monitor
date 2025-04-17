
import React from 'react';
import HandleList from './HandleList';
import AddHandleForm from './AddHandleForm';
import DashboardHeader from './DashboardHeader';
import SearchAndFilter from './SearchAndFilter';
import NotificationSettings from './NotificationSettings';
import { useHandleState } from './hooks/useHandleState';
import { useHandleFilters } from './hooks/useHandleFilters';
import { useNotificationSettings } from './hooks/useNotificationSettings';

const HandleDashboard = () => {
  const {
    loading,
    handles,
    refreshingHandles,
    isFormOpen,
    isEditMode,
    selectedHandle,
    handleRefresh,
    handleCheckSingleHandle,
    handleAddNew,
    handleEdit,
    handleClose,
    handleDelete,
    handleSaveHandle,
    handleToggleNotifications
  } = useHandleState();

  const {
    searchQuery,
    platformFilter,
    statusFilter,
    handleSearchChange,
    handleFilterChange,
    handleClearFilters,
    getFilteredHandles
  } = useHandleFilters(handles);

  const {
    email,
    errors,
    isSubmitting,
    isSuccess,
    handleSubmit,
    handleEmailChange
  } = useNotificationSettings(handles);

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
          onEmailChange={handleEmailChange}
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
