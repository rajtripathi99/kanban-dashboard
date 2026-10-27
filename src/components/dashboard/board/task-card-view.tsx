"use client";

import {
  Calendar03Icon,
  CheckIcon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon } from "@/components/dashboard/icon";
import { formatDue, formatShort } from "@/lib/dates";
import {
  COLUMN_COLOR_META,
  memberCountLabel,
  memberLabel,
  PRIORITY_META,
  type Column,
  type Member,
  type Priority,
  type Task,
} from "@/lib/kanban";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore, type Display } from "@/stores/ui-store";

export type TaskCardViewProps = {
  task: Task;
  column: Column;
  members: Member[];
  display: Display;
  interactive?: boolean;
  lifted?: boolean;
  invisible?: boolean;
  revealed?: boolean;
  className?: string;
};

const PRIORITY_LEVEL: Record<Priority, number> = {
  urgent: 3,
  high: 3,
  medium: 2,
  low: 1,
};

export function PriorityBars({
  priority,
  size = 11,
  className,
}: {
  priority: Priority;
  size?: number;
  className?: string;
}) {
  const level = PRIORITY_LEVEL[priority];
  const color = PRIORITY_META[priority].icon;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <g
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {level >= 1 && <line x1="6" y1="20" x2="6" y2="16" />}
        {level >= 2 && <line x1="12" y1="20" x2="12" y2="10" />}
        {level >= 3 && <line x1="18" y1="20" x2="18" y2="4" />}
      </g>
    </svg>
  );
}

function Chip({
  children,
  className,
  onClick,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  label?: string;
}) {
  const classes = cn(
    "inline-flex h-7 shrink-0 items-center gap-[5px] rounded-[8px] border bg-white px-2 text-[12px] leading-4 transition-colors",
    onClick && "hover:border-[#00000029] hover:bg-[#FAFAFA]",
    className,
  );
  if (!onClick) return <span className={classes}>{children}</span>;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={classes}
    >
      {children}
    </button>
  );
}

export function ColumnMark({
  column,
  size = 14,
}: {
  column: Column;
  size?: number;
}) {
  const meta = COLUMN_COLOR_META[column.color];
  const done = column.kind === "done";
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-[3px] border"
      style={{
        width: size,
        height: size,
        background: meta.tint,
        borderColor: meta.border,
      }}
      aria-hidden
    >
      {done ? (
        <Icon
          icon={CheckIcon}
          size={Math.round(size * 0.64)}
          strokeWidth={3}
          style={{ color: meta.hex }}
        />
      ) : (
        <span
          className="rounded-full"
          style={{
            width: Math.max(4, Math.round(size * 0.28)),
            height: Math.max(4, Math.round(size * 0.28)),
            background: meta.hex,
          }}
        />
      )}
    </span>
  );
}

export function TaskCardView({
  task,
  column,
  members,
  display,
  interactive = false,
  lifted = false,
  invisible = false,
  revealed = false,
  className,
}: TaskCardViewProps) {
  const toggleTaskDone = useKanbanStore((state) => state.toggleTaskDone);
  const openDialog = useUiStore((state) => state.openDialog);
  const done = column.kind === "done";
  const showChips = display.priority || display.assignees || display.due;
  const priority = PRIORITY_META[task.priority];
  const open = () => openDialog({ type: "task", taskId: task.id });

  const completion = done ? (
    <span
      aria-hidden
      className="mt-[2px] flex size-[14px] shrink-0 items-center justify-center rounded-[3px] border border-[#A7F3D0] bg-[#ECFDF5]"
    >
      <Icon
        icon={CheckIcon}
        size={9}
        strokeWidth={3}
        className="text-[#10B981]"
      />
    </span>
  ) : (
    <button
      type="button"
      aria-label={`Complete ${task.title}`}
      onClick={(event) => {
        event.stopPropagation();
        toggleTaskDone(task.id);
      }}
      className="mt-[2px] flex size-[14px] shrink-0 items-center justify-center rounded-[3px] border border-[#CBD5E1] bg-[#F1F5F9] text-transparent transition-colors hover:border-[#94A3B8] focus-visible:paper-focus outline-none"
    >
      <Icon icon={CheckIcon} size={9} strokeWidth={3} />
    </button>
  );

  return (
    <div
      data-task-card-view
      className={cn(
        "group/card relative flex w-full flex-col overflow-hidden rounded-[12px] border border-[#00000014] bg-white shadow-[0_1px_2px_#0000000A] transition-[border-color,box-shadow,transform] duration-150",
        interactive && "hover:border-[#0000001F] hover:shadow-[0_1px_2px_#0000000A,0_8px_24px_rgba(15,23,42,0.06)]",
        lifted &&
          "rotate-[1.5deg] scale-[1.015] border-[#0000001F] shadow-[0_14px_34px_rgba(15,23,42,0.16)]",
        revealed &&
          "border-[#FF572266] bg-[#FFFBF7] shadow-[0_1px_2px_#0000000A,0_0_0_3px_rgba(255,87,34,0.12)]",
        invisible && "invisible",
        className,
      )}
    >
      <div className="flex flex-col gap-1.5 px-4 pb-3 pt-[14px]">
        <div className="flex items-start gap-2">
          {interactive ? (
            completion
          ) : done ? (
            completion
          ) : (
            <span
              aria-hidden
              className="mt-[2px] flex size-[14px] shrink-0 items-center justify-center rounded-[3px] border border-[#CBD5E1] bg-[#F1F5F9]"
            />
          )}
          <h3
            className={cn(
              "min-w-0 flex-1 break-words text-[14px] font-medium leading-[140%]",
              done ? "text-[#475569]" : "text-[#0F172A]",
            )}
          >
            {task.title}
          </h3>
        </div>
        {display.created && (
          <div className="pl-[22px] text-[13px] leading-4 text-[#8C8A85]">
            Created {formatShort(task.createdAt)} ·{" "}
            {memberCountLabel(task.followerIds.length)}
          </div>
        )}
      </div>

      {showChips && (
        <>
          <div className="h-px w-full bg-[#0000000F]" />
          <div className="flex flex-wrap items-center gap-1.5 px-4 pb-3 pt-2.5">
            {display.priority && (
              <Chip
                onClick={interactive ? open : undefined}
                label="Edit priority"
                className={cn(task.priority === "urgent" && "border-[#FF572233]")}
              >
                <PriorityBars priority={task.priority} />
                <span
                  style={{
                    color: priority.text,
                    fontWeight: priority.weight,
                  }}
                >
                  {priority.label}
                </span>
              </Chip>
            )}
            {display.assignees && (
              <Chip
                onClick={interactive ? open : undefined}
                label="Edit assignees"
              >
                <Icon
                  icon={User02Icon}
                  size={11}
                  strokeWidth={2}
                  className="text-[#64748B]"
                />
                <span className="text-[#475569]">
                  {memberLabel(task, members)}
                </span>
              </Chip>
            )}
            {display.due && (
              <Chip
                onClick={interactive ? open : undefined}
                label="Edit due date"
              >
                <Icon
                  icon={Calendar03Icon}
                  size={11}
                  strokeWidth={2}
                  className="text-[#64748B]"
                />
                <span className="text-[#475569]">{formatDue(task)}</span>
              </Chip>
            )}
          </div>
        </>
      )}
    </div>
  );
}
