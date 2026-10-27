"use client";

import {
  ArrowRight01Icon,
  Calendar03Icon,
  CheckmarkCircle02Icon,
  Flag02Icon,
  TaskDaily01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon, MemberAvatar } from "@/components/dashboard/icon";
import { PriorityBars } from "@/components/dashboard/board/task-card-view";
import { formatDue, isOverdue, relativeTime } from "@/lib/dates";
import { PRIORITY_META } from "@/lib/kanban";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import { EmptyState, ViewHeader } from "./view-header";
import { useViewData } from "./use-view-data";

function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof TaskDaily01Icon;
  tone?: "neutral" | "brand" | "success" | "danger";
}) {
  const tones = {
    neutral: "bg-[#F1F5F9] text-[#475569]",
    brand: "bg-[#FFF7ED] text-[#FF5722]",
    success: "bg-[#ECFDF5] text-[#10B981]",
    danger: "bg-[#FEF2F2] text-[#DC2626]",
  } as const;
  return (
    <div className="flex flex-col gap-3 rounded-[12px] border border-[#00000014] bg-white p-4 shadow-[0_1px_2px_#0000000A]">
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold uppercase leading-3 tracking-[0.06em] text-[#8C8A85]">
          {label}
        </span>
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-[8px]",
            tones[tone],
          )}
        >
          <Icon icon={icon} size={13} strokeWidth={2} />
        </span>
      </div>
      <div>
        <div className="text-[24px] font-semibold leading-7 tabular-nums tracking-[-0.02em] text-[#0F172A]">
          {value}
        </div>
        <div className="mt-0.5 text-[11px] leading-4 text-[#8C8A85]">{hint}</div>
      </div>
    </div>
  );
}

