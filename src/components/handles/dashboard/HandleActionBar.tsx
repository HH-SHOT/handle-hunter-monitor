
import React from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Undo } from "lucide-react";

interface Props {
  onClearAll: () => void;
  isClearing: boolean;
  canUndo: boolean;
  onUndo: () => void;
}

const HandleActionBar: React.FC<Props> = ({ onClearAll, isClearing, canUndo, onUndo }) => (
  <div className="flex gap-2 mb-4 justify-end">
    <Button
      variant="destructive"
      onClick={onClearAll}
      disabled={isClearing}
      className="flex items-center gap-2"
    >
      <Trash2 className="h-4 w-4" /> Clear All
    </Button>
    {canUndo && (
      <Button
        variant="outline"
        onClick={onUndo}
        className="flex items-center gap-2"
      >
        <Undo className="h-4 w-4" /> Undo
      </Button>
    )}
  </div>
);

export default HandleActionBar;
