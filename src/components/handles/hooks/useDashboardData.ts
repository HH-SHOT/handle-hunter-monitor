
import { useHandleData } from './useHandleData';
import { useHandleOperations } from './useHandleOperations';

export const useDashboardData = () => {
  const {
    handles,
    isLoading,
    isRefetching,
    error,
    filterOptions,
    setFilterOptions,
    fetchHandles,
    refetchHandles,
    statusCounts,
  } = useHandleData();

  const {
    refreshingHandles,
    handleAddHandle,
    handleDeleteHandle,
    handleToggleNotifications,
    handleToggleMonitoring,
    handleCheckHandle,
    handleRefreshAll,
    handleClearHistory,
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
      const success = await handleDeleteHandle(handle);
      if (success) {
        await fetchHandles();
      }
      return success;
    },
    handleToggleNotifications: async (handle: any) => {
      const success = await handleToggleNotifications(handle);
      if (success) {
        await fetchHandles();
      }
      return success;
    },
    handleToggleMonitoring: async (handle: any) => {
      const success = await handleToggleMonitoring(handle);
      if (success) {
        await fetchHandles();
      }
      return success;
    },
    handleCheckHandle: async (handle: any) => {
      const success = await handleCheckHandle(handle);
      if (success) {
        await fetchHandles();
      }
      return success;
    },
    handleRefreshAll: async () => {
      const success = await handleRefreshAll();
      if (success) {
        await fetchHandles();
      }
      return success;
    },
    handleClearHistory: async () => {
      return await handleClearHistory();
    },
    manualRefetch: async () => {
      await refetchHandles();
      return true;
    }
  };

  return {
    handles,
    isLoading,
    isRefetching,
    error,
    refreshingHandles,
    filterOptions,
    setFilterOptions,
    statusCounts,
    ...operations,
  };
};
