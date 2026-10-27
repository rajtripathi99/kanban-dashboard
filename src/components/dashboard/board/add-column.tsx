"use client";

import { useEffect, useRef, useState } from "react";
import {
  MoreHorizontalIcon,
  PlusIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon } from "@/components/dashboard/icon";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  COLUMN_COLOR_META,
  COLUMN_COLOR_OPTIONS,
  resolveProjectId,
  type ColumnColor,
} from "@/lib/kanban";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";

const SUGGESTIONS: { name: string; color: ColumnColor }[] = [
  { name: "QA review", color: "purple" },
  { name: "Blocked", color: "amber" },
  { name: "Backlog", color: "slate" },
];

export function AddColumn({
  onAdded,
  pinned = false,
}: {
  onAdded?: (id: string) => void;
  pinned?: boolean;
}) {
  const addColumn = useKanbanStore((state) => state.addColumn);
  const activeProject = useUiStore((state) => state.activeProject);
  const toast = useUiStore((state) => state.toast);
  const [expanded, setExpanded] = useState(false);
  const [name, setName] = useState("QA review");
  const [color, setColor] = useState<ColumnColor>("purple");
  const [colorsOpen, setColorsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!expanded) return;
    const timer = window.setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 30);
    return () => window.clearTimeout(timer);
  }, [expanded]);

  const open = (suggestion?: { name: string; color: ColumnColor }) => {
    if (suggestion) {
      setName(suggestion.name);
      setColor(suggestion.color);
    }
    setExpanded(true);
  };

  const cancel = () => {
    setExpanded(false);
    setColorsOpen(false);
  };

  const commit = () => {
    if (!name.trim()) return;
    const id = addColumn({
      name,
      color,
      projectId: resolveProjectId(activeProject),
    });
    if (!id) return;
    setExpanded(false);
    setColorsOpen(false);
    setName("QA review");
    setColor("purple");
    toast(`${name.trim()} column added`);
    window.setTimeout(() => onAdded?.(id), 40);
  };

  const meta = COLUMN_COLOR_META[color];
  const shell = (gap: string) =>
    pinned
      ? cn("flex h-full w-full min-w-0 flex-col p-4", gap)
      : cn(
          "flex h-full w-[85vw] max-w-[340px] shrink-0 snap-start flex-col p-4 sm:w-[320px] lg:w-auto lg:max-w-none lg:min-w-[280px] lg:flex-1",
          gap,
        );

  if (!expanded) {
    return (
      <section aria-label="Add column" className={shell("gap-3")}>
        <div className="flex h-8 shrink-0 items-center px-0.5 pb-1.5 pt-0.5">
          <button
            type="button"
            onClick={() => open()}
            className="inline-flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] font-medium leading-4 text-[#64748B] outline-none transition-colors hover:bg-[#F4F4F5] hover:text-[#0F172A] focus-visible:paper-focus"
          >
            <Icon icon={PlusIcon} size={12} strokeWidth={2.2} />
            Add column
          </button>
        </div>

        <button
          type="button"
          onClick={() => open()}
          className={cn(
            "flex min-h-[200px] flex-col items-center gap-2 rounded-[12px] border border-dashed border-[#E4E4E7] bg-[#FAFAFA] px-3.5 py-5 text-center transition-colors hover:border-[#CBD5E1] focus-visible:paper-focus outline-none",
            pinned && "flex-1 justify-center",
          )}
        >
          <span className="flex size-8 items-center justify-center rounded-full bg-[#F1F5F9]">
            <Icon
              icon={PlusIcon}
              size={16}
              strokeWidth={2}
              className="text-[#64748B]"
            />
          </span>
          <span className="text-[12px] font-medium leading-4 text-[#0F172A]">
            Add a new column
          </span>
          <span className="max-w-[200px] text-[11px] leading-[15px] text-[#8C8A85]">
            Create a stage like QA, Review or Blocked
          </span>
          <span className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
            {SUGGESTIONS.map((suggestion) => (
              <span
                key={suggestion.name}
                role="button"
                tabIndex={0}
                onClick={(event) => {
                  event.stopPropagation();
                  open(suggestion);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    event.stopPropagation();
                    open(suggestion);
                  }
                }}
                className="inline-flex h-6 items-center gap-[5px] rounded-[6px] border border-[#E2E8F0] bg-white px-2 text-[11px] font-medium leading-[14px] text-[#475569] transition-colors hover:border-[#CBD5E1]"
              >
                <span
                  className="size-[6px] rounded-full"
                  style={{ background: COLUMN_COLOR_META[suggestion.color].hex }}
                />
                {suggestion.name}
              </span>
            ))}
          </span>
        </button>
      </section>
    );
  }

  return (
    <section aria-label="New column" className={shell("gap-2.5")}>
      <div className="flex h-8 shrink-0 items-center">
        <div className="flex h-8 w-full items-center gap-2 rounded-[8px] border border-[#0000001F] bg-white px-2 transition-shadow focus-within:border-[#FF572266] focus-within:shadow-[0_0_0_3px_rgba(255,87,34,0.08)]">
          <Popover open={colorsOpen} onOpenChange={setColorsOpen}>
            <PopoverTrigger
              aria-label="Column color"
              className="flex size-4 shrink-0 items-center justify-center rounded-[4px] outline-none focus-visible:paper-focus"
              style={{ background: meta.hex }}
            >
              <span className="size-[6px] rounded-full bg-white" />
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={8}
              className="w-fit flex-row gap-2 rounded-[8px] border border-[#0000001A] p-[6px] px-2.5 shadow-[0_4px_12px_#0000000F]"
            >
              {COLUMN_COLOR_OPTIONS.map((option) => {
                const optionMeta = COLUMN_COLOR_META[option];
                return (
                  <button
                    key={option}
                    type="button"
                    aria-label={optionMeta.label}
                    aria-pressed={color === option}
                    onClick={() => {
                      setColor(option);
                      setColorsOpen(false);
                      inputRef.current?.focus();
                    }}
                    className={cn(
                      "size-3 shrink-0 rounded-full transition-transform hover:scale-110",
                      color === option && "outline outline-2 outline-offset-1",
                    )}
                    style={{
                      background: optionMeta.hex,
                      outlineColor:
                        color === option ? optionMeta.hex : undefined,
                    }}
                  />
                );
              })}
            </PopoverContent>
          </Popover>
          <input
            ref={inputRef}
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                cancel();
              }
            }}
            placeholder="Column name"
            aria-label="Column name"
            className="min-w-0 flex-1 bg-transparent text-[13px] leading-4 text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={commit}
          disabled={!name.trim()}
          className="flex h-7 items-center justify-center rounded-[8px] bg-[#0F172A] px-3 text-[12px] font-medium leading-4 text-white transition-colors hover:bg-[#1E293B] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add
        </button>
        <button
          type="button"
          onClick={cancel}
          className="flex h-7 items-center justify-center rounded-[8px] px-2 text-[12px] font-medium leading-4 text-[#64748B] transition-colors hover:bg-[#F4F4F5] hover:text-[#0F172A]"
        >
          Cancel
        </button>
      </div>

      <div className="flex flex-col gap-1.5 pt-2">
        <div className="text-[10px] font-semibold uppercase leading-3 tracking-[0.05em] text-[#8C8A85]">
          Preview
        </div>
        <div className="flex flex-col gap-2 rounded-[12px] border border-dashed border-[#CBD5E1BF] bg-white/70 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span
                className="flex size-[14px] items-center justify-center rounded-[3px] border"
                style={{ background: meta.tint, borderColor: meta.border }}
              >
                <span
                  className="size-[5px] rounded-full"
                  style={{ background: meta.hex }}
                />
              </span>
              <span className="text-[12px] font-medium leading-[14px] text-[#0F172A]">
                {name.trim() || "Untitled"}
              </span>
              <span className="text-[12px] leading-[14px] text-[#8C8A85]">
                0
              </span>
            </div>
            <span className="flex items-center gap-[3px] text-[#94A3B8]">
              <Icon icon={PlusIcon} size={10} strokeWidth={2.2} />
              <Icon icon={MoreHorizontalIcon} size={10} strokeWidth={2.2} />
            </span>
          </div>
          <div className="flex items-center justify-center rounded-[8px] border border-dashed border-[#E4E4E799] bg-[#FAFAF980] p-2.5 text-[10px] italic leading-3 text-[#94A3B8]">
            Issues will land here
          </div>
        </div>
        <div className="pt-1 text-center text-[11px] leading-[15px] text-[#8C8A85]">
          Enter to confirm · Esc to cancel
        </div>
      </div>

      <div className="flex-1" />
    </section>
  );
}
