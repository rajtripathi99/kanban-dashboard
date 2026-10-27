"use client";

import { CommandIcon } from "@hugeicons/core-free-icons";

import { Icon } from "@/components/dashboard/icon";
import { Kbd } from "@/components/dashboard/ui";
import { DialogFrame, PrimaryButton } from "./dialog-frame";

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["N"], label: "Create a new issue" },
  { keys: ["/"], label: "Focus search" },
  { keys: ["⌘", "K"], label: "Focus search from anywhere" },
  { keys: ["⌘", "↵"], label: "Save the open issue" },
  { keys: ["Esc"], label: "Close the dialog or menu" },
  { keys: ["?"], label: "Open keyboard shortcuts" },
];

export function HelpDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <DialogFrame
      open={open}
      onOpenChange={onOpenChange}
      title="Keyboard shortcuts"
      description="Move around the board without leaving the keyboard."
      icon={<Icon icon={CommandIcon} size={17} strokeWidth={1.9} />}
      width={440}
      footer={<PrimaryButton onClick={() => onOpenChange(false)}>Done</PrimaryButton>}
    >
      <div className="overflow-hidden rounded-[10px] border border-[#0000000F]">
        {SHORTCUTS.map((shortcut, index) => (
          <div
            key={shortcut.label}
            className={
              index === 0
                ? "flex h-10 items-center justify-between px-3"
                : "flex h-10 items-center justify-between border-t border-[#0000000F] px-3"
            }
          >
            <span className="text-[12px] text-[#475569]">{shortcut.label}</span>
            <span className="flex items-center gap-1">
              {shortcut.keys.map((key) => (
                <Kbd key={key}>{key}</Kbd>
              ))}
            </span>
          </div>
        ))}
      </div>
    </DialogFrame>
  );
}
