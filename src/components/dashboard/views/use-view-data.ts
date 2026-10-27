"use client";

import { useMemo } from "react";

import { taskMatches } from "@/components/dashboard/board/board-filters";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";

export function useViewData() {
  const tasks = useKanbanStore((state) => state.tasks);
  const columns = useKanbanStore((state) => state.columns);
  const members = useKanbanStore((state) => state.members);
  const search = useUiStore((state) => state.search);
  const filter = useUiStore((state) => state.filter);
  const mine = useUiStore((state) => state.mine);
  const activeProject = useUiStore((state) => state.activeProject);

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) =>
        taskMatches(task, {
          search,
          filter,
          mine,
          columns,
          projectId: activeProject,
        }),
      ),
    [tasks, search, filter, mine, columns, activeProject],
  );

  const filtering =
    Boolean(search.trim()) ||
    Boolean(filter.priority || filter.assigneeId || filter.overdue) ||
    mine ||
    activeProject !== null;

  return {
    tasks,
    visibleTasks,
    columns,
    members,
    filtering,
    activeProject,
    empty: visibleTasks.length === 0 && tasks.length > 0 && filtering,
  };
}
