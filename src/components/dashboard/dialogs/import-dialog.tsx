"use client";

import { useMemo, useState } from "react";
import { FileAddIcon, Upload01Icon } from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon } from "@/components/dashboard/icon";
import { resolveProjectId } from "@/lib/kanban";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import {
  DialogFrame,
  GhostButton,
  PaperTextarea,
  PrimaryButton,
} from "./dialog-frame";

export function ImportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const columns = useKanbanStore((state) => state.columns);
  const importTasks = useKanbanStore((state) => state.importTasks);
  const toast = useUiStore((state) => state.toast);
  const activeProject = useUiStore((state) => state.activeProject);
  const revealTask = useUiStore((state) => state.revealTask);
  const visibleColumns = columns.filter((column) => !column.hidden);
  const [text, setText] = useState("");
  const [columnId, setColumnId] = useState(visibleColumns[0]?.id ?? "todo");

  const lines = useMemo(
    () =>
      text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    [text],
  );

  const close = () => {
    setText("");
    onOpenChange(false);
  };

  const submit = () => {
    if (lines.length === 0) return;
    const projectId = resolveProjectId(
      activeProject,
      visibleColumns.find((column) => column.id === columnId)?.projectId,
    );
    const ids = importTasks(lines, columnId, projectId);
    toast(`${ids.length} issue${ids.length === 1 ? "" : "s"} imported`);
    if (ids.length > 0) revealTask(ids[ids.length - 1]);
    close();
  };

  return (
    <DialogFrame
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title="Import issues"
      description="Paste one issue title per line. New issues land in the column you choose."
      icon={<Icon icon={Upload01Icon} size={17} strokeWidth={1.9} />}
      width={480}
      footer={
        <>
          <GhostButton onClick={close}>Cancel</GhostButton>
          <PrimaryButton onClick={submit} disabled={lines.length === 0}>
            <Icon icon={FileAddIcon} size={12} strokeWidth={2} className="mr-1.5" />
            Import {lines.length > 0 ? `${lines.length} ` : ""}
            issue{lines.length === 1 ? "" : "s"}
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase leading-3 tracking-[0.06em] text-[#8C8A85]">
            Into column
          </div>
          <div className="flex flex-wrap gap-1.5">
            {visibleColumns.map((column) => {
              const active = columnId === column.id;
              return (
                <button
                  key={column.id}
                  type="button"
                  onClick={() => setColumnId(column.id)}
                  aria-pressed={active}
                  className={cn(
                    "inline-flex h-7 items-center gap-1.5 rounded-[7px] border px-2 text-[11px] font-medium transition-colors",
                    active
                      ? "border-[#FF572266] bg-[#FFF7ED] text-[#C2410C]"
                      : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#FAFAFA] hover:text-[#0F172A]",
                  )}
                >
                  <span className="size-[5px] rounded-full bg-current" />
                  {column.name}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase leading-3 tracking-[0.06em] text-[#8C8A85]">
              Issue titles
            </div>
            <span className="text-[10px] leading-3 text-[#94A3B8]">
              {lines.length} line{lines.length === 1 ? "" : "s"}
            </span>
          </div>
          <PaperTextarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={7}
            autoFocus
            placeholder={"Improve onboarding checklist\nAdd retry budget to webhooks\nReduce cold start latency"}
            aria-label="Issue titles, one per line"
            className="min-h-[148px] font-mono text-[12px] leading-[22px]"
          />
        </div>
      </div>
    </DialogFrame>
  );
}
