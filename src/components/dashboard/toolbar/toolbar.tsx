"use client";

import {
  Cancel01Icon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  FilterIcon,
  Search01Icon,
  SlidersHorizontalIcon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon, MemberAvatar } from "@/components/dashboard/icon";
import { IconButton } from "@/components/dashboard/ui";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { PRIORITIES, PRIORITY_META, COLUMN_COLOR_META, type Priority } from "@/lib/kanban";
import { useKanbanStore } from "@/stores/kanban-store";
import {
  DISPLAY_OPTIONS,
  isFilterActive,
  useUiStore,
} from "@/stores/ui-store";

function FilterChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-[26px] items-center gap-1.5 rounded-[7px] border px-2 text-[11px] font-medium transition-colors",
        active
          ? "border-[#FF5722] bg-[#FFF7ED] text-[#C2410C]"
          : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#FAFAFA] hover:text-[#0F172A]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Toolbar() {
  const mine = useUiStore((state) => state.mine);
  const setMine = useUiStore((state) => state.setMine);
  const search = useUiStore((state) => state.search);
  const setSearch = useUiStore((state) => state.setSearch);
  const filter = useUiStore((state) => state.filter);
  const setFilter = useUiStore((state) => state.setFilter);
  const clearFilter = useUiStore((state) => state.clearFilter);
  const filterOpen = useUiStore((state) => state.filterOpen);
  const setFilterOpen = useUiStore((state) => state.setFilterOpen);
  const displayOpen = useUiStore((state) => state.displayOpen);
  const setDisplayOpen = useUiStore((state) => state.setDisplayOpen);
  const display = useUiStore((state) => state.display);
  const setDisplay = useUiStore((state) => state.setDisplay);
  const members = useKanbanStore((state) => state.members);
  const columns = useKanbanStore((state) => state.columns);
  const setColumnHidden = useKanbanStore((state) => state.setColumnHidden);
  const showAllColumns = useKanbanStore((state) => state.showAllColumns);
  const toast = useUiStore((state) => state.toast);

  const activeFilter = isFilterActive(filter);
  const urgent = filter.priority === "urgent";
  const filterCount = [
    filter.priority,
    filter.assigneeId,
    filter.overdue,
  ].filter(Boolean).length;

  return (
    <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#0000000F] bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center">
        <div className="flex h-8 shrink-0 items-center gap-1.5">
          <span className="size-[6px] shrink-0 rounded-full bg-[#FF5722]" />
          <span className="text-[12px] font-semibold leading-4 text-[#0F172A]">
            Kanban Board
          </span>
        </div>

        <div className="mx-3 hidden h-8 shrink-0 items-center sm:flex">
          <div className="h-5 w-px bg-[#E4E4E7]" />
        </div>

        <div className="hidden shrink-0 items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => setMine(!mine)}
            aria-pressed={mine}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-[8px] px-2 text-[12px] font-medium leading-4 transition-colors",
              mine
                ? "bg-[#F4F4F5] text-[#0F172A]"
                : "text-[#64748B] hover:bg-[#F4F4F5] hover:text-[#0F172A]",
            )}
          >
            <Icon icon={User02Icon} size={14} strokeWidth={1.7} />
            <span className="hidden md:inline">My issues</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setFilter({ priority: urgent ? null : ("urgent" as Priority) })
            }
            aria-pressed={urgent}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-[8px] px-2 text-[12px] font-medium leading-4 transition-colors",
              urgent
                ? "bg-[#FFF7ED] text-[#C2410C]"
                : "text-[#64748B] hover:bg-[#F4F4F5] hover:text-[#0F172A]",
            )}
          >
            <span className="size-[6px] rounded-full bg-[#EF4444]" />
            <span className="hidden lg:inline">Urgent</span>
          </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div className="flex h-8 w-[120px] items-center gap-2 rounded-[8px] border border-[#00000014] bg-white px-2.5 transition-colors focus-within:border-[#FF572266] focus-within:shadow-[0_0_0_3px_rgba(255,87,34,0.10)] sm:w-[140px]">
          <Icon
            icon={Search01Icon}
            size={13}
            strokeWidth={1.8}
            className="text-[#8C8A85]"
          />
          <input
            id="board-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            aria-label="Search issues"
            className="min-w-0 flex-1 bg-transparent text-[12px] leading-4 text-[#0F172A] outline-none placeholder:text-[#8C8A85]"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="text-[#8C8A85] hover:text-[#0F172A]"
            >
              <Icon icon={Cancel01Icon} size={12} />
            </button>
          )}
        </div>

        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger
            aria-label="Filter issues"
            className={cn(
              "relative inline-flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-[#00000014] bg-white text-[#64748B] outline-none transition-colors hover:bg-[#FAFAFA] focus-visible:paper-focus",
              activeFilter && "border-[#FF572266] bg-[#FFF7ED] text-[#FF5722]",
            )}
          >
            <Icon icon={FilterIcon} size={13} strokeWidth={1.9} />
            {filterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-[#FF5722] text-[9px] font-semibold text-white">
                {filterCount}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[300px] gap-0 rounded-[12px] border border-[#00000014] p-0 shadow-[0_12px_36px_rgba(15,23,42,0.14)]"
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] px-4 py-3">
              <span className="text-[12px] font-semibold text-[#0F172A]">
                Filter issues
              </span>
              <span className="text-[10px] text-[#8C8A85]">Sprint 24</span>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8C8A85]">
                  Priority
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <FilterChip
                    active={!filter.priority}
                    onClick={() => setFilter({ priority: null })}
                  >
                    Any
                  </FilterChip>
                  {PRIORITIES.map((priority) => (
                    <FilterChip
                      key={priority}
                      active={filter.priority === priority}
                      onClick={() =>
                        setFilter({
                          priority:
                            filter.priority === priority ? null : priority,
                        })
                      }
                    >
                      <span
                        className="size-[6px] rounded-full"
                        style={{ background: PRIORITY_META[priority].icon }}
                      />
                      {PRIORITY_META[priority].label}
                    </FilterChip>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8C8A85]">
                  Assignee
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {members.map((member) => (
                    <FilterChip
                      key={member.id}
                      active={filter.assigneeId === member.id}
                      onClick={() =>
                        setFilter({
                          assigneeId:
                            filter.assigneeId === member.id ? null : member.id,
                        })
                      }
                    >
                      <MemberAvatar initials={member.initials} size={16} />
                      {member.name}
                    </FilterChip>
                  ))}
                </div>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#475569]">
                <span
                  className={cn(
                    "flex size-[15px] items-center justify-center rounded-[4px] border transition-colors",
                    filter.overdue
                      ? "border-[#FF5722] bg-[#FF5722] text-white"
                      : "border-[#CBD5E1] bg-white",
                  )}
                >
                  {filter.overdue && (
                    <Icon icon={CheckIcon} size={10} strokeWidth={2.5} />
                  )}
                </span>
                <input
                  type="checkbox"
                  checked={filter.overdue}
                  onChange={(event) =>
                    setFilter({ overdue: event.target.checked })
                  }
                  className="sr-only"
                />
                Only overdue issues
              </label>
            </div>
            <div className="flex items-center justify-between border-t border-[#F1F5F9] px-4 py-2.5">
              <button
                type="button"
                onClick={clearFilter}
                className="text-[11px] font-medium text-[#64748B] hover:text-[#0F172A]"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(false)}
                className="flex h-7 items-center rounded-[7px] bg-[#FF5722] px-3 text-[11px] font-medium text-white shadow-[0_1px_2px_rgba(255,87,34,0.20)] transition-colors hover:bg-[#E64A19] active:bg-[#D84315]"
              >
                Apply filters
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={displayOpen} onOpenChange={setDisplayOpen}>
          <PopoverTrigger
            aria-label="Display options"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-[#00000014] bg-white text-[#64748B] outline-none transition-colors hover:bg-[#FAFAFA] focus-visible:paper-focus"
          >
            <Icon icon={SlidersHorizontalIcon} size={13} strokeWidth={1.9} />
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[292px] gap-0 rounded-[12px] border border-[#00000014] p-0 shadow-[0_12px_36px_rgba(15,23,42,0.14)]"
          >
            <div className="border-b border-[#F1F5F9] px-4 py-3 text-[12px] font-semibold text-[#0F172A]">
              Display options
            </div>
            <div className="p-4">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8C8A85]">
                Show fields
              </div>
              <div className="flex flex-col gap-2.5">
                {DISPLAY_OPTIONS.map((option) => (
                  <div
                    key={option.key}
                    className="flex items-center justify-between text-[12px] text-[#475569]"
                  >
                    {option.label}
                    <Switch
                      size="sm"
                      aria-label={option.label}
                      checked={display[option.key]}
                      onCheckedChange={(value) =>
                        setDisplay({ [option.key]: value })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-[#F1F5F9] p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-[#8C8A85]">
                  Columns
                </span>
                <button
                  type="button"
                  onClick={showAllColumns}
                  className="text-[10px] font-medium text-[#FF5722] hover:text-[#E64A19]"
                >
                  Show all
                </button>
              </div>
              <div className="flex flex-col gap-0.5">
                {columns.map((column) => (
                  <div
                    key={column.id}
                    className="flex h-7 items-center gap-2 rounded-[6px] px-1.5 text-[12px] text-[#475569] hover:bg-[#FAFAFA]"
                  >
                    <span
                      className="size-[6px] rounded-full"
                      style={{
                        background: COLUMN_COLOR_META[column.color].hex,
                      }}
                    />
                    <span className="truncate">{column.name}</span>
                    <IconButton
                      label={column.hidden ? `Show ${column.name}` : `Hide ${column.name}`}
                      size={22}
                      className="ml-auto"
                      onClick={() => {
                        setColumnHidden(column.id, !column.hidden);
                        toast(
                          column.hidden
                            ? `${column.name} column shown`
                            : `${column.name} column hidden`,
                        );
                      }}
                    >
                      <Icon
                        icon={column.hidden ? EyeOffIcon : EyeIcon}
                        size={13}
                        className={column.hidden ? "text-[#CBD5E1]" : undefined}
                      />
                    </IconButton>
                  </div>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
