"use client";

import {
  Calendar03Icon,
  CheckmarkCircle02Icon,
  PlusIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon, MemberAvatar } from "@/components/dashboard/icon";
import {
  ColumnMark,
  PriorityBars,
} from "@/components/dashboard/board/task-card-view";
import { isBacklogTask } from "@/components/dashboard/board/board-filters";
import { formatDue, isOverdue } from "@/lib/dates";
import { COLUMN_COLOR_META, PRIORITY_META, memberLabel, type Task } from "@/lib/kanban";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import { EmptyState, ViewHeader } from "./view-header";
import { useViewData } from "./use-view-data";

function Row({
  task,
  done,
  color,
}: {
  task: Task;
  done: boolean;
  color: string;
}) {
  const members = useKanbanStore((state) => state.members);
  const toggleTaskDone = useKanbanStore((state) => state.toggleTaskDone);
  const openDialog = useUiStore((state) => state.openDialog);
  const priority = PRIORITY_META[task.priority];
  const overdue = !done && isOverdue(task);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openDialog({ type: "task", taskId: task.id })}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openDialog({ type: "task", taskId: task.id });
        }
      }}
      className="group flex h-11 cursor-pointer items-center gap-3 border-b border-[#0000000A] px-4 outline-none transition-colors last:border-b-0 hover:bg-[#FAFAF9] focus-visible:bg-[#FFF7ED]"
    >
      <button
        type="button"
        aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
        onClick={(event) => {
          event.stopPropagation();
          toggleTaskDone(task.id);
        }}
        className={cn(
          "flex size-[15px] shrink-0 items-center justify-center rounded-[4px] border transition-colors",
          done
            ? "border-[#A7F3D0] bg-[#ECFDF5] text-[#10B981]"
            : "border-[#CBD5E1] bg-[#F1F5F9] text-transparent hover:border-[#94A3B8] hover:text-[#64748B]",
        )}
      >
        <Icon icon={CheckmarkCircle02Icon} size={10} strokeWidth={2.4} />
      </button>

      <span
        aria-hidden
        className="size-[6px] shrink-0 rounded-full"
        style={{ background: color }}
      />

      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[13px] leading-4",
          done ? "text-[#64748B]" : "text-[#0F172A]",
        )}
      >
        {task.title}
      </span>

      <span className="hidden w-[92px] shrink-0 items-center gap-1.5 sm:flex">
        <PriorityBars priority={task.priority} size={10} />
        <span
          className="truncate text-[11px] leading-4"
          style={{ color: priority.text, fontWeight: priority.weight }}
        >
          {priority.label}
        </span>
      </span>

      <span className="hidden w-[128px] shrink-0 items-center gap-1.5 md:flex">
        {task.assigneeIds.length > 0 ? (
          <span className="flex -space-x-1">
            {task.assigneeIds.slice(0, 3).map((id) => {
              const member = members.find((item) => item.id === id);
              if (!member) return null;
              return (
                <MemberAvatar
                  key={id}
                  initials={member.initials}
                  size={18}
                  className="ring-2 ring-white"
                />
              );
            })}
          </span>
        ) : (
          <span className="size-[18px] rounded-full border border-dashed border-[#CBD5E1]" />
        )}
        <span className="truncate text-[11px] leading-4 text-[#64748B]">
          {memberLabel(task, members)}
        </span>
      </span>

      <span
        className={cn(
          "hidden w-[86px] shrink-0 items-center gap-1 text-[11px] leading-4 lg:flex",
          overdue ? "text-[#DC2626]" : "text-[#8C8A85]",
        )}
      >
        <Icon
          icon={Calendar03Icon}
          size={11}
          strokeWidth={1.9}
          className={overdue ? "text-[#DC2626]" : "text-[#94A3B8]"}
        />
        {formatDue(task)}
      </span>
    </div>
  );
}

