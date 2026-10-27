"use client";

import { useMemo } from "react";
import { PlusIcon } from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon } from "@/components/dashboard/icon";
import { PriorityBars } from "@/components/dashboard/board/task-card-view";
import {
  COLUMN_COLOR_META,
  PROJECTS,
  PRIORITY_META,
  type Task,
} from "@/lib/kanban";
import { parseDate } from "@/lib/dates";
import { useUiStore } from "@/stores/ui-store";
import { EmptyState, ViewHeader } from "./view-header";
import { useViewData } from "./use-view-data";

const DAY = 86400000;
const PROJECT_COLORS = ["#FF5722", "#3B82F6", "#8B5CF6", "#10B981"];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function mondayOf(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + diff);
}

function diffDays(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / DAY);
}

function fmt(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

type Group = { id: string; label: string; color: string; tasks: Task[] };

export function TimelineView({ mode = "timeline" }: { mode?: "timeline" | "roadmap" }) {
  const { visibleTasks, columns, empty } = useViewData();
  const clearFilter = useUiStore((state) => state.clearFilter);
  const setSearch = useUiStore((state) => state.setSearch);
  const setMine = useUiStore((state) => state.setMine);
  const openDialog = useUiStore((state) => state.openDialog);

  const groups = useMemo<Group[]>(() => {
    if (mode === "roadmap") {
      return PROJECTS.map((project, index) => ({
        id: project.id,
        label: project.name,
        color: PROJECT_COLORS[index % PROJECT_COLORS.length],
        tasks: visibleTasks.filter((task) => task.projectId === project.id),
      })).filter((group) => group.tasks.length > 0);
    }
    return columns
      .filter((column) => !column.hidden)
      .map((column) => ({
        id: column.id,
        label: column.name,
        color: COLUMN_COLOR_META[column.color].hex,
        tasks: visibleTasks.filter((task) => task.columnId === column.id),
      }))
      .filter((group) => group.tasks.length > 0);
  }, [mode, columns, visibleTasks]);

  const range = useMemo(() => {
    const dates = visibleTasks.flatMap((task) => {
      const created = parseDate(task.createdAt);
      const due = parseDate(task.dueDate);
      return [created, due].filter(Boolean) as Date[];
    });
    const today = startOfDay(new Date());
    const earliest = dates.length
      ? new Date(Math.min(...dates.map((date) => date.getTime())))
      : new Date(today.getTime() - 7 * DAY);
    const latest = dates.length
      ? new Date(Math.max(...dates.map((date) => date.getTime())))
      : new Date(today.getTime() + 14 * DAY);
    const start = mondayOf(earliest);
    const paddedLatest = new Date(latest.getTime() + 4 * DAY);
    const endTarget = new Date(
      Math.max(paddedLatest.getTime(), start.getTime() + 20 * DAY),
    );
    const dayOffset = (endTarget.getDay() + 6) % 7;
    const end = new Date(
      endTarget.getFullYear(),
      endTarget.getMonth(),
      endTarget.getDate() + (6 - dayOffset),
    );
    const totalDays = Math.min(84, Math.max(21, diffDays(start, end) + 1));
    const weekCount = Math.ceil(totalDays / 7);
    const weeks = Array.from({ length: weekCount }, (_, index) => {
      const weekStart = new Date(start.getTime() + index * 7 * DAY);
      return { key: index, label: fmt(weekStart) };
    });
    const todayOffset = diffDays(start, today);
    const todayPct =
      todayOffset >= 0 && todayOffset < totalDays
        ? (todayOffset / totalDays) * 100
        : null;
    return { start, totalDays, weeks, todayPct };
  }, [visibleTasks]);

  const bar = (task: Task) => {
    const created = parseDate(task.createdAt) ?? range.start;
    const due = parseDate(task.dueDate);
    const from = startOfDay(created);
    const to = startOfDay(due ?? created);
    const safeTo = to.getTime() < from.getTime() ? from : to;
    const startOffset = Math.max(0, diffDays(range.start, from));
    const span = Math.max(1, diffDays(from, safeTo) + 1);
    const left = (startOffset / range.totalDays) * 100;
    const width = Math.min(100 - left, (span / range.totalDays) * 100);
    return {
      left: Math.max(0, left),
      width: Math.max(1.5, width),
      openEnded: !due,
    };
  };

  const clearAll = () => {
    clearFilter();
    setSearch("");
    setMine(false);
  };

  const scoped = groups.reduce((total, group) => total + group.tasks.length, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#FAFAF9]">
      <ViewHeader
        eyebrow={mode === "roadmap" ? "Roadmap" : "Timeline"}
        title={mode === "roadmap" ? "Roadmap" : "Sprint timeline"}
        description={
          mode === "roadmap"
            ? "Workstreams across the quarter, grouped by project."
            : "See how the sprint is pacing. Bars run from creation to due date."
        }
        actions={
          <>
            <div className="hidden items-center gap-1.5 lg:flex">
              {range.weeks.slice(0, 4).map((week) => (
                <span
                  key={week.key}
                  className="rounded-[6px] border border-[#0000000F] bg-white px-2 py-1 text-[10px] font-medium text-[#8C8A85]"
                >
                  {week.label}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                openDialog({
                  type: "new-task",
                  columnId: columns.find((column) => !column.hidden)?.id,
                })
              }
              className="flex h-8 items-center gap-1.5 rounded-[8px] bg-[#FF5722] px-3 text-[12px] font-medium text-white shadow-[0_1px_2px_rgba(255,87,34,0.20)] transition-colors hover:bg-[#E64A19] active:bg-[#D84315]"
            >
              <Icon icon={PlusIcon} size={11} strokeWidth={2.2} />
              New issue
            </button>
          </>
        }
      />

      <div className="scroll-thin min-h-0 flex-1 overflow-auto p-6">
        {empty || groups.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <EmptyState
              title={empty ? "No issues match" : "Nothing scheduled yet"}
              description={
                empty
                  ? "Try a different search or clear the active filters to see the full timeline."
                  : "Add an issue or give one a due date and it will appear on the timeline."
              }
              onClear={empty ? clearAll : undefined}
            />
          </div>
        ) : (
          <div className="mx-auto w-full min-w-[820px] max-w-[1200px] overflow-hidden rounded-[12px] border border-[#00000014] bg-white shadow-[0_1px_2px_#0000000A]">
            <div className="flex border-b border-[#0000000F] bg-[#FAFAF9]">
              <div className="sticky left-0 z-20 flex h-10 w-[240px] shrink-0 items-center border-r border-[#0000000F] bg-[#FAFAF9] px-4 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8C8A85]">
                {mode === "roadmap" ? "Project" : "Status / issue"}
              </div>
              <div className="relative flex flex-1">
                {range.weeks.map((week, index) => (
                  <div
                    key={week.key}
                    className={cn(
                      "flex h-10 flex-1 items-center border-r border-[#0000000A] px-2.5 text-[10px] font-medium text-[#8C8A85]",
                      index === range.weeks.length - 1 && "border-r-0",
                    )}
                  >
                    {week.label}
                  </div>
                ))}
              </div>
            </div>

            {groups.map((group) => (
              <div key={group.id}>
                <div className="flex border-b border-[#0000000A] bg-[#FCFCFB]">
                  <div className="sticky left-0 z-20 flex h-9 w-[240px] shrink-0 items-center gap-2 border-r border-[#0000000F] bg-[#FCFCFB] px-4">
                    <span
                      className="size-[6px] shrink-0 rounded-full"
                      style={{ background: group.color }}
                    />
                    <span className="truncate text-[11px] font-semibold text-[#0F172A]">
                      {group.label}
                    </span>
                    <span className="text-[10px] tabular-nums text-[#8C8A85]">
                      {group.tasks.length}
                    </span>
                  </div>
                  <div className="relative flex-1" />
                </div>

                {group.tasks.map((task) => {
                  const geometry = bar(task);
                  const priority = PRIORITY_META[task.priority];
                  const done = columns.find((column) => column.id === task.columnId)?.kind === "done";
                  return (
                    <div
                      key={task.id}
                      className="group flex border-b border-[#0000000A] last:border-b-0 hover:bg-[#FCFCFB]"
                    >
                      <button
                        type="button"
                        onClick={() => openDialog({ type: "task", taskId: task.id })}
                        className="sticky left-0 z-20 flex h-11 w-[240px] shrink-0 items-center gap-2 border-r border-[#0000000F] bg-white px-4 text-left outline-none transition-colors group-hover:bg-[#FCFCFB] focus-visible:bg-[#FFF7ED]"
                      >
                        <PriorityBars priority={task.priority} size={10} />
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-[12px] leading-4",
                            done ? "text-[#64748B]" : "text-[#0F172A]",
                          )}
                        >
                          {task.title}
                        </span>
                      </button>
                      <div className="relative h-11 flex-1 overflow-hidden">
                        {range.todayPct !== null && (
                          <div
                            className="pointer-events-none absolute inset-y-0 z-10 w-px bg-[#FF572266]"
                            style={{ left: `${range.todayPct}%` }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => openDialog({ type: "task", taskId: task.id })}
                          aria-label={`Open ${task.title}`}
                          title={task.title}
                          className="absolute top-1/2 flex h-6 -translate-y-1/2 items-center gap-1.5 overflow-hidden rounded-[5px] border px-2 text-left outline-none transition-shadow hover:shadow-[0_2px_8px_rgba(15,23,42,0.10)] focus-visible:paper-focus"
                          style={{
                            left: geometry.openEnded
                              ? `min(${geometry.left}%, calc(100% - 22px))`
                              : `${geometry.left}%`,
                            width: geometry.openEnded
                              ? "20px"
                              : `max(18px, ${geometry.width}%)`,
                            background: `${group.color}14`,
                            borderColor: `${group.color}33`,
                            borderStyle: geometry.openEnded ? "dashed" : "solid",
                            paddingInline: geometry.openEnded ? 0 : 8,
                            justifyContent: geometry.openEnded
                              ? "center"
                              : undefined,
                          }}
                        >
                          <span
                            className="size-[5px] shrink-0 rounded-full"
                            style={{ background: priority.icon }}
                          />
                          {!geometry.openEnded && geometry.width >= 9 && (
                            <span className="truncate text-[10px] font-medium text-[#475569]">
                              {task.title}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex h-9 shrink-0 items-center gap-4 border-t border-[#0000000F] bg-white px-6 text-[10px] text-[#8C8A85]">
        <span className="flex items-center gap-1.5">
          <span className="h-px w-4 bg-[#FF572266]" />
          Today
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-[2px] border border-[#0000001F] bg-[#F1F5F9]" />
          Work window
        </span>
        <span className="ml-auto">{scoped} issues · {range.weeks.length} weeks</span>
      </div>
    </div>
  );
}
