"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Calendar03Icon,
  Cancel01Icon,
  CheckIcon,
  ChevronDownIcon,
  Delete02Icon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon, MemberAvatar } from "@/components/dashboard/icon";
import { Kbd } from "@/components/dashboard/ui";
import {
  ColumnMark,
  PriorityBars,
} from "@/components/dashboard/board/task-card-view";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { dayKeyFromNow, formatLong } from "@/lib/dates";
import {
  PRIORITIES,
  PRIORITY_META,
  resolveProjectId,
  type Priority,
} from "@/lib/kanban";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";

const VALUE_CLASS =
  "flex h-8 min-w-0 max-w-[min(320px,58vw)] items-center gap-2 rounded-[7px] border border-transparent px-2 text-left text-[12px] leading-4 text-[#0F172A] outline-none transition-colors hover:border-[#00000014] hover:bg-white focus-visible:paper-focus";

function AutoTextarea({
  value,
  onChange,
  placeholder,
  className,
  autoFocus,
  onKeyDown,
  ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  ariaLabel?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={1}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      aria-label={ariaLabel}
      className={cn(
        "field-sizing-content w-full resize-none bg-transparent outline-none placeholder:text-[#94A3B8]",
        className,
      )}
    />
  );
}

function PropertyRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-11 items-center justify-between gap-4 border-t border-[#0000000F] px-3 first:border-t-0">
      <span className="shrink-0 text-[11px] font-medium leading-4 text-[#8C8A85]">
        {label}
      </span>
      <div className="flex min-w-0 justify-end">{children}</div>
    </div>
  );
}

function PopoverPanel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <PopoverContent
      align="start"
      sideOffset={6}
      className={cn(
        "w-[240px] gap-0 rounded-[10px] border border-[#00000014] bg-white p-1.5 shadow-[0_12px_36px_rgba(15,23,42,0.14)]",
        className,
      )}
    >
      {children}
    </PopoverContent>
  );
}

