
import { useHandleData } from './useHandleData';
import { useHandleOperations } from './useHandleOperations';

export const useDashboardData = () => {
  const {
    handles,
    isLoading,
    filterOptions,
    setFilterOptions,
    fetchHandles,
    statusCounts,
  } = useHandleData();

  const {
    refreshingHandles,
    handleAddHandle,
    handleDeleteHandle,
    handleToggleNotifications,
    handleCheckHandle,
    handleRefreshAll,
  } = useHandleOperations();

  // After any handle operation, refresh the handles list
  const operations = {
    handleAddHandle: async (formData: any) => {
      const success = await handleAddHandle(formData);
      if (success) {
        await fetchHandles();
      }
      return success;
    },
    handleDeleteHandle: async (handle: any) => {
      await handleDeleteHandle(handle);
      await fetchHandles();
    },
    handleToggleNotifications: async (handle: any) => {
      await handleToggleNotifications(handle);
      await fetchHandles();
    },
    handleCheckHandle: async (handle: any) => {
      await handleCheckHandle(handle);
      await fetchHandles();
    },
    handleRefreshAll: async () => {
      await handleRefreshAll();
      await fetchHandles();
    },
  };

  return {
    handles,
    isLoading,
    refreshingHandles,
    filterOptions,
    setFilterOptions,
    ...operations,
  };
};
