"use client";

import { useEffect, useRef, useState } from "react";
import { PlusIcon } from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon } from "@/components/dashboard/icon";
import { PRIORITIES, PRIORITY_META, type Priority } from "@/lib/kanban";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import { PriorityBars } from "./task-card-view";

export function NewTaskComposer({
  columnId,
  projectId,
  onClose,
}: {
  columnId: string;
  projectId: string;
  onClose: () => void;
}) {
  const addTask = useKanbanStore((state) => state.addTask);
  const toast = useUiStore((state) => state.toast);
  const revealTask = useUiStore((state) => state.revealTask);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => inputRef.current?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, []);

  const commit = () => {
    if (!title.trim()) {
      onClose();
      return;
    }
    const id = addTask({ title, columnId, priority, projectId });
    revealTask(id);
    toast("Issue added");
    setTitle("");
    onClose();
  };

  return (
    <div className="rounded-[12px] border border-[#00000014] bg-white p-3 shadow-[0_1px_2px_#0000000A,0_8px_24px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-1.5 pb-2">
        <span className="size-[5px] shrink-0 rounded-full bg-[#FF5722]" />
        <span className="text-[10px] font-semibold uppercase leading-3 tracking-[0.08em] text-[#8C8A85]">
          New issue
        </span>
        <span className="ml-auto text-[10px] leading-3 text-[#CBD5E1]">
          Enter to add
        </span>
      </div>

      <input
        ref={inputRef}
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
          if (event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
        }}
        placeholder="What needs to be done?"
        aria-label="New issue title"
        className="h-8 w-full rounded-[7px] border border-[#0000000F] bg-[#FAFAF9] px-2.5 text-[13px] leading-4 text-[#0F172A] outline-none transition-[border-color,box-shadow,background-color] placeholder:text-[#94A3B8] focus:border-[#FF572266] focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,87,34,0.08)]"
      />

      <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-[#0000000F] pt-2.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="hidden text-[9px] font-semibold uppercase leading-3 tracking-[0.07em] text-[#8C8A85] sm:inline">
            Priority
          </span>
          <div className="flex items-center gap-0.5">
            {PRIORITIES.map((item) => {
              const active = priority === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-label={`${PRIORITY_META[item].label} priority`}
                  aria-pressed={active}
                  title={PRIORITY_META[item].label}
                  onClick={() => setPriority(item)}
                  className={cn(
                    "flex size-6 items-center justify-center rounded-[6px] border transition-colors",
                    active
                      ? "border-[#FF572233] bg-[#FFF7ED]"
                      : "border-transparent hover:bg-[#F4F4F5]",
                  )}
                >
                  <PriorityBars priority={item} size={11} />
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 items-center rounded-[7px] px-2 text-[11px] font-medium text-[#64748B] transition-colors hover:bg-[#F4F4F5] hover:text-[#0F172A]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={commit}
            disabled={!title.trim()}
            className="flex h-7 items-center gap-1 rounded-[7px] bg-[#FF5722] px-2.5 text-[11px] font-medium text-white shadow-[0_1px_2px_rgba(255,87,34,0.20)] transition-colors hover:bg-[#E64A19] active:bg-[#D84315] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon icon={PlusIcon} size={10} strokeWidth={2.4} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
