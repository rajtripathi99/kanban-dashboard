"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import {
  createId,
  CURRENT_USER_ID,
  PRIORITY_META,
  seedData,
  type BoardData,
  type ColumnColor,
  type Priority,
  type Task,
} from "@/lib/kanban";

export type TaskInput = {
  title: string;
  description?: string;
  columnId: string;
  priority?: Priority;
  assigneeIds?: string[];
  dueDate?: string | null;
  projectId?: string;
};

type KanbanState = BoardData & {
  hydrated: boolean;
  setHydrated: () => void;
  setTitle: (title: string) => void;
  setTeamName: (name: string) => void;
  toggleFavorite: () => void;
  addMember: (name: string) => string;
  addTask: (input: TaskInput) => string;
  importTasks: (
    titles: string[],
    columnId: string,
    projectId?: string,
  ) => string[];
  updateTask: (id: string, patch: Partial<Omit<Task, "id">>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, columnId: string, beforeId: string | null) => void;
  toggleTaskDone: (id: string) => void;
  sortColumn: (columnId: string, by: "priority" | "due") => void;
  addColumn: (input: {
    name: string;
    color: ColumnColor;
    projectId?: string;
  }) => string;
  renameColumn: (id: string, name: string) => void;
  setColumnHidden: (id: string, hidden: boolean) => void;
  deleteColumn: (id: string) => void;
  showAllColumns: () => void;
  reset: () => void;
};

const MAX_ACTIVITY = 60;

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function withActivity(activity: BoardData["activity"], text: string) {
  return [
    { id: createId(), text, at: new Date().toISOString() },
    ...activity,
  ].slice(0, MAX_ACTIVITY);
}

function insertAt(
  tasks: Task[],
  moving: Task,
  columnId: string,
  beforeId: string | null,
) {
  const rest = tasks.filter((task) => task.id !== moving.id);
  const moved = { ...moving, columnId };
  const inColumn = rest.filter((task) => task.columnId === columnId);
  const target = beforeId ? rest.find((task) => task.id === beforeId) : null;

  if (target && target.columnId === columnId) {
    const at = rest.indexOf(target);
    return [...rest.slice(0, at), moved, ...rest.slice(at)];
  }
  if (inColumn.length === 0) return [...rest, moved];
  const last = inColumn[inColumn.length - 1];
  const at = rest.indexOf(last) + 1;
  return [...rest.slice(0, at), moved, ...rest.slice(at)];
}

