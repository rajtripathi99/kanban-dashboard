"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { cn } from "cn";

import { AddColumn } from "./add-column";
import { BoardColumn } from "./board-column";
import { taskMatches } from "./board-filters";
import {
  markDragEnd,
  type DropData,
  type Placement,
} from "./board-drag";
import { TaskCardView } from "./task-card-view";
import { useKanbanStore } from "@/stores/kanban-store";
import {
  filteringActive,
  useUiStore,
} from "@/stores/ui-store";
import { useMounted, useMobileBreakpoints } from "@/hooks/use-mobile-breakpoints";
import { resolveProjectId, type Task } from "@/lib/kanban";

type Point = { x: number; y: number };
type EdgeDirection = -1 | 0 | 1;

const EDGE_DWELL = 220;
const EDGE_ZONE_MAX = 64;
const EDGE_ZONE_RATIO = 0.16;
const LOCK_RADIUS = 28;
const REALIGN_DURATION = 400;

const collisionDetection: CollisionDetection = (args) => {
  const within = pointerWithin(args);
  if (within.length > 0) {
    const preferred = within.find((collision) => {
      const type = (
        collision.data?.droppableContainer?.data?.current as
          | DropData
          | undefined
      )?.type;
      return type !== "column";
    });
    return [preferred ?? within[0]];
  }
  return rectIntersection(args);
};

function eventPoint(event: Event | null): Point | null {
  if (!event) return null;
  if ("touches" in event) {
    const touch = event as TouchEvent;
    const point = touch.touches[0] ?? touch.changedTouches[0];
    return point ? { x: point.clientX, y: point.clientY } : null;
  }
  if ("clientX" in event) {
    const mouse = event as MouseEvent;
    return { x: mouse.clientX, y: mouse.clientY };
  }
  return null;
}

