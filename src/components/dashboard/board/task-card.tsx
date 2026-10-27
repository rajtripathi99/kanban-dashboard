"use client";

import { useCallback, type KeyboardEvent } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { motion } from "motion/react";
import { cn } from "cn";

import { TaskCardView, type TaskCardViewProps } from "./task-card-view";
import { wasJustDragged } from "./board-drag";
import { useUiStore } from "@/stores/ui-store";

type TaskCardProps = Omit<
  TaskCardViewProps,
  "interactive" | "lifted" | "className"
> & {
  hidden?: boolean;
  animateLayout?: boolean;
};

export function TaskCard({
  hidden = false,
  animateLayout = true,
  ...view
}: TaskCardProps) {
  const { task } = view;
  const openDialog = useUiStore((state) => state.openDialog);
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: task.id,
    data: { type: "task", taskId: task.id, columnId: task.columnId },
  });
  const { setNodeRef: setDropRef } = useDroppable({
    id: `task:${task.id}`,
    disabled: hidden,
    data: { type: "task", taskId: task.id, columnId: task.columnId },
  });

  const setRef = useCallback(
    (node: HTMLElement | null) => {
      setNodeRef(node);
      setDropRef(node);
    },
    [setNodeRef, setDropRef],
  );

  const open = () => {
    if (wasJustDragged()) return;
    openDialog({ type: "task", taskId: task.id });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      open();
    }
  };

  return (
    <motion.div
      layout="position"
      transition={{
        layout: animateLayout
          ? { type: "spring", duration: 0.3, bounce: 0 }
          : { duration: 0 },
      }}
    >
      <div
        ref={setRef}
        {...listeners}
        {...attributes}
        data-task-card={hidden ? undefined : task.id}
        data-revealed={view.revealed ? "true" : undefined}
        aria-label={`Open ${task.title}`}
        onClick={open}
        onKeyDown={onKeyDown}
        className={cn(
          "cursor-grab touch-manipulation rounded-[12px] outline-none focus-visible:paper-focus",
          isDragging && "cursor-grabbing",
        )}
      >
        <TaskCardView
          {...view}
          interactive
          invisible={hidden}
          className="transition-[box-shadow,border-color] duration-150"
        />
      </div>
    </motion.div>
  );
}
