"use client";

import { useEffect, type CSSProperties } from "react";

import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Board } from "@/components/dashboard/board/board";
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton";
import { Dialogs } from "@/components/dashboard/dialogs/dialogs";
import { Header } from "@/components/dashboard/header/header";
import { Toaster } from "@/components/dashboard/toaster";
import { Toolbar } from "@/components/dashboard/toolbar/toolbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";

const SIDEBAR_STYLE = {
  "--sidebar-width": "248px",
  "--sidebar-width-icon": "64px",
} as CSSProperties;

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest(
      "input, textarea, select, [contenteditable='true'], [role='textbox']",
    ),
  );
}

function useShortcuts() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      if (event.metaKey || event.ctrlKey) {
        if (event.key.toLowerCase() === "k") {
          event.preventDefault();
          document.getElementById("board-search")?.focus();
        }
        return;
      }
      if (event.altKey) return;

      const state = useUiStore.getState();
      if (event.key === "?" && !isTypingTarget(event.target)) {
        event.preventDefault();
        state.openDialog({ type: "help" });
        return;
      }
      if (state.dialog) return;
      if (isTypingTarget(event.target)) return;

      if (event.key === "/") {
        event.preventDefault();
        document.getElementById("board-search")?.focus();
        return;
      }
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        const column = useKanbanStore
          .getState()
          .columns.find((item) => !item.hidden);
        state.openDialog({ type: "new-task", columnId: column?.id });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}

export function Dashboard() {
  const hydrated = useKanbanStore((state) => state.hydrated);

  useEffect(() => {
    void useKanbanStore.persist.rehydrate();
  }, []);

  useShortcuts();

  if (!hydrated) return <DashboardSkeleton />;

  return (
    <SidebarProvider
      style={SIDEBAR_STYLE}
      className="h-svh min-h-0 overflow-hidden"
    >
      <TooltipProvider delay={180}>
        <AppSidebar />
        <div className="flex h-svh min-w-0 flex-1 flex-col overflow-hidden">
          <Header />
          <Toolbar />
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Board />
          </main>
        </div>
        <Dialogs />
        <Toaster />
      </TooltipProvider>
    </SidebarProvider>
  );
}
