"use client";

import { useDroppable } from "@dnd-kit/core";
import { motion } from "motion/react";

import { TaskCardView, type TaskCardViewProps } from "./task-card-view";

type DropSlotProps = Pick<
  TaskCardViewProps,
  "task" | "column" | "members" | "display"
>;

export function DropSlot(props: DropSlotProps) {
  const { setNodeRef } = useDroppable({
    id: "drop-slot",
    data: { type: "slot" },
  });

  return (
    <motion.div
      ref={setNodeRef}
      aria-hidden
      layout="position"
      transition={{ layout: { type: "spring", duration: 0.3, bounce: 0 } }}
      className="rounded-[12px] border border-dashed border-[#CBD5E1] bg-[#FAFAFA]/70"
    >
      <TaskCardView {...props} invisible />
    </motion.div>
  );
}
