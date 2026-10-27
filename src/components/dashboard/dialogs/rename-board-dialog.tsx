"use client";

import { useState } from "react";
import { Edit02Icon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/dashboard/icon";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import {
  DialogFrame,
  GhostButton,
  PaperInput,
  PrimaryButton,
} from "./dialog-frame";

export function RenameBoardDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const title = useKanbanStore((state) => state.title);
  const setTitle = useKanbanStore((state) => state.setTitle);
  const toast = useUiStore((state) => state.toast);
  const [value, setValue] = useState(title);

  const save = () => {
    if (!value.trim()) return;
    setTitle(value);
    toast("Board renamed");
    onOpenChange(false);
  };

  return (
    <DialogFrame
      open={open}
      onOpenChange={onOpenChange}
      title="Rename board"
      description="Give this sprint a name your team will recognize."
      icon={<Icon icon={Edit02Icon} size={17} strokeWidth={1.9} />}
      width={420}
      footer={
        <>
          <GhostButton onClick={() => onOpenChange(false)}>Cancel</GhostButton>
          <PrimaryButton onClick={save} disabled={!value.trim()}>
            Save name
          </PrimaryButton>
        </>
      }
    >
      <PaperInput
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") save();
        }}
        onFocus={(event) => event.target.select()}
        aria-label="Board name"
      />
    </DialogFrame>
  );
}
