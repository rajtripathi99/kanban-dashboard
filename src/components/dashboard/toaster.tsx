"use client";

import { CheckmarkCircle02Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { AnimatePresence, motion } from "motion/react";

import { Icon } from "@/components/dashboard/icon";
import { useUiStore } from "@/stores/ui-store";

export function Toaster() {
  const toasts = useUiStore((state) => state.toasts);
  const dismissToast = useUiStore((state) => state.dismissToast);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-5 left-1/2 z-[100] flex w-[min(92vw,360px)] -translate-x-1/2 flex-col gap-2 max-md:bottom-20"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex h-10 items-center gap-2.5 rounded-[10px] border border-[#00000014] bg-[#0F172A] px-3 text-white shadow-[0_10px_30px_rgba(15,23,42,0.22)]"
          >
            <Icon
              icon={CheckmarkCircle02Icon}
              size={14}
              strokeWidth={2}
              className="text-[#4ADE80]"
            />
            <span className="min-w-0 flex-1 truncate text-[12px] font-medium">
              {toast.title}
            </span>
            <button
              type="button"
              aria-label="Dismiss notification"
              onClick={() => dismissToast(toast.id)}
              className="flex size-6 shrink-0 items-center justify-center rounded-[6px] text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Icon icon={Cancel01Icon} size={12} strokeWidth={2} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
