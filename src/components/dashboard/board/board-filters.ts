import type { Column, Task } from "@/lib/kanban";
import { CURRENT_USER_ID } from "@/lib/kanban";
import { isOverdue } from "@/lib/dates";
import type { Filter } from "@/stores/ui-store";

export function isBacklogTask(task: Task, columns: Column[]) {
  const column = columns.find((item) => item.id === task.columnId);
  if (!column || column.kind === "done") return false;
  return column.kind === "custom" || !task.dueDate;
}

export function taskMatches(
  task: Task,
  {
    search,
    filter,
    mine,
    columns,
    projectId,
  }: {
    search: string;
    filter: Filter;
    mine: boolean;
    columns: Column[];
    projectId?: string | null;
  },
) {
  const query = search.trim().toLowerCase();
  if (
    query &&
    !task.title.toLowerCase().includes(query) &&
    !task.description.toLowerCase().includes(query)
  ) {
    return false;
  }
  if (mine && !task.assigneeIds.includes(CURRENT_USER_ID)) return false;
  if (filter.priority && task.priority !== filter.priority) return false;
  if (filter.assigneeId && !task.assigneeIds.includes(filter.assigneeId)) {
    return false;
  }
  if (filter.overdue) {
    const column = columns.find((item) => item.id === task.columnId);
    if (column?.kind === "done" || !isOverdue(task)) return false;
  }
  if (projectId && task.projectId !== projectId) return false;
  return true;
}