export function Board() {
  const columns = useKanbanStore((state) => state.columns);
  const tasks = useKanbanStore((state) => state.tasks);
  const members = useKanbanStore((state) => state.members);
  const moveTask = useKanbanStore((state) => state.moveTask);
  const search = useUiStore((state) => state.search);
  const filter = useUiStore((state) => state.filter);
  const mine = useUiStore((state) => state.mine);
  const activeProject = useUiStore((state) => state.activeProject);
  const setActiveProject = useUiStore((state) => state.setActiveProject);
  const clearFilter = useUiStore((state) => state.clearFilter);
  const setSearch = useUiStore((state) => state.setSearch);
  const setMine = useUiStore((state) => state.setMine);
  const display = useUiStore((state) => state.display);
  const toast = useUiStore((state) => state.toast);
  const revealTaskId = useUiStore((state) => state.revealTaskId);
  const { belowLg } = useMobileBreakpoints();
  const mounted = useMounted();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [settledId, setSettledId] = useState<string | null>(null);
  const [dragCount, setDragCount] = useState(0);
  const [edgeDir, setEdgeDir] = useState<EdgeDirection>(0);
  const [snapping, setSnapping] = useState(true);
  const placementRef = useRef<Placement | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef<Point | null>(null);
  const edgeRef = useRef<{ dir: EdgeDirection; timer: number | null }>({
    dir: 0,
    timer: null,
  });
  const lockRef = useRef<{ columnId: string; at: Point } | null>(null);
  const snapTimerRef = useRef<number | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 8 },
    }),
  );

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      pointerRef.current = { x: event.clientX, y: event.clientY };
    };
    const onTouchMove = (event: TouchEvent) => {
      const point = eventPoint(event);
      if (point) pointerRef.current = point;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  useEffect(() => {
    if (!activeId) return;
    document.body.classList.add("cursor-grabbing", "select-none");
    return () => {
      document.body.classList.remove("cursor-grabbing", "select-none");
    };
  }, [activeId]);

  useEffect(() => {
    if (!revealTaskId) return;
    const timer = window.setTimeout(() => {
      const card = scrollerRef.current?.querySelector<HTMLElement>(
        `[data-task-card="${revealTaskId}"]`,
      );
      card?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [revealTaskId]);

  useEffect(
    () => () => {
      if (edgeRef.current.timer) window.clearTimeout(edgeRef.current.timer);
      if (snapTimerRef.current) window.clearTimeout(snapTimerRef.current);
    },
    [],
  );

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

  const tasksByColumn = useMemo(() => {
    const map: Record<string, Task[]> = {};
    columns.forEach((column) => {
      map[column.id] = visibleTasks.filter(
        (task) => task.columnId === column.id,
      );
    });
    return map;
  }, [columns, visibleTasks]);

  const visibleColumns = columns.filter((column) => !column.hidden);
  const activeTask = activeId
    ? (tasks.find((task) => task.id === activeId) ?? null)
    : null;
  const activeColumn = activeTask
    ? (columns.find((column) => column.id === activeTask.columnId) ?? null)
    : null;
  const filtering =
    filteringActive({ search, filter, mine }) || activeProject !== null;
  const nothingVisible =
    visibleTasks.length === 0 && tasks.length > 0 && filtering;

  const updatePlacement = useCallback((next: Placement | null) => {
    placementRef.current = next;
    setPlacement(next);
  }, []);

  const columnOffsets = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return [];
    const base = scroller.getBoundingClientRect().left - scroller.scrollLeft;
    return Array.from(
      scroller.querySelectorAll<HTMLElement>("[data-column-id]"),
    ).map((element) => ({
      id: element.dataset.columnId as string,
      left: element.getBoundingClientRect().left - base,
    }));
  };

  const nearestColumn = (
    offsets: { id: string; left: number }[],
    left: number,
  ) =>
    offsets.reduce(
      (best, item, index) =>
        Math.abs(item.left - left) < Math.abs(offsets[best].left - left)
          ? index
          : best,
      0,
    );

  const pageBoard = (dir: EdgeDirection) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const offsets = columnOffsets();
    if (offsets.length === 0) return;
    const current = nearestColumn(offsets, scroller.scrollLeft);
    const target =
      offsets[Math.min(offsets.length - 1, Math.max(0, current + dir))];
    if (!target || Math.abs(target.left - scroller.scrollLeft) < 1) return;
    scroller.scrollTo({ left: target.left, behavior: "smooth" });
    const pointer = pointerRef.current;
    lockRef.current = pointer ? { columnId: target.id, at: pointer } : null;
  };

  const clearEdge = () => {
    if (edgeRef.current.timer) window.clearTimeout(edgeRef.current.timer);
    edgeRef.current = { dir: 0, timer: null };
    setEdgeDir((dir) => (dir === 0 ? dir : 0));
  };

  const armEdge = (dir: EdgeDirection) => {
    if (edgeRef.current.dir === dir) return;
    if (edgeRef.current.timer) window.clearTimeout(edgeRef.current.timer);
    edgeRef.current = {
      dir,
      timer: window.setTimeout(() => {
        edgeRef.current.timer = null;
        pageBoard(dir);
      }, EDGE_DWELL),
    };
    setEdgeDir(dir);
  };

  const updateEdge = (pointer: Point, hit: Element | null) => {
    const scroller = scrollerRef.current;
    if (
      !scroller ||
      !hit ||
      !scroller.contains(hit) ||
      scroller.scrollWidth <= scroller.clientWidth + 1
    ) {
      clearEdge();
      return;
    }
    const rect = scroller.getBoundingClientRect();
    const zone = Math.min(EDGE_ZONE_MAX, rect.width * EDGE_ZONE_RATIO);
    const canRight =
      scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1;
    const canLeft = scroller.scrollLeft > 1;
    if (canRight && pointer.x >= rect.right - zone) armEdge(1);
    else if (canLeft && pointer.x <= rect.left + zone) armEdge(-1);
    else clearEdge();
  };

  const realignColumns = () => {
    const scroller = scrollerRef.current;
    if (snapTimerRef.current) window.clearTimeout(snapTimerRef.current);
    if (!scroller || !belowLg) {
      setSnapping(true);
      return;
    }
    const offsets = columnOffsets();
    if (offsets.length === 0) {
      setSnapping(true);
      return;
    }
    const target = offsets[nearestColumn(offsets, scroller.scrollLeft)];
    if (Math.abs(target.left - scroller.scrollLeft) < 1) {
      setSnapping(true);
      return;
    }
    scroller.scrollTo({ left: target.left, behavior: "smooth" });
    snapTimerRef.current = window.setTimeout(() => {
      snapTimerRef.current = null;
      setSnapping(true);
    }, REALIGN_DURATION);
  };

  const onDragStart = ({ active, activatorEvent }: DragStartEvent) => {
    if (snapTimerRef.current) window.clearTimeout(snapTimerRef.current);
    pointerRef.current = eventPoint(activatorEvent);
    lockRef.current = null;
    setSnapping(false);
    setActiveId(String(active.id));
    setDragCount((count) => count + 1);
    updatePlacement(null);
  };

  const pointerFrom = (event: DragMoveEvent) => {
    const origin = eventPoint(event.activatorEvent) ?? { x: 0, y: 0 };
    return { x: origin.x + event.delta.x, y: origin.y + event.delta.y };
  };

  const samePlacement = (a: Placement | null, b: Placement | null) =>
    a === b ||
    (a !== null &&
      b !== null &&
      a.columnId === b.columnId &&
      a.index === b.index);

  const computePlacement = (pointer: Point, id: string): Placement | null => {
    const hit = document.elementFromPoint(pointer.x, pointer.y);
    updateEdge(pointer, hit);
    const lock = lockRef.current;
    if (
      lock &&
      Math.hypot(pointer.x - lock.at.x, pointer.y - lock.at.y) > LOCK_RADIUS
    ) {
      lockRef.current = null;
    }
    const columnId =
      lockRef.current?.columnId ??
      hit?.closest<HTMLElement>("[data-column-id]")?.dataset.columnId;
    if (!columnId) return null;
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>(
        `[data-column-id="${columnId}"] [data-task-card]`,
      ),
    ).filter((card) => card.dataset.taskCard !== id);
    let index = 0;
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      if (pointer.y > rect.top + rect.height / 2) index += 1;
      else break;
    }
    return {
      columnId,
      index,
      beforeId: cards[index]?.dataset.taskCard ?? null,
    };
  };

  const onDragMove = (event: DragMoveEvent) => {
    const pointer = pointerRef.current ?? pointerFrom(event);
    const next = computePlacement(pointer, String(event.active.id));
    if (!samePlacement(placementRef.current, next)) updatePlacement(next);
  };

  const finish = () => {
    markDragEnd();
    clearEdge();
    lockRef.current = null;
    setActiveId(null);
    updatePlacement(null);
    realignColumns();
  };

  const onDragEnd = ({ active }: DragEndEvent) => {
    const id = String(active.id);
    const pointer = pointerRef.current;
    const target = pointer
      ? computePlacement(pointer, id)
      : placementRef.current;
    const task = tasks.find((item) => item.id === id);
    if (task && target) {
      setSettledId(id);
      window.setTimeout(() => setSettledId(null), 150);
      moveTask(id, target.columnId, target.beforeId);
      const column = columns.find((item) => item.id === target.columnId);
      if (column && column.id !== task.columnId) {
        toast(`Moved to ${column.name}`);
      }
    }
    finish();
  };

  const onAdded = (id: string) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const element = scroller.querySelector<HTMLElement>(
      `[data-column-id="${id}"]`,
    );
    if (!element) return;
    const base = scroller.getBoundingClientRect().left - scroller.scrollLeft;
    const left = element.getBoundingClientRect().left - base;
    scroller.scrollTo({ left, behavior: "smooth" });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      autoScroll={{ threshold: { x: 0, y: 0.2 } }}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragCancel={finish}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "Press Enter to open the issue. Drag it with a pointer to move it to another column. Hold it at the edge of the board to slide to the next column.",
        },
      }}
    >
      <div className="relative flex min-h-0 flex-1">
        <div
          ref={scrollerRef}
          className={cn(
            "no-scrollbar flex min-h-0 flex-1 snap-x snap-mandatory overflow-x-auto overflow-y-hidden bg-[#FAFAF9] lg:snap-none",
            (!snapping || activeId) && "snap-none",
          )}
        >
          {visibleColumns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              tasks={tasksByColumn[column.id] ?? []}
              members={members}
              display={display}
              activeId={activeId}
              activeTask={activeTask}
              placement={placement}
              settledId={settledId}
              filtering={filtering}
              projectId={resolveProjectId(activeProject, column.projectId)}
              revealedId={revealTaskId}
            />
          ))}
          {belowLg && <AddColumn onAdded={onAdded} />}
          {visibleColumns.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
              <h2 className="text-[16px] font-semibold text-[#0F172A]">
                Every column is hidden
              </h2>
              <p className="max-w-[22em] text-[13px] leading-5 text-[#64748B]">
                Bring a column back from the display options to see your
                issues.
              </p>
            </div>
          )}
        </div>

        {!belowLg && (
          <aside
            aria-label="Add column rail"
            className="no-scrollbar hidden w-[300px] shrink-0 overflow-y-auto overscroll-y-contain border-l border-[#0000000F] bg-[#FAFAF9] lg:block"
          >
            <AddColumn pinned onAdded={onAdded} />
          </aside>
        )}

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-[#FF57221A] to-transparent transition-opacity duration-150 lg:hidden",
            edgeDir === -1 ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-[#FF57221A] to-transparent transition-opacity duration-150 lg:hidden",
            edgeDir === 1 ? "opacity-100" : "opacity-0",
          )}
        />

        {nothingVisible && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 flex-col items-center gap-3 px-8 text-center">
            <div className="pointer-events-auto flex flex-col items-center gap-3 rounded-[16px] border border-[#00000014] bg-white p-6 shadow-[0_12px_36px_rgba(15,23,42,0.10)]">
              <h2 className="text-[15px] font-semibold text-[#0F172A]">
                No issues match
              </h2>
              <p className="max-w-[22em] text-[12px] leading-[18px] text-[#64748B]">
                Try a different search or clear the active filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  clearFilter();
                  setSearch("");
                  setMine(false);
                  setActiveProject(null);
                }}
                className="inline-flex h-8 items-center rounded-[8px] bg-[#0F172A] px-3 text-[12px] font-medium text-white transition-colors hover:bg-[#1E293B]"
              >
                Clear search and filters
              </button>
            </div>
          </div>
        )}
      </div>

      {mounted &&
        createPortal(
          <DragOverlay
            dropAnimation={null}
            zIndex={80}
            className="pointer-events-none"
          >
            {activeTask && activeColumn && (
              <TaskCardView
                key={`${activeTask.id}-${dragCount}`}
                task={activeTask}
                column={activeColumn}
                members={members}
                display={display}
                lifted
                className="pointer-events-none"
              />
            )}
          </DragOverlay>,
          document.body,
        )}
    </DndContext>
  );
}
