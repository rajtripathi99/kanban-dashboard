"use client";

import { useState, type KeyboardEvent, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  Delete02Icon,
  Edit02Icon,
  EyeOffIcon,
  FilterIcon,
  MoreHorizontalIcon,
  PlusIcon,
  Sorting01Icon,
  TaskDaily01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon } from "@/components/dashboard/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Column, Member, Task } from "@/lib/kanban";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore, type Display } from "@/stores/ui-store";
import type { Placement } from "./board-drag";
import { DropSlot } from "./drop-slot";
import { NewTaskComposer } from "./new-task-composer";
import { ColumnMark } from "./task-card-view";
import { TaskCard } from "./task-card";

type BoardColumnProps = {
  column: Column;
  tasks: Task[];
  members: Member[];
  display: Display;
  activeId: string | null;
  activeTask: Task | null;
  placement: Placement | null;
  settledId: string | null;
  filtering: boolean;
  projectId: string;
  revealedId: string | null;
};

export function BoardColumn({
  column,
  tasks,
  members,
  display,
  activeId,
  activeTask,
  placement,
  settledId,
  filtering,
  projectId,
  revealedId,
}: BoardColumnProps) {
  const { setNodeRef: setColumnRef } = useDroppable({
    id: `column:${column.id}`,
    data: { type: "column", columnId: column.id },
  });
  const { setNodeRef: setTailRef } = useDroppable({
    id: `tail:${column.id}`,
    data: { type: "tail", columnId: column.id },
  });
  const renameColumn = useKanbanStore((state) => state.renameColumn);
  const setColumnHidden = useKanbanStore((state) => state.setColumnHidden);
  const sortColumn = useKanbanStore((state) => state.sortColumn);
  const deleteColumn = useKanbanStore((state) => state.deleteColumn);
  const toast = useUiStore((state) => state.toast);
  const clearFilter = useUiStore((state) => state.clearFilter);
  const setSearch = useUiStore((state) => state.setSearch);
  const setMine = useUiStore((state) => state.setMine);
  const setActiveProject = useUiStore((state) => state.setActiveProject);
  const [composing, setComposing] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(column.name);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const originIndex = tasks.findIndex((task) => task.id === activeId);
  const inColumn =
    placement !== null && placement.columnId === column.id;
  const others = tasks.length - (originIndex >= 0 ? 1 : 0);
  const slotIndex = inColumn
    ? Math.min(placement.index, others)
    : originIndex >= 0 && placement === null
      ? originIndex
      : -1;

  const nodes: ReactNode[] = [];
  let visibleIndex = 0;
  const slot = activeTask ? (
    <DropSlot
      key="drop-slot"
      task={activeTask}
      column={column}
      members={members}
      display={display}
    />
  ) : null;

  tasks.forEach((task, index) => {
    if (task.id === activeId) {
      nodes.push(
        <div
          key={task.id}
          className={cn(
            "relative h-0",
            index === 0 ? "-mb-3" : "-mt-3",
          )}
        >
          <div className="invisible absolute inset-x-0 top-0">
            <TaskCard
              task={task}
              column={column}
              members={members}
              display={display}
              hidden
            />
          </div>
        </div>,
      );
      return;
    }
    if (visibleIndex === slotIndex) nodes.push(slot);
    nodes.push(
      <TaskCard
        key={task.id}
        task={task}
        column={column}
        members={members}
        display={display}
        animateLayout={task.id !== settledId}
        revealed={task.id === revealedId}
      />,
    );
    visibleIndex += 1;
  });
  if (slotIndex >= visibleIndex && slotIndex >= 0) nodes.push(slot);

  const commitRename = () => {
    setRenaming(false);
    if (draft.trim() && draft.trim() !== column.name) {
      renameColumn(column.id, draft);
      toast("Column renamed");
    }
  };

  const onRenameKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") commitRename();
    if (event.key === "Escape") {
      setDraft(column.name);
      setRenaming(false);
    }
  };

  const startRename = () => {
    setDraft(column.name);
    setRenaming(true);
  };

  return (
    <section
      ref={setColumnRef}
      data-column-id={column.id}
      aria-label={column.name}
      className="no-scrollbar flex h-full w-[85vw] max-w-[340px] shrink-0 snap-start flex-col gap-3 overflow-y-auto overscroll-y-contain border-r border-[#0000000F] p-4 sm:w-[320px] lg:w-auto lg:max-w-none lg:min-w-[280px] lg:flex-1"
    >
      <header className="flex shrink-0 items-center justify-between gap-2 px-0.5 pb-1.5 pt-0.5">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <ColumnMark column={column} />
          {renaming ? (
            <input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onBlur={commitRename}
              onKeyDown={onRenameKey}
              aria-label="Column name"
              className="h-7 min-w-0 flex-1 rounded-[6px] border border-[#0000001F] bg-white px-2 text-[13px] font-medium leading-4 text-[#0F172A] outline-none focus:border-[#FF572266] focus:shadow-[0_0_0_3px_rgba(255,87,34,0.08)]"
            />
          ) : (
            <h2
              className="min-w-0 truncate text-[13px] font-medium leading-4 text-[#0F172A]"
              onDoubleClick={startRename}
            >
              {column.name}
            </h2>
          )}
          {!renaming && (
            <span className="text-[13px] leading-4 tabular-nums text-[#8C8A85]">
              {tasks.length}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            aria-label={`Add issue to ${column.name}`}
            onClick={() => setComposing(true)}
            className="flex size-[22px] items-center justify-center rounded-[6px] text-[#8C8A85] outline-none transition-colors hover:bg-[#F4F4F5] hover:text-[#475569] focus-visible:paper-focus"
          >
            <Icon icon={PlusIcon} size={12} strokeWidth={2} />
          </button>
          <DropdownMenu
            open={menuOpen}
            onOpenChange={(open) => {
              setMenuOpen(open);
              if (!open) setConfirmingDelete(false);
            }}
          >
            <DropdownMenuTrigger
              aria-label={`${column.name} options`}
              className="flex size-[22px] items-center justify-center rounded-[6px] text-[#8C8A85] outline-none transition-colors hover:bg-[#F4F4F5] hover:text-[#475569] focus-visible:paper-focus data-[popup-open]:bg-[#F4F4F5] data-[popup-open]:text-[#475569]"
            >
              <Icon icon={MoreHorizontalIcon} size={12} strokeWidth={2} />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="w-[196px] rounded-[10px] border border-[#00000014] bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
            >
              <DropdownMenuItem
                className="h-8 cursor-pointer gap-2 rounded-[6px] px-2 text-[12px] text-[#475569] focus:bg-[#F4F4F5] focus:text-[#0F172A]"
                onClick={() => setComposing(true)}
              >
                <Icon icon={PlusIcon} size={13} />
                Add issue
              </DropdownMenuItem>
              <DropdownMenuItem
                className="h-8 cursor-pointer gap-2 rounded-[6px] px-2 text-[12px] text-[#475569] focus:bg-[#F4F4F5] focus:text-[#0F172A]"
                onClick={startRename}
              >
                <Icon icon={Edit02Icon} size={13} />
                Rename column
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-[#F1F5F9]" />
              <DropdownMenuItem
                disabled={tasks.length < 2}
                className="h-8 cursor-pointer gap-2 rounded-[6px] px-2 text-[12px] text-[#475569] focus:bg-[#F4F4F5] focus:text-[#0F172A] data-disabled:pointer-events-none data-disabled:opacity-40"
                onClick={() => {
                  sortColumn(column.id, "priority");
                  toast("Sorted by priority");
                }}
              >
                <Icon icon={Sorting01Icon} size={13} />
                Sort by priority
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={tasks.length < 2}
                className="h-8 cursor-pointer gap-2 rounded-[6px] px-2 text-[12px] text-[#475569] focus:bg-[#F4F4F5] focus:text-[#0F172A] data-disabled:pointer-events-none data-disabled:opacity-40"
                onClick={() => {
                  sortColumn(column.id, "due");
                  toast("Sorted by due date");
                }}
              >
                <Icon icon={Sorting01Icon} size={13} />
                Sort by due date
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1 bg-[#F1F5F9]" />
              <DropdownMenuItem
                className="h-8 cursor-pointer gap-2 rounded-[6px] px-2 text-[12px] text-[#475569] focus:bg-[#F4F4F5] focus:text-[#0F172A]"
                onClick={() => {
                  setColumnHidden(column.id, true);
                  toast(`${column.name} moved to hidden columns`);
                }}
              >
                <Icon icon={EyeOffIcon} size={13} />
                Hide column
              </DropdownMenuItem>
              <DropdownMenuItem
                className={cn(
                  "h-8 cursor-pointer gap-2 rounded-[6px] px-2 text-[12px] focus:bg-[#FEF2F2]",
                  confirmingDelete ? "text-[#DC2626]" : "text-[#475569]",
                )}
                onClick={() => {
                  if (!confirmingDelete) {
                    setConfirmingDelete(true);
                    return;
                  }
                  deleteColumn(column.id);
                  setMenuOpen(false);
                  setConfirmingDelete(false);
                  toast(`${column.name} column deleted`);
                }}
                onBlur={() => setConfirmingDelete(false)}
              >
                <Icon icon={Delete02Icon} size={13} />
                {confirmingDelete ? "Confirm delete" : "Delete column"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-col gap-3">
        {composing && (
          <NewTaskComposer
            columnId={column.id}
            projectId={projectId}
            onClose={() => setComposing(false)}
          />
        )}
        {nodes}
        {tasks.length === 0 && !composing && slotIndex < 0 && (
          <div className="flex min-h-[200px] flex-col items-center gap-2 rounded-[12px] border border-dashed border-[#E4E4E7] bg-[#FAFAFA] px-3.5 py-[22px] text-center">
            <span className="flex size-8 items-center justify-center rounded-full bg-[#F1F5F9]">
              <Icon
                icon={filtering ? FilterIcon : TaskDaily01Icon}
                size={16}
                strokeWidth={1.8}
                className="text-[#64748B]"
              />
            </span>
            <span className="text-[12px] font-medium leading-4 text-[#0F172A]">
              {filtering ? "No matching issues" : "No issues here yet"}
            </span>
            <span className="max-w-[200px] text-[11px] leading-[15px] text-[#8C8A85]">
              {filtering
                ? "Clear the search or filters to see the rest of this column"
                : "Tasks added to this stage will appear here"}
            </span>
            {filtering ? (
              <button
                type="button"
                onClick={() => {
                  clearFilter();
                  setSearch("");
                  setMine(false);
                  setActiveProject(null);
                }}
                className="mt-1 inline-flex h-6 items-center rounded-[6px] border border-[#E2E8F0] bg-white px-2.5 text-[11px] font-medium leading-[14px] text-[#0F172A] transition-colors hover:border-[#CBD5E1]"
              >
                Clear filters
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setComposing(true)}
                className="mt-1 inline-flex h-6 items-center gap-[5px] rounded-[6px] border border-[#E2E8F0] bg-white px-2.5 text-[11px] font-medium leading-[14px] text-[#0F172A] transition-colors hover:border-[#CBD5E1]"
              >
                <Icon icon={PlusIcon} size={10} strokeWidth={2.4} />
                Add issue
              </button>
            )}
          </div>
        )}
      </div>

      <div
        ref={setTailRef}
        aria-hidden
        className="min-h-14 flex-1"
      />
    </section>
  );
}