function OptionRow({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-8 w-full items-center gap-2 rounded-[6px] px-2 py-1.5 text-left text-[12px] text-[#475569] outline-none transition-colors hover:bg-[#F4F4F5] hover:text-[#0F172A] focus-visible:bg-[#F4F4F5]"
    >
      {children}
      {active && (
        <Icon
          icon={CheckIcon}
          size={12}
          strokeWidth={2.4}
          className="ml-auto text-[#FF5722]"
        />
      )}
    </button>
  );
}

export function TaskDialog({
  taskId,
  defaultColumnId,
  onClose,
}: {
  taskId?: string;
  defaultColumnId?: string;
  onClose: () => void;
}) {
  const tasks = useKanbanStore((state) => state.tasks);
  const columns = useKanbanStore((state) => state.columns);
  const members = useKanbanStore((state) => state.members);
  const addTask = useKanbanStore((state) => state.addTask);
  const updateTask = useKanbanStore((state) => state.updateTask);
  const deleteTask = useKanbanStore((state) => state.deleteTask);
  const activeProject = useUiStore((state) => state.activeProject);
  const toast = useUiStore((state) => state.toast);
  const revealTask = useUiStore((state) => state.revealTask);

  const task = taskId ? tasks.find((item) => item.id === taskId) : null;
  const visibleColumns = columns.filter((column) => !column.hidden);
  const initialColumnId =
    task?.columnId ??
    defaultColumnId ??
    visibleColumns[0]?.id ??
    columns[0]?.id ??
    "todo";
  const initialColumn =
    columns.find((column) => column.id === initialColumnId) ?? columns[0];

  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [priority, setPriority] = useState<Priority>(
    task?.priority ?? "medium",
  );
  const [columnId, setColumnId] = useState(initialColumnId);
  const [assigneeIds, setAssigneeIds] = useState<string[]>(
    task?.assigneeIds ?? [],
  );
  const [dueDate, setDueDate] = useState<string | null>(task?.dueDate ?? null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [columnOpen, setColumnOpen] = useState(false);
  const [assigneeOpen, setAssigneeOpen] = useState(false);
  const [dueOpen, setDueOpen] = useState(false);

  const column =
    columns.find((item) => item.id === columnId) ?? initialColumn;
  const selectedMembers = useMemo(
    () =>
      assigneeIds
        .map((id) => members.find((member) => member.id === id))
        .filter(Boolean) as { id: string; initials: string; name: string }[],
    [assigneeIds, members],
  );
  const assigneeLabel =
    selectedMembers.length === 0
      ? "Unassigned"
      : selectedMembers.length === 1
        ? selectedMembers[0].name
        : `${selectedMembers[0].name} +${selectedMembers.length - 1}`;

  const canSave = title.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const trimmed = title.trim();
    if (task) {
      const patch: Parameters<typeof updateTask>[1] = {
        title: trimmed,
        description: description.trim(),
        priority,
        assigneeIds,
        columnId,
      };
      if ((task.dueDate ?? null) !== dueDate) patch.dueDate = dueDate;
      updateTask(task.id, patch);
      toast("Issue saved");
    } else {
      const id = addTask({
        title: trimmed,
        description,
        columnId,
        priority,
        assigneeIds,
        dueDate,
        projectId: resolveProjectId(activeProject, column?.projectId),
      });
      revealTask(id);
      toast("Issue created");
    }
    onClose();
  };

  const remove = () => {
    if (!task) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteTask(task.id);
    toast("Issue deleted");
    onClose();
  };

  const onTitleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.metaKey &&
      !event.ctrlKey &&
      !event.altKey
    ) {
      event.preventDefault();
      save();
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="scroll-thin flex max-h-[calc(100dvh-32px)] w-[600px] max-w-[calc(100vw-24px)] flex-col gap-0 overflow-hidden rounded-[16px] border border-[#00000014] bg-white p-0 text-[#0F172A] shadow-[0_24px_80px_rgba(15,23,42,0.24)] duration-150 data-open:duration-150 data-closed:duration-150 max-sm:bottom-0 max-sm:top-auto max-sm:left-0 max-sm:w-full max-sm:max-w-none! max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-[20px] sm:max-w-[600px]!"
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            save();
          }
        }}
      >
        <DialogTitle className="sr-only">
          {task ? task.title : "New issue"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          Edit the issue title, description and properties.
        </DialogDescription>

        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#0000000F] bg-[#FAFAF9] px-5 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-[7px] border border-[#FF57221F] bg-[#FFF7ED]">
              <ColumnMark column={column} size={13} />
            </span>
            <div className="flex min-w-0 items-center gap-1.5">
              <span className="shrink-0 text-[10px] font-bold uppercase leading-3 tracking-[0.08em] text-[#8C8A85]">
                {task ? "Issue" : "New issue"}
              </span>
              <span className="size-[3px] shrink-0 rounded-full bg-[#CBD5E1]" />
              <span className="truncate text-[11px] font-medium leading-4 text-[#475569]">
                {column.name}
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Close issue"
            onClick={onClose}
            className="-mr-1 flex size-8 shrink-0 items-center justify-center rounded-[8px] text-[#8C8A85] outline-none transition-colors hover:bg-[#F1EFEC] hover:text-[#0F172A] focus-visible:paper-focus"
          >
            <Icon icon={Cancel01Icon} size={16} strokeWidth={2} />
          </button>
        </div>

        <div className="scroll-thin min-h-0 flex-1 overflow-y-auto px-5 pb-5 pt-5 sm:px-6">
          <AutoTextarea
            autoFocus={!task}
            value={title}
            onChange={setTitle}
            onKeyDown={onTitleKeyDown}
            placeholder="Issue title"
            ariaLabel="Issue title"
            className="text-[18px] font-semibold leading-[26px] tracking-[-0.015em] text-[#0F172A] placeholder:text-[#B6B3AC]"
          />

          <div className="mt-1.5 text-[11px] leading-4 text-[#8C8A85]">
            {task
              ? `Created ${formatLong(task.createdAt)}`
              : "Give it a clear title, then add the details below."}
          </div>

          <div className="mt-4 rounded-[10px] border border-[#0000000F] bg-[#FAFAF9] px-3.5 py-3 transition-[border-color,box-shadow] focus-within:border-[#FF572233] focus-within:shadow-[0_0_0_3px_rgba(255,87,34,0.07)]">
            <AutoTextarea
              value={description}
              onChange={setDescription}
              placeholder="Add a description…"
              ariaLabel="Issue description"
              className="min-h-[84px] text-[13px] leading-[21px] text-[#475569] placeholder:text-[#A8A6A0]"
            />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase leading-3 tracking-[0.08em] text-[#8C8A85]">
              Details
            </div>
            <span className="text-[10px] leading-3 text-[#B6B3AC]">
              Changes save together
            </span>
          </div>

          <div className="mt-2 overflow-hidden rounded-[12px] border border-[#0000000F] bg-[#FAFAF9]">
            <PropertyRow label="Status">
              <Popover open={columnOpen} onOpenChange={setColumnOpen}>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Change status"
                      className={VALUE_CLASS}
                    >
                      <ColumnMark column={column} size={12} />
                      <span className="truncate">{column.name}</span>
                      <Icon
                        icon={ChevronDownIcon}
                        size={10}
                        strokeWidth={2}
                        className="ml-0.5 shrink-0 text-[#B6B3AC]"
                      />
                    </button>
                  }
                />
                <PopoverPanel className="w-[210px]">
                  {visibleColumns.map((item) => (
                    <OptionRow
                      key={item.id}
                      active={item.id === columnId}
                      onClick={() => {
                        setColumnId(item.id);
                        setColumnOpen(false);
                      }}
                    >
                      <ColumnMark column={item} />
                      {item.name}
                    </OptionRow>
                  ))}
                </PopoverPanel>
              </Popover>
            </PropertyRow>

            <PropertyRow label="Priority">
              <Popover open={priorityOpen} onOpenChange={setPriorityOpen}>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Change priority"
                      className={VALUE_CLASS}
                    >
                      <PriorityBars priority={priority} size={12} />
                      <span
                        className="truncate"
                        style={{
                          color: PRIORITY_META[priority].text,
                          fontWeight: PRIORITY_META[priority].weight,
                        }}
                      >
                        {PRIORITY_META[priority].label}
                      </span>
                      <Icon
                        icon={ChevronDownIcon}
                        size={10}
                        strokeWidth={2}
                        className="ml-0.5 shrink-0 text-[#B6B3AC]"
                      />
                    </button>
                  }
                />
                <PopoverPanel className="w-[190px]">
                  {PRIORITIES.map((item) => (
                    <OptionRow
                      key={item}
                      active={priority === item}
                      onClick={() => {
                        setPriority(item);
                        setPriorityOpen(false);
                      }}
                    >
                      <PriorityBars priority={item} size={12} />
                      <span
                        style={{
                          color: PRIORITY_META[item].text,
                          fontWeight: PRIORITY_META[item].weight,
                        }}
                      >
                        {PRIORITY_META[item].label}
                      </span>
                    </OptionRow>
                  ))}
                </PopoverPanel>
              </Popover>
            </PropertyRow>

            <PropertyRow label="Assignees">
              <Popover open={assigneeOpen} onOpenChange={setAssigneeOpen}>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Change assignees"
                      className={VALUE_CLASS}
                    >
                      {selectedMembers.length > 0 ? (
                        <span className="flex -space-x-0.5">
                          {selectedMembers.slice(0, 3).map((member) => (
                            <MemberAvatar
                              key={member.id}
                              initials={member.initials.slice(0, 1)}
                              size={18}
                              className="ring-2 ring-[#FAFAF9]"
                            />
                          ))}
                        </span>
                      ) : (
                        <Icon
                          icon={User02Icon}
                          size={12}
                          strokeWidth={2}
                          className="text-[#8C8A85]"
                        />
                      )}
                      <span className="truncate">{assigneeLabel}</span>
                      <Icon
                        icon={ChevronDownIcon}
                        size={10}
                        strokeWidth={2}
                        className="ml-0.5 shrink-0 text-[#B6B3AC]"
                      />
                    </button>
                  }
                />
                <PopoverPanel className="w-[240px]">
                  {members.map((member) => {
                    const active = assigneeIds.includes(member.id);
                    return (
                      <OptionRow
                        key={member.id}
                        active={active}
                        onClick={() =>
                          setAssigneeIds((current) =>
                            current.includes(member.id)
                              ? current.filter((id) => id !== member.id)
                              : [...current, member.id],
                          )
                        }
                      >
                        <MemberAvatar initials={member.initials} size={20} />
                        <span className="min-w-0">
                          <span className="block truncate text-[12px] leading-4 text-[#0F172A]">
                            {member.fullName}
                          </span>
                          <span className="block truncate text-[10px] leading-[14px] text-[#8C8A85]">
                            {member.name}
                          </span>
                        </span>
                      </OptionRow>
                    );
                  })}
                </PopoverPanel>
              </Popover>
            </PropertyRow>

            <PropertyRow label="Due date">
              <Popover open={dueOpen} onOpenChange={setDueOpen}>
                <PopoverTrigger
                  render={
                    <button
                      type="button"
                      aria-label="Change due date"
                      className={VALUE_CLASS}
                    >
                      <Icon
                        icon={Calendar03Icon}
                        size={12}
                        strokeWidth={2}
                        className="text-[#8C8A85]"
                      />
                      <span
                        className={cn(
                          "truncate",
                          dueDate ? "text-[#475569]" : "text-[#94A3B8]",
                        )}
                      >
                        {dueDate ? formatLong(dueDate) : "No due date"}
                      </span>
                      <Icon
                        icon={ChevronDownIcon}
                        size={10}
                        strokeWidth={2}
                        className="ml-0.5 shrink-0 text-[#B6B3AC]"
                      />
                    </button>
                  }
                />
                <PopoverPanel className="w-[228px] p-2.5">
                  <input
                    type="date"
                    value={dueDate ?? ""}
                    onChange={(event) =>
                      setDueDate(event.target.value || null)
                    }
                    className="h-8 w-full rounded-[7px] border border-[#00000014] bg-white px-2 text-[12px] text-[#0F172A] outline-none focus:border-[#FF572266]"
                    aria-label="Due date"
                  />
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {[
                      { label: "Today", offset: 0 },
                      { label: "Tomorrow", offset: 1 },
                      { label: "Next week", offset: 7 },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => {
                          setDueDate(dayKeyFromNow(item.offset));
                          setDueOpen(false);
                        }}
                        className="flex h-7 items-center justify-center rounded-[6px] border border-[#0000000F] bg-white text-[10px] font-medium text-[#475569] transition-colors hover:bg-[#F4F4F5]"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDueDate(null);
                      setDueOpen(false);
                    }}
                    className="mt-1.5 flex h-7 w-full items-center justify-center rounded-[6px] text-[10px] font-medium text-[#8C8A85] transition-colors hover:bg-[#F4F4F5] hover:text-[#0F172A]"
                  >
                    Clear due date
                  </button>
                </PopoverPanel>
              </Popover>
            </PropertyRow>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#0000000F] bg-white px-5 py-3.5 sm:px-6">
          <div className="shrink-0">
            {task && (
              <button
                type="button"
                onClick={remove}
                onBlur={() => setConfirmDelete(false)}
                className={cn(
                  "inline-flex h-8 items-center gap-1.5 rounded-[7px] px-2 text-[11px] font-medium outline-none transition-colors focus-visible:paper-focus",
                  confirmDelete
                    ? "bg-[#FEF2F2] text-[#DC2626]"
                    : "text-[#8C8A85] hover:bg-[#FEF2F2] hover:text-[#DC2626]",
                )}
              >
                <Icon icon={Delete02Icon} size={13} strokeWidth={2} />
                {confirmDelete ? "Confirm delete" : "Delete"}
              </button>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="mr-1 hidden items-center gap-1 whitespace-nowrap text-[10px] text-[#94A3B8] sm:flex">
              <Kbd>⌘</Kbd>
              <Kbd>↵</Kbd>
              to save
            </span>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 shrink-0 items-center whitespace-nowrap rounded-[8px] px-2.5 text-[12px] font-medium text-[#64748B] transition-colors hover:bg-[#F4F4F5] hover:text-[#0F172A]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={save}
              disabled={!canSave}
              className="flex h-8 shrink-0 items-center whitespace-nowrap rounded-[8px] bg-[#0F172A] px-4 text-[12px] font-medium text-white shadow-[0_1px_2px_#00000014] transition-colors hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {task ? "Save changes" : "Create issue"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
