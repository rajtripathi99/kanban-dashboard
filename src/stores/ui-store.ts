"use client";

import { create } from "zustand";
import type { Priority } from "@/lib/kanban";

export type Tab = "board" | "list" | "timeline";

export type NavId = "overview" | "kanban" | "backlog" | "roadmap";

export type DialogState =
  | { type: "task"; taskId: string }
  | { type: "new-task"; columnId?: string }
  | { type: "import" }
  | { type: "invite" }
  | { type: "help" }
  | { type: "settings" }
  | { type: "rename-board" }
  | null;

export type Filter = {
  priority: Priority | null;
  assigneeId: string | null;
  overdue: boolean;
};

export type Display = {
  created: boolean;
  priority: boolean;
  assignees: boolean;
  due: boolean;
};

export const DISPLAY_OPTIONS: { key: keyof Display; label: string }[] = [
  { key: "created", label: "Created date" },
  { key: "priority", label: "Priority" },
  { key: "assignees", label: "Assignees" },
  { key: "due", label: "Due date" },
];

export type Toast = { id: number; title: string };

type UiState = {
  tab: Tab;
  nav: NavId;
  activeProject: string | null;
  search: string;
  mine: boolean;
  filter: Filter;
  display: Display;
  dialog: DialogState;
  dialogSession: number;
  toasts: Toast[];
  notificationsSeenAt: string | null;
  filterOpen: boolean;
  displayOpen: boolean;
  revealTaskId: string | null;
  setTab: (tab: Tab) => void;
  setNav: (nav: NavId) => void;
  setActiveProject: (project: string | null) => void;
  setSearch: (search: string) => void;
  setMine: (mine: boolean) => void;
  setFilter: (patch: Partial<Filter>) => void;
  clearFilter: () => void;
  setDisplay: (patch: Partial<Display>) => void;
  setFilterOpen: (open: boolean) => void;
  setDisplayOpen: (open: boolean) => void;
  openDialog: (dialog: NonNullable<DialogState>) => void;
  closeDialog: () => void;
  toast: (title: string) => void;
  dismissToast: (id: number) => void;
  markNotificationsSeen: () => void;
  revealTask: (id: string) => void;
  clearReveal: () => void;
};

const EMPTY_FILTER: Filter = {
  priority: null,
  assigneeId: null,
  overdue: false,
};

let toastCounter = 0;
let revealTimer: number | null = null;

export const useUiStore = create<UiState>()((set, get) => ({
  tab: "board",
  nav: "kanban",
  activeProject: null,
  search: "",
  mine: false,
  filter: EMPTY_FILTER,
  display: { created: true, priority: true, assignees: true, due: true },
  dialog: null,
  dialogSession: 0,
  toasts: [],
  notificationsSeenAt: null,
  filterOpen: false,
  displayOpen: false,
  revealTaskId: null,
  setTab: (tab) => set({ tab, nav: "kanban", activeProject: null }),
  setNav: (nav) =>
    set({
      nav,
      activeProject: null,
      tab:
        nav === "roadmap" ? "timeline" : nav === "backlog" ? "list" : "board",
    }),
  setActiveProject: (activeProject) =>
    set({ activeProject, nav: "kanban", tab: "board" }),
  setSearch: (search) => set({ search }),
  setMine: (mine) => set({ mine }),
  setFilter: (patch) =>
    set((state) => ({ filter: { ...state.filter, ...patch } })),
  clearFilter: () => set({ filter: EMPTY_FILTER }),
  setDisplay: (patch) =>
    set((state) => ({ display: { ...state.display, ...patch } })),
  setFilterOpen: (filterOpen) => set({ filterOpen }),
  setDisplayOpen: (displayOpen) => set({ displayOpen }),
  openDialog: (dialog) =>
    set((state) => ({ dialog, dialogSession: state.dialogSession + 1 })),
  closeDialog: () => set({ dialog: null }),
  toast: (title) => {
    const id = ++toastCounter;
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { id, title }],
    }));
    if (typeof window !== "undefined") {
      window.setTimeout(() => get().dismissToast(id), 2800);
    }
  },
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),
  markNotificationsSeen: () =>
    set({ notificationsSeenAt: new Date().toISOString() }),
  revealTask: (id) => {
    if (typeof window === "undefined") {
      set({ revealTaskId: id });
      return;
    }
    if (revealTimer) window.clearTimeout(revealTimer);
    set({ revealTaskId: id });
    revealTimer = window.setTimeout(() => {
      revealTimer = null;
      set({ revealTaskId: null });
    }, 2200);
  },
  clearReveal: () => {
    if (revealTimer) window.clearTimeout(revealTimer);
    revealTimer = null;
    set({ revealTaskId: null });
  },
}));

export function isFilterActive(filter: Filter) {
  return Boolean(filter.priority || filter.assigneeId || filter.overdue);
}

export function filteringActive({
  search,
  filter,
  mine,
}: {
  search: string;
  filter: Filter;
  mine: boolean;
}) {
  return isFilterActive(filter) || search.trim().length > 0 || mine;
}