export function ListView({ mode = "all" }: { mode?: "all" | "backlog" }) {
  const { visibleTasks, columns, filtering, empty } = useViewData();
  const clearFilter = useUiStore((state) => state.clearFilter);
  const setSearch = useUiStore((state) => state.setSearch);
  const setMine = useUiStore((state) => state.setMine);
  const openDialog = useUiStore((state) => state.openDialog);

  const openColumns = columns.filter((column) => column.kind !== "done");
  const scoped =
    mode === "backlog"
      ? visibleTasks.filter((task) => isBacklogTask(task, columns))
      : visibleTasks;

  const groups = columns
    .filter((column) =>
      mode === "backlog" ? column.kind !== "done" : !column.hidden,
    )
    .map((column) => ({
      column,
      tasks: scoped.filter((task) => task.columnId === column.id),
    }))
    .filter((group) => group.tasks.length > 0);

  const doneCount = visibleTasks.filter((task) => {
    const column = columns.find((item) => item.id === task.columnId);
    return column?.kind === "done";
  }).length;

  const clearAll = () => {
    clearFilter();
    setSearch("");
    setMine(false);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#FAFAF9]">
      <ViewHeader
        eyebrow={mode === "backlog" ? "Backlog" : "All issues"}
        title={mode === "backlog" ? "Backlog" : "Issue list"}
        description={
          mode === "backlog"
            ? "Unscheduled and unsorted work waiting to be pulled into the sprint."
            : "Every issue in this sprint, grouped by status. Click a row to open it."
        }
        actions={
          <>
            <span className="hidden items-center gap-2 sm:flex">
              <span className="rounded-[6px] border border-[#0000000F] bg-white px-2 py-1 text-[10px] font-medium text-[#64748B]">
                {scoped.length} issues
              </span>
              <span className="rounded-[6px] border border-[#0000000F] bg-white px-2 py-1 text-[10px] font-medium text-[#64748B]">
                {doneCount} done
              </span>
            </span>
            <button
              type="button"
              onClick={() => openDialog({ type: "new-task", columnId: openColumns[0]?.id })}
              className="flex h-8 items-center gap-1.5 rounded-[8px] bg-[#FF5722] px-3 text-[12px] font-medium text-white shadow-[0_1px_2px_rgba(255,87,34,0.20)] transition-colors hover:bg-[#E64A19] active:bg-[#D84315]"
            >
              <Icon icon={PlusIcon} size={11} strokeWidth={2.2} />
              New issue
            </button>
          </>
        }
      />

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-[1120px]">
          {empty ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <EmptyState
                title="No issues match"
                description="Try a different search or clear the active filters to see the full sprint."
                onClear={clearAll}
              />
            </div>
          ) : groups.length === 0 ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <EmptyState
                title={
                  mode === "backlog"
                    ? "The backlog is clear"
                    : "No issues yet"
                }
                description={
                  mode === "backlog"
                    ? "Everything is scoped into the sprint. Hidden or unscheduled issues will show up here."
                    : "Create the first issue in this sprint to get started."
                }
                onClear={filtering ? clearAll : undefined}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {groups.map(({ column, tasks }) => (
                <section key={column.id} aria-label={column.name}>
                  <div className="mb-2 flex items-center gap-2 px-1">
                    <ColumnMark column={column} />
                    <h2 className="text-[12px] font-semibold leading-4 text-[#0F172A]">
                      {column.name}
                    </h2>
                    <span className="text-[11px] leading-4 tabular-nums text-[#8C8A85]">
                      {tasks.length}
                    </span>
                    <div className="h-px flex-1 bg-[#0000000A]" />
                    <button
                      type="button"
                      aria-label={`Add issue to ${column.name}`}
                      onClick={() =>
                        openDialog({ type: "new-task", columnId: column.id })
                      }
                      className="flex size-6 items-center justify-center rounded-[6px] text-[#8C8A85] transition-colors hover:bg-[#F4F4F5] hover:text-[#0F172A]"
                    >
                      <Icon icon={PlusIcon} size={12} strokeWidth={2} />
                    </button>
                  </div>
                  <div className="overflow-hidden rounded-[12px] border border-[#00000014] bg-white shadow-[0_1px_2px_#0000000A]">
                    <div className="hidden h-8 items-center gap-3 border-b border-[#0000000A] bg-[#FAFAF9] px-4 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8C8A85] sm:flex">
                      <span className="size-[15px] shrink-0" />
                      <span className="size-[6px] shrink-0" />
                      <span className="min-w-0 flex-1">Issue</span>
                      <span className="w-[92px] shrink-0">Priority</span>
                      <span className="hidden w-[128px] shrink-0 md:block">
                        Assignee
                      </span>
                      <span className="hidden w-[86px] shrink-0 lg:block">
                        Due
                      </span>
                    </div>
                    {tasks.map((task) => (
                      <Row
                        key={task.id}
                        task={task}
                        done={column.kind === "done"}
                        color={COLUMN_COLOR_META[column.color].hex}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
