import type { Task } from "@/lib/kanban";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function parseDate(value: string | null | undefined) {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function toDateKey(date: Date) {
  return dayKey(date);
}

export function formatShort(value: string | null | undefined) {
  const date = parseDate(value);
  if (!date) return "No date";
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function formatLong(value: string | null | undefined) {
  const date = parseDate(value);
  if (!date) return "No date";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDue(task: Pick<Task, "dueDate" | "dueLabel">) {
  if (task.dueLabel) return task.dueLabel;
  const date = parseDate(task.dueDate);
  if (!date) return "No due date";

  const today = new Date();
  const todayKey = dayKey(today);
  const dateKey = dayKey(date);
  if (dateKey === todayKey) return "Today";

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateKey === dayKey(tomorrow)) return "Tomorrow";

  return formatShort(task.dueDate);
}

export function isOverdue(task: Pick<Task, "dueDate">) {
  const date = parseDate(task.dueDate);
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date.getTime() < today.getTime();
}

export function relativeTime(value: string) {
  const date = parseDate(value);
  if (!date) return "";
  const diff = Date.now() - date.getTime();
  const minutes = Math.max(0, Math.round(diff / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatShort(value);
}

export function isoFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function dayKeyFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return dayKey(date);
}