export function OverviewView() {
  const { visibleTasks, columns, members, empty } = useViewData();
  const activity = useKanbanStore((state) => state.activity);
  const title = useKanbanStore((state) => state.title);
  const teamName = useKanbanStore((state) => state.teamName);
  const openDialog = useUiStore((state) => state.openDialog);
  const setNav = useUiStore((state) => state.setNav);
  const setTab = useUiStore((state) => state.setTab);

  const doneColumn = columns.find((column) => column.kind === "done");
  const done = visibleTasks.filter(
    (task) => task.columnId === doneColumn?.id,
  ).length;
  const urgent = visibleTasks.filter(
    (task) => task.priority === "urgent" && task.columnId !== doneColumn?.id,
  ).length;
  const overdue = visibleTasks.filter(
    (task) => task.columnId !== doneColumn?.id && isOverdue(task),
  ).length;
  const progress = visibleTasks.length
    ? Math.round((done / visibleTasks.length) * 100)
    : 0;
  const unassigned = visibleTasks.filter(
    (task) => task.assigneeIds.length === 0,
  ).length;

  const statusBars = columns
    .filter((column) => !column.hidden)
    .map((column) => ({
      column,
      count: visibleTasks.filter((task) => task.columnId === column.id).length,
    }));
  const maxCount = Math.max(1, ...statusBars.map((item) => item.count));

  const workload = members
    .map((member) => {
      const assigned = visibleTasks.filter((task) =>
        task.assigneeIds.includes(member.id),
      );
      const completed = assigned.filter(
        (task) => task.columnId === doneColumn?.id,
      ).length;
      return {
        member,
        assigned: assigned.length,
        completed,
        pct: assigned.length
          ? Math.round((completed / assigned.length) * 100)
          : 0,
      };
    })
    .sort((a, b) => b.assigned - a.assigned);

  const upcoming = visibleTasks
    .filter((task) => task.dueDate && task.columnId !== doneColumn?.id)
    .sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? ""))
    .slice(0, 5);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#FAFAF9]">
      <ViewHeader
        eyebrow={teamName}
        title="Sprint overview"
        description={`A live read on ${title}. Progress, workload and the next deadlines.`}
        actions={
          <button
            type="button"
            onClick={() => {
              setNav("kanban");
              setTab("board");
            }}
            className="flex h-8 items-center gap-1.5 rounded-[8px] border border-[#00000014] bg-white px-3 text-[12px] font-medium text-[#475569] transition-colors hover:bg-[#FAFAFA] hover:text-[#0F172A]"
          >
            Open board
            <Icon icon={ArrowRight01Icon} size={12} strokeWidth={2} />
          </button>
        }
      />

      <div className="scroll-thin min-h-0 flex-1 overflow-y-auto p-6">
        {empty ? (
          <div className="flex min-h-[320px] items-center justify-center">
            <EmptyState
              title="No issues match"
              description="Clear the active search or filters to see the full sprint overview."
            />
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Sprint progress"
                value={`${progress}%`}
                hint={`${done} of ${visibleTasks.length} issues complete`}
                icon={CheckmarkCircle02Icon}
                tone="success"
              />
              <StatCard
                label="Open issues"
                value={String(visibleTasks.length - done)}
                hint={`${unassigned} still unassigned`}
                icon={TaskDaily01Icon}
              />
              <StatCard
                label="Urgent"
                value={String(urgent)}
                hint={
                  urgent > 0
                    ? "Needs attention this sprint"
                    : "Nothing urgent right now"
                }
                icon={Flag02Icon}
                tone={urgent > 0 ? "brand" : "neutral"}
              />
              <StatCard
                label="Overdue"
                value={String(overdue)}
                hint={
                  overdue > 0 ? "Past the due date" : "Everything on schedule"
                }
                icon={Calendar03Icon}
                tone={overdue > 0 ? "danger" : "neutral"}
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
              <section className="rounded-[12px] border border-[#00000014] bg-white shadow-[0_1px_2px_#0000000A]">
                <div className="flex items-center justify-between border-b border-[#0000000F] px-4 py-3">
                  <div>
                    <h2 className="text-[13px] font-semibold leading-4 text-[#0F172A]">
                      Progress by status
                    </h2>
                    <p className="mt-0.5 text-[11px] leading-4 text-[#8C8A85]">
                      Where the work is sitting right now
                    </p>
                  </div>
                  <span className="rounded-full bg-[#F4F4F5] px-2 py-0.5 text-[10px] font-medium tabular-nums text-[#64748B]">
                    {visibleTasks.length} total
                  </span>
                </div>

                <div className="flex flex-col gap-3.5 p-4">
                  {statusBars.map(({ column, count }) => (
                    <div key={column.id} className="flex items-center gap-3">
                      <span className="w-[92px] shrink-0 truncate text-[11px] font-medium text-[#475569]">
                        {column.name}
                      </span>
                      <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-[#F1F5F9]">
                        <div
                          className="h-full rounded-full transition-[width] duration-300"
                          style={{
                            width: `${Math.max(count === 0 ? 0 : 6, (count / maxCount) * 100)}%`,
                            background: "#0F172A",
                            opacity: column.kind === "done" ? 0.35 : 0.9,
                          }}
                        />
                      </div>
                      <span className="w-6 shrink-0 text-right text-[11px] tabular-nums text-[#8C8A85]">
                        {count}
                      </span>
                    </div>
                  ))}

                  <div className="mt-1 flex items-center gap-3 rounded-[8px] bg-[#FAFAF9] px-3 py-2.5">
                    <Icon
                      icon={UserGroupIcon}
                      size={13}
                      className="text-[#8C8A85]"
                    />
                    <p className="min-w-0 flex-1 text-[11px] leading-4 text-[#64748B]">
                      <span className="font-medium text-[#0F172A]">
                        {members.length} teammates
                      </span>{" "}
                      · {unassigned} unassigned issue
                      {unassigned === 1 ? "" : "s"}
                    </p>
                    <button
                      type="button"
                      onClick={() => openDialog({ type: "invite" })}
                      className="shrink-0 text-[10px] font-medium text-[#FF5722] hover:text-[#E64A19]"
                    >
                      Invite
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-[12px] border border-[#00000014] bg-white shadow-[0_1px_2px_#0000000A]">
                <div className="flex items-center justify-between border-b border-[#0000000F] px-4 py-3">
                  <h2 className="text-[13px] font-semibold leading-4 text-[#0F172A]">
                    Team workload
                  </h2>
                  <span className="text-[10px] text-[#8C8A85]">This sprint</span>
                </div>
                <div className="flex flex-col p-2">
                  {workload.map(({ member, assigned, completed, pct }) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2.5 rounded-[8px] px-2 py-2 transition-colors hover:bg-[#FAFAF9]"
                    >
                      <MemberAvatar initials={member.initials} size={26} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="truncate text-[11px] font-medium text-[#0F172A]">
                            {member.fullName}
                          </span>
                          <span className="shrink-0 text-[10px] tabular-nums text-[#8C8A85]">
                            {completed}/{assigned}
                          </span>
                        </div>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-[#F1F5F9]">
                          <div
                            className="h-full rounded-full bg-[#10B981]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  {workload.length === 0 && (
                    <div className="px-3 py-6 text-center text-[11px] text-[#8C8A85]">
                      No members yet
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_1.35fr]">
              <section className="rounded-[12px] border border-[#00000014] bg-white shadow-[0_1px_2px_#0000000A]">
                <div className="flex items-center justify-between border-b border-[#0000000F] px-4 py-3">
                  <h2 className="text-[13px] font-semibold leading-4 text-[#0F172A]">
                    Upcoming
                  </h2>
                  <span className="text-[10px] text-[#8C8A85]">
                    Next deadlines
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 p-2">
                  {upcoming.map((task) => {
                    const late = isOverdue(task);
                    return (
                      <button
                        key={task.id}
                        type="button"
                        onClick={() => openDialog({ type: "task", taskId: task.id })}
                        className="flex items-center gap-2 rounded-[8px] px-2 py-2 text-left transition-colors hover:bg-[#FAFAF9]"
                      >
                        <PriorityBars priority={task.priority} size={11} />
                        <span className="min-w-0 flex-1 truncate text-[11px] text-[#0F172A]">
                          {task.title}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-[10px] tabular-nums",
                            late ? "text-[#DC2626]" : "text-[#8C8A85]",
                          )}
                        >
                          {formatDue(task)}
                        </span>
                      </button>
                    );
                  })}
                  {upcoming.length === 0 && (
                    <div className="px-3 py-6 text-center text-[11px] text-[#8C8A85]">
                      No due dates scheduled
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[12px] border border-[#00000014] bg-white shadow-[0_1px_2px_#0000000A]">
                <div className="flex items-center justify-between border-b border-[#0000000F] px-4 py-3">
                  <h2 className="text-[13px] font-semibold leading-4 text-[#0F172A]">
                    Recent activity
                  </h2>
                  <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-medium text-[#C2410C]">
                    Live
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 p-2">
                  {activity.slice(0, 6).map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-2.5 rounded-[8px] px-2 py-2 transition-colors hover:bg-[#FAFAF9]"
                    >
                      <span className="mt-1.5 size-[6px] shrink-0 rounded-full bg-[#FF5722]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] leading-[17px] text-[#475569]">
                          {item.text}
                        </p>
                        <p className="text-[10px] leading-4 text-[#94A3B8]">
                          {relativeTime(item.at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {activity.length === 0 && (
                    <div className="px-3 py-6 text-center text-[11px] text-[#8C8A85]">
                      No activity yet
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-[12px] border border-[#0000000F] bg-[#FCFCFB] px-4 py-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8C8A85]">
                Priority mix
              </span>
              <div className="flex flex-1 flex-wrap items-center gap-3">
                {(["urgent", "high", "medium", "low"] as const).map((priority) => {
                  const count = visibleTasks.filter(
                    (task) => task.priority === priority,
                  ).length;
                  return (
                    <span
                      key={priority}
                      className="flex items-center gap-1.5 text-[10px] text-[#64748B]"
                    >
                      <PriorityBars priority={priority} size={10} />
                      <span style={{ color: PRIORITY_META[priority].text }}>
                        {PRIORITY_META[priority].label}
                      </span>
                      <span className="tabular-nums text-[#8C8A85]">{count}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
