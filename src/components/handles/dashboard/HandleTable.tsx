
import React from "react";
import HandleList from "../HandleList";
import { Handle } from "../types";

// extracts the table section of dashboard, so props: handles, loading, refreshingHandles...
const HandleTable = ({
  handles,
  loading,
  refreshingHandles,
  onDelete,
  onEdit,
  onToggleNotifications,
  onCheckHandle,
}: {
  handles: Handle[];
  loading: boolean;
  refreshingHandles: string[];
  onDelete: (handle: Handle) => void;
  onEdit: (handle: Handle) => void;
  onToggleNotifications: (handle: Handle) => void;
  onCheckHandle: (handle: Handle) => void;
}) => (
  <HandleList
    handles={handles}
    loading={loading}
    refreshingHandles={refreshingHandles}
    onDelete={onDelete}
    onEdit={onEdit}
    onToggleNotifications={onToggleNotifications}
    onCheckHandle={onCheckHandle}
  />
);

export default HandleTable;
