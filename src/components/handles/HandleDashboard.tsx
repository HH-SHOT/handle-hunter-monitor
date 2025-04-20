import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { mockHandles } from "./mockHandles";
import { formatHandlesFromDb, convertToPlatformType, convertToStatusType } from "./handleUtils";
import HandleDashboardControls from "./dashboard/HandleDashboardControls";
import HandleNotificationSettings from "./dashboard/HandleNotificationSettings";
import HandleTable from "./dashboard/HandleTable";
import HandleActionBar from "./dashboard/HandleActionBar";
import AddHandleForm from "./AddHandleForm";
import { Handle, HandleFormData } from "./types";

// Validation functions
const validateHandles = (handles: Handle[]): string | null => {
  if (handles.length === 0) {
    return "Please add at least one handle to monitor";
  }
  return null;
};

const validateEmail = (email: string): string | null => {
  if (!email) {
    return "Email is required for notifications";
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address";
  }
  
  return null;
};

const HandleDashboard = () => {
  const { user } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedHandle, setSelectedHandle] = useState<HandleFormData>({ name: "", platform: "twitter" });
  // -- REFACTOR: manage handles and usageCount for dashboard's account tab --
  const [handles, setHandles] = useState<Handle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshingHandles, setRefreshingHandles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [email, setEmail] = useState(user?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({ handles: null as string | null, email: null as string | null });
  const [isClearing, setIsClearing] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [deletedHandlesBackup, setDeletedHandlesBackup] = useState<Handle[]>([]);
  // Usage count for account tab
  const [usageCount, setUsageCount] = useState<number>(0);

  useEffect(() => {
    if (user) {
      fetchHandles();
    } else {
      setHandles(mockHandles as Handle[]);
      setLoading(false);
    }
  }, [user]);

  const fetchHandles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("handles")
        .select("*")
        .eq("user_id", user?.id);
      if (error) throw error;
      const formattedHandles = formatHandlesFromDb(data);
      setHandles(formattedHandles.length > 0 ? formattedHandles : formatHandlesFromDb(mockHandles as any));
      setUsageCount(formattedHandles.length);
    } catch (error) {
      console.error("Error fetching handles:", error);
      setUsageCount(0);
      toast({
        title: "Error fetching handles",
        description: "There was a problem loading your handles.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // --- Clear All Handles with Undo ---
  const handleClearAll = async () => {
    setIsClearing(true);
    setDeletedHandlesBackup(handles);
    let success = false;
    if (!user) {
      // Demo mode clear
      setHandles([]);
      setUsageCount(0);
      success = true;
    } else {
      try {
        // Delete all handles for this user
        const { error } = await supabase.from("handles").delete().eq("user_id", user.id);
        if (error) throw error;
        setHandles([]);
        setUsageCount(0);
        success = true;
      } catch (error) {
        toast({
          title: "Clear failed",
          description: "Could not remove all handles.",
          variant: "destructive",
        });
      }
    }
    setIsClearing(false);
    if (success) {
      setCanUndo(true);
      toast({
        title: "Handles removed",
        description: "All handles deleted. Undo?",
        variant: "default",
        action: {
          label: "Undo",
          onClick: () => handleUndo(),
        },
        duration: 5000,
      });
      setTimeout(() => setCanUndo(false), 5000);
    }
  };

  // --- Undo Clear All ---
  const handleUndo = async () => {
    if (!deletedHandlesBackup.length) return;
    if (!user) {
      setHandles(deletedHandlesBackup);
      setUsageCount(deletedHandlesBackup.length);
    } else {
      // Re-insert handles in Supabase
      try {
        const inserts = deletedHandlesBackup.map((h) => ({
          ...h,
          user_id: user.id,
          notifications_enabled: h.notifications,
          status: h.status,
          last_checked: new Date().toISOString(),
        }));
        // Ignore id field for insertion so that Supabase will re-generate IDs (no primary key collision)
        const { error } = await supabase.from("handles").insert(inserts.map(({ id, ...rest }) => rest));
        if (error) throw error;
        fetchHandles();
      } catch (error) {
        toast({ title: "Undo failed", description: "Could not restore handles.", variant: "destructive" });
      }
    }
    setCanUndo(false);
    setDeletedHandlesBackup([]);
  };

  const handleRefresh = async () => {
    setLoading(true);
    
    if (!user) {
      // Mock refresh behavior for demo mode
      const updatedHandles = handles.map(handle => {
        if (handle.status === 'monitoring') {
          // Randomly set to available or unavailable
          const newStatus = Math.random() > 0.7 ? 'available' : 'unavailable';
          return { ...handle, status: newStatus, lastChecked: new Date().toLocaleString() };
        }
        return handle;
      });
      
      setHandles(updatedHandles);
      setLoading(false);
      
      toast({
        title: "Handles refreshed",
        description: "Your handles have been checked for availability.",
      });
      
      return;
    }
    
    try {
      // Call the edge function to refresh all handles
      const { data, error } = await supabase.functions.invoke('check-handles', {
        body: { refresh: true }
      });
      
      if (error) throw error;
      
      if (data.success) {
        // Fetch the handles again to get the updated data
        await fetchHandles();
        
        // Check if any handles changed status
        const changedHandles = data.results?.filter((result: any) => result.changed) || [];
        
        if (changedHandles.length > 0) {
          toast({
            title: `${changedHandles.length} handle${changedHandles.length > 1 ? 's' : ''} updated`,
            description: "Status changes have been detected during refresh.",
            variant: "default"
          });
        } else {
          toast({
            title: "Handles refreshed",
            description: "No status changes detected.",
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing handles:', error);
      toast({
        title: "Error refreshing handles",
        description: "There was a problem checking your handles.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckSingleHandle = async (handle: Handle) => {
    if (!user) {
      // Mock check for demo mode
      const newStatus = Math.random() > 0.7 ? 'available' : 'unavailable';
      setHandles(handles.map(h => 
        h.id === handle.id ? { ...h, status: newStatus, lastChecked: new Date().toLocaleString() } : h
      ));
      
      toast({
        title: `@${handle.name} checked`,
        description: `This handle is now ${newStatus}.`,
      });
      
      return;
    }
    
    try {
      setRefreshingHandles(prev => [...prev, handle.id]);
      
      // Call the edge function to check just this handle
      const { data, error } = await supabase.functions.invoke('check-handles', {
        body: { handleId: handle.id }
      });
      
      if (error) throw error;
      
      if (data.success && data.handle) {
        const updatedHandle = data.handle;
        
        // Update this handle in the local state
        setHandles(handles.map(h => 
          h.id === handle.id ? { 
            ...h, 
            status: convertToStatusType(updatedHandle.status), 
            lastChecked: new Date(updatedHandle.lastChecked).toLocaleString() 
          } : h
        ));
        
        toast({
          title: `@${handle.name} checked`,
          description: `This handle is now ${updatedHandle.status}.`,
        });
      }
    } catch (error) {
      console.error('Error checking handle:', error);
      toast({
        title: "Error checking handle",
        description: "There was a problem checking this handle.",
        variant: "destructive"
      });
    } finally {
      setRefreshingHandles(prev => prev.filter(id => id !== handle.id));
    }
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
    if (!user) {
      // Mock deletion for demo mode
      setHandles(handles.filter(h => h.id !== handleToDelete.id));
      toast({
        title: "Handle removed",
        description: "The handle has been removed from your list.",
      });
      return;
    }
    
    try {
      console.log("Deleting handle:", handleToDelete.id);
      
      // First delete associated history records to avoid foreign key constraint errors
      const { error: historyError } = await supabase
        .from('handle_history')
        .delete()
        .eq('handle_id', handleToDelete.id);
      
      if (historyError) {
        console.error('Error deleting handle history:', historyError);
        // Continue with handle deletion even if history deletion fails
      }
      
      // Then delete the handle itself
      const { error } = await supabase
        .from('handles')
        .delete()
        .eq('id', handleToDelete.id);
      
      if (error) {
        console.error('Error in delete operation:', error);
        throw error;
      }
      
      // Update local state after successful deletion
      setHandles(prevHandles => prevHandles.filter(h => h.id !== handleToDelete.id));
      
      toast({
        title: "Handle removed",
        description: "The handle has been removed from your monitoring list.",
      });
    } catch (error) {
      console.error('Error deleting handle:', error);
      toast({
        title: "Error removing handle",
        description: "There was a problem removing this handle. Please try again.",
        variant: "destructive"
      });
    }
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
    if (!user) {
      // Mock saving for demo mode
      if (isEditMode) {
        // Update existing handle
        setHandles(handles.map(h => 
          h.id === data.id ? { ...h, name: data.name, platform: data.platform } : h
        ));
      } else {
        // Add new handle
        const newHandle: Handle = {
          id: `mock-${Date.now()}`,
          name: data.name,
          platform: data.platform,
          status: 'monitoring',
          lastChecked: 'just now',
          notifications: true
        };
        setHandles([...handles, newHandle]);
      }
      
      setIsFormOpen(false);
      toast({
        title: isEditMode ? "Handle updated" : "Handle added",
        description: isEditMode 
          ? "Your handle has been updated successfully." 
          : "Your new handle has been added for monitoring.",
      });
      return;
    }
    
    try {
      if (isEditMode && data.id) {
        // Update existing handle
        const { error } = await supabase
          .from('handles')
          .update({
            name: data.name,
            platform: data.platform,
            updated_at: new Date().toISOString()
          })
          .eq('id', data.id);
        
        if (error) throw error;
        
        setHandles(handles.map(h => 
          h.id === data.id ? { ...h, name: data.name, platform: data.platform } : h
        ));
        
      } else {
        // Add new handle
        const { data: newHandle, error } = await supabase
          .from('handles')
          .insert({
            name: data.name,
            platform: data.platform,
            status: 'monitoring',
            user_id: user?.id,
            notifications_enabled: true,
            last_checked: new Date().toISOString()
          })
          .select()
          .single();
        
        if (error) throw error;
        
        const formattedHandle: Handle = {
          id: newHandle.id,
          name: newHandle.name,
          platform: convertToPlatformType(newHandle.platform),
          status: convertToStatusType(newHandle.status),
          lastChecked: 'just now',
          notifications: true
        };
        
        setHandles([...handles, formattedHandle]);
      }
      
      setIsFormOpen(false);
      
      toast({
        title: isEditMode ? "Handle updated" : "Handle added",
        description: isEditMode 
          ? "Your handle has been updated successfully." 
          : "Your new handle has been added for monitoring.",
      });
    } catch (error) {
      console.error('Error saving handle:', error);
      toast({
        title: "Error saving handle",
        description: "There was a problem saving your handle.",
        variant: "destructive"
      });
    }
  };

  const handleToggleNotifications = async (handle: Handle) => {
    if (!user) {
      // Mock toggle for demo mode
      setHandles(handles.map(h => 
        h.id === handle.id ? { ...h, notifications: !h.notifications } : h
      ));
      return;
    }
    
    const newNotificationState = !handle.notifications;
    
    try {
      const { error } = await supabase
        .from('handles')
        .update({
          notifications_enabled: newNotificationState,
          updated_at: new Date().toISOString()
        })
        .eq('id', handle.id);
      
      if (error) throw error;
      
      setHandles(handles.map(h => 
        h.id === handle.id ? { ...h, notifications: newNotificationState } : h
      ));
      
      toast({
        title: `Notifications ${newNotificationState ? 'enabled' : 'disabled'}`,
        description: `You will ${newNotificationState ? 'now' : 'no longer'} receive notifications for @${handle.name}.`,
      });
    } catch (error) {
      console.error('Error toggling notifications:', error);
      toast({
        title: "Error updating notifications",
        description: "There was a problem updating notification settings.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <HandleDashboardControls
        loading={loading}
        searchQuery={searchQuery}
        platformFilter={platformFilter}
        statusFilter={statusFilter}
        onRefresh={fetchHandles}
        onAddNew={() => {
          setIsEditMode(false);
          setSelectedHandle({ name: "", platform: "twitter" });
          setIsFormOpen(true);
        }}
        onSearchChange={e => setSearchQuery(e.target.value)}
        onFilterChange={(type, val) => {
          if (type === "platform") setPlatformFilter(val);
          if (type === "status") setStatusFilter(val);
        }}
        onClearFilters={() => {
          setSearchQuery("");
          setPlatformFilter(null);
          setStatusFilter(null);
        }}
      />
      <HandleActionBar
        onClearAll={handleClearAll}
        isClearing={isClearing}
        canUndo={canUndo}
        onUndo={handleUndo}
      />
      <div className="bg-white rounded-lg border shadow-sm p-6 mb-8">
        <div className="mb-4">
          {errors.handles && (
            <div className="text-red-500 text-sm mb-2">{errors.handles}</div>
          )}
        </div>
        <HandleTable
          handles={handles.filter(handle => {
            const q = searchQuery.toLowerCase();
            return (
              (!platformFilter || handle.platform === platformFilter) &&
              (!statusFilter || handle.status === statusFilter) &&
              handle.name.toLowerCase().includes(q)
            );
          })}
          loading={loading}
          refreshingHandles={refreshingHandles}
          onDelete={handleDelete} // Fill in or refactor further as needed
          onEdit={handleEdit}
          onToggleNotifications={handleToggleNotifications}
          onCheckHandle={handleCheckSingleHandle}
        />
        <HandleNotificationSettings
          email={email}
          isSubmitting={isSubmitting}
          isSuccess={isSuccess}
          error={errors.email}
          onChange={setEmail}
          onSubmit={handleSubmit}
        />
      </div>
      <AddHandleForm
        isOpen={isFormOpen}
        isEdit={isEditMode}
        initialData={selectedHandle}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveHandle}
      />
    </div>
  );
};

export default HandleDashboard;
