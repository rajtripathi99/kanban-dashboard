"use client";

import { useState } from "react";
import { GearsIcon } from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon } from "@/components/dashboard/icon";
import { Switch } from "@/components/ui/switch";
import { useKanbanStore } from "@/stores/kanban-store";
import { DISPLAY_OPTIONS, useUiStore } from "@/stores/ui-store";
import {
  DialogFrame,
  GhostButton,
  PaperInput,
  PrimaryButton,
} from "./dialog-frame";

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const teamName = useKanbanStore((state) => state.teamName);
  const setTeamName = useKanbanStore((state) => state.setTeamName);
  const tasks = useKanbanStore((state) => state.tasks);
  const columns = useKanbanStore((state) => state.columns);
  const reset = useKanbanStore((state) => state.reset);
  const display = useUiStore((state) => state.display);
  const setDisplay = useUiStore((state) => state.setDisplay);
  const toast = useUiStore((state) => state.toast);
  const [name, setName] = useState(teamName);
  const [confirmReset, setConfirmReset] = useState(false);

  const save = () => {
    setTeamName(name);
    toast("Workspace settings saved");
    onOpenChange(false);
  };

  const stats = [
    { label: "Issues", value: tasks.length },
    {
      label: "Columns",
      value: columns.filter((column) => !column.hidden).length,
    },
    {
      label: "Members",
      value: new Set(tasks.flatMap((task) => task.assigneeIds)).size,
    },
  ];

  return (
    <DialogFrame
      open={open}
      onOpenChange={onOpenChange}
      title="Workspace settings"
      description="Appearance and defaults for this workspace. Changes are stored locally."
      icon={<Icon icon={GearsIcon} size={17} strokeWidth={1.9} />}
      width={460}
      footer={
        <>
          <GhostButton onClick={() => onOpenChange(false)}>Cancel</GhostButton>
          <PrimaryButton onClick={save}>Save settings</PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[10px] border border-[#0000000F] bg-[#FAFAF9] px-3 py-2.5"
            >
              <div className="text-[17px] font-semibold leading-6 tabular-nums text-[#0F172A]">
                {stat.value}
              </div>
              <div className="text-[10px] uppercase leading-3 tracking-[0.06em] text-[#8C8A85]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase leading-3 tracking-[0.06em] text-[#8C8A85]">
            Workspace name
          </div>
          <PaperInput
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Workspace name"
          />
        </div>

        <div>
          <div className="mb-2 text-[10px] font-bold uppercase leading-3 tracking-[0.06em] text-[#8C8A85]">
            Default card fields
          </div>
          <div className="flex flex-col gap-1 rounded-[10px] border border-[#0000000F] overflow-hidden">
            {(Object.keys(display) as (keyof typeof display)[]).map((key) => (
              <div
                key={key}
                className="flex h-9 items-center justify-between border-b border-[#0000000F] px-3 text-[12px] text-[#475569] last:border-b-0"
              >
                <span id={`display-field-${key}`}>
                  {DISPLAY_OPTIONS.find((option) => option.key === key)?.label ??
                    key}
                </span>
                <Switch
                  size="sm"
                  checked={display[key]}
                  onCheckedChange={(value) => setDisplay({ [key]: value })}
                  aria-labelledby={`display-field-${key}`}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-[10px] border border-[#FECACA] bg-[#FEF2F2] px-3 py-2.5">
          <div>
            <div className="text-[12px] font-medium text-[#991B1B]">
              Reset board
            </div>
            <div className="text-[10px] leading-[15px] text-[#B91C1C]/80">
              Restore the seed data and discard local changes.
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!confirmReset) {
                setConfirmReset(true);
                return;
              }
              reset();
              setConfirmReset(false);
              toast("Board reset");
              onOpenChange(false);
            }}
            onBlur={() => setConfirmReset(false)}
            className={cn(
              "h-7 shrink-0 rounded-[7px] border px-2.5 text-[11px] font-medium transition-colors",
              confirmReset
                ? "border-[#DC2626] bg-[#DC2626] text-white"
                : "border-[#FECACA] bg-white text-[#DC2626] hover:bg-[#FEE2E2]",
            )}
          >
            {confirmReset ? "Confirm reset" : "Reset"}
          </button>
        </div>
      </div>
    </DialogFrame>
  );
}