function initialsFor(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set, get) => ({
      ...seedData(),
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      setTitle: (title) => set({ title: title.trim() || get().title }),
      setTeamName: (name) => set({ teamName: name.trim() || get().teamName }),
      toggleFavorite: () => set((state) => ({ favorite: !state.favorite })),
      addMember: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return "";
        const id = createId();
        set((state) => ({
          members: [
            ...state.members,
            {
              id,
              name: trimmed,
              fullName: trimmed,
              initials: initialsFor(trimmed),
            },
          ],
          activity: withActivity(
            state.activity,
            `${trimmed} joined ${state.teamName}`,
          ),
        }));
        return id;
      },
      addTask: (input) => {
        const id = createId();
        set((state) => {
          const now = new Date().toISOString();
          const task: Task = {
            id,
            title: input.title.trim(),
            description: input.description?.trim() ?? "",
            columnId: input.columnId,
            priority: input.priority ?? "medium",
            assigneeIds: input.assigneeIds ?? [],
            followerIds: [CURRENT_USER_ID],
            createdAt: now,
            dueDate: input.dueDate ?? null,
            dueLabel: null,
            projectId: input.projectId ?? "core-api",
          };
          return {
            tasks: [...state.tasks, task],
            activity: withActivity(
              state.activity,
              `You created “${task.title}”`,
            ),
          };
        });
        return id;
      },
      importTasks: (titles, columnId, projectId) => {
        const clean = titles.map((title) => title.trim()).filter(Boolean);
        if (clean.length === 0) return [];
        const ids = clean.map(() => createId());
        set((state) => {
          const now = new Date().toISOString();
          const created = clean.map<Task>((title, index) => ({
            id: ids[index],
            title,
            description: "",
            columnId,
            priority: "medium",
            assigneeIds: [],
            followerIds: [CURRENT_USER_ID],
            createdAt: now,
            dueDate: null,
            dueLabel: null,
            projectId: projectId ?? "core-api",
          }));
          return {
            tasks: [...state.tasks, ...created],
            activity: withActivity(
              state.activity,
              `You imported ${clean.length} issue${clean.length === 1 ? "" : "s"}`,
            ),
          };
        });
        return ids;
      },
      updateTask: (id, patch) =>
        set((state) => {
          const current = state.tasks.find((task) => task.id === id);
          if (!current) return state;
          const next: Task = {
            ...current,
            ...patch,
            ...("dueDate" in patch ? { dueLabel: null } : {}),
          };
          let activity = state.activity;
          if (patch.columnId && patch.columnId !== current.columnId) {
            const column = state.columns.find(
              (item) => item.id === patch.columnId,
            );
            activity = withActivity(
              activity,
              `You moved “${next.title}” to ${column?.name ?? "another column"}`,
            );
          } else if (patch.priority && patch.priority !== current.priority) {
            activity = withActivity(
              activity,
              `You set “${next.title}” to ${PRIORITY_META[patch.priority].label} priority`,
            );
          } else {
            activity = withActivity(activity, `You updated “${next.title}”`);
          }
          const tasks =
            patch.columnId && patch.columnId !== current.columnId
              ? insertAt(state.tasks, next, patch.columnId, null)
              : state.tasks.map((task) => (task.id === id ? next : task));
          return { tasks, activity };
        }),
      deleteTask: (id) =>
        set((state) => {
          const task = state.tasks.find((item) => item.id === id);
          if (!task) return state;
          return {
            tasks: state.tasks.filter((item) => item.id !== id),
            activity: withActivity(
              state.activity,
              `You deleted “${task.title}”`,
            ),
          };
        }),
      moveTask: (id, columnId, beforeId) =>
        set((state) => {
          const task = state.tasks.find((item) => item.id === id);
          if (!task) return state;
          const tasks = insertAt(state.tasks, task, columnId, beforeId);
          if (task.columnId === columnId) return { tasks };
          const column = state.columns.find((item) => item.id === columnId);
          return {
            tasks,
            activity: withActivity(
              state.activity,
              `You moved “${task.title}” to ${column?.name ?? columnId}`,
            ),
          };
        }),
      toggleTaskDone: (id) =>
        set((state) => {
          const task = state.tasks.find((item) => item.id === id);
          if (!task) return state;
          const currentColumn = state.columns.find(
            (column) => column.id === task.columnId,
          );
          const doneColumn = state.columns.find(
            (column) => column.kind === "done",
          );
          const firstColumn = state.columns.find(
            (column) => !column.hidden && column.kind !== "done",
          );
          const target =
            currentColumn?.kind === "done" ? firstColumn : doneColumn;
          if (!target) return state;
          const tasks = insertAt(state.tasks, task, target.id, null);
          return {
            tasks,
            activity: withActivity(
              state.activity,
              currentColumn?.kind === "done"
                ? `You reopened “${task.title}”`
                : `You completed “${task.title}”`,
            ),
          };
        }),
      sortColumn: (columnId, by) =>
        set((state) => {
          const inColumn = state.tasks.filter(
            (task) => task.columnId === columnId,
          );
          const sorted = [...inColumn].sort((a, b) => {
            if (by === "priority") {
              return (
                PRIORITY_META[a.priority].rank -
                PRIORITY_META[b.priority].rank
              );
            }
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return a.dueDate.localeCompare(b.dueDate);
          });
          let cursor = 0;
          return {
            tasks: state.tasks.map((task) =>
              task.columnId === columnId ? sorted[cursor++] : task,
            ),
          };
        }),
      addColumn: ({ name, color, projectId }) => {
        const id = createId();
        const trimmed = name.trim();
        if (!trimmed) return "";
        set((state) => {
          const column = {
            id,
            name: trimmed,
            color,
            kind: "custom" as const,
            hidden: false,
            projectId: projectId ?? "core-api",
          };
          const visibleCount = state.columns.filter(
            (item) => !item.hidden,
          ).length;
          const columns = [...state.columns];
          columns.splice(visibleCount, 0, column);
          return {
            columns,
            activity: withActivity(
              state.activity,
              `You added the ${trimmed} column`,
            ),
          };
        });
        return id;
      },
      renameColumn: (id, name) =>
        set((state) => {
          const trimmed = name.trim();
          if (!trimmed) return state;
          return {
            columns: state.columns.map((column) =>
              column.id === id ? { ...column, name: trimmed } : column,
            ),
            activity: withActivity(
              state.activity,
              `You renamed a column to ${trimmed}`,
            ),
          };
        }),
      setColumnHidden: (id, hidden) =>
        set((state) => ({
          columns: state.columns.map((column) =>
            column.id === id ? { ...column, hidden } : column,
          ),
        })),
      deleteColumn: (id) =>
        set((state) => {
          const column = state.columns.find((item) => item.id === id);
          if (!column) return state;
          const fallback =
            state.columns.find(
              (item) => item.id !== id && !item.hidden && item.kind !== "done",
            ) ??
            state.columns.find((item) => item.id !== id && !item.hidden) ??
            state.columns.find((item) => item.id !== id);
          if (!fallback) return state;
          return {
            columns: state.columns.filter((item) => item.id !== id),
            tasks: state.tasks.map((task) =>
              task.columnId === id ? { ...task, columnId: fallback.id } : task,
            ),
            activity: withActivity(
              state.activity,
              `You deleted the ${column.name} column`,
            ),
          };
        }),
      showAllColumns: () =>
        set((state) => ({
          columns: state.columns.map((column) => ({
            ...column,
            hidden: false,
          })),
        })),
      reset: () =>
        set((state) => ({
          ...seedData(),
          hydrated: state.hydrated,
        })),
    }),
    {
      name: "untld-kanban-v1",
      version: 1,
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : noopStorage,
      ),
      skipHydration: true,
      partialize: (state) => ({
        title: state.title,
        favorite: state.favorite,
        teamName: state.teamName,
        members: state.members,
        columns: state.columns,
        tasks: state.tasks,
        activity: state.activity,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
