import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Handle, HandleFormData } from '../types';
import { useHandleApi } from '../useHandleApi';

export const useHandleState = () => {
  const { user } = useAuth();
  const {
    loading,
    setLoading: updateLoadingState,
    refreshingHandles,
    fetchHandles,
    refreshAllHandles,
    checkSingleHandle,
    saveHandle,
    deleteHandle,
    toggleNotifications
  } = useHandleApi(user);

  const [handles, setHandles] = useState<Handle[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedHandle, setSelectedHandle] = useState<HandleFormData>({
    name: '',
    platform: 'twitter'
  });

  useEffect(() => {
    const loadHandles = async () => {
      try {
        const data = await fetchHandles();
        setHandles(data);
      } catch (error) {
        console.error("Error loading handles:", error);
      }
    };

    loadHandles();
  }, [user, fetchHandles]);

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

  const handleDelete = async (handleToDelete: Handle) => {
    const updatedHandles = await deleteHandle(handleToDelete, handles);
    setHandles(updatedHandles);
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

  return {
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
  };
};
