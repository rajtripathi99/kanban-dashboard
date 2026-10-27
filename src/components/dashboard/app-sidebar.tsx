"use client";

import type { ReactElement } from "react";
import {
  ChartColumnIcon,
  CheckIcon,
  ChevronDownIcon,
  DashboardSquare01Icon,
  GearsIcon,
  Layers01Icon,
  LeftToRightListBulletIcon,
  SidebarLeftIcon,
  User02Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon, MemberAvatar } from "@/components/dashboard/icon";
import { IconButton, SectionLabel } from "@/components/dashboard/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CURRENT_USER, PROJECTS } from "@/lib/kanban";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";

const NAV: {
  id: string;
  label: string;
  icon: typeof LeftToRightListBulletIcon;
  dummy: boolean;
}[] = [
  {
    id: "kanban",
    label: "Kanban Board",
    icon: LeftToRightListBulletIcon,
    dummy: false,
  },
  {
    id: "overview",
    label: "Overview",
    icon: DashboardSquare01Icon,
    dummy: true,
  },
  {
    id: "my-issues",
    label: "My issues",
    icon: User02Icon,
    dummy: true,
  },
  {
    id: "reports",
    label: "Reports",
    icon: ChartColumnIcon,
    dummy: true,
  },
];

const SPRINTS = [
  { id: "sprint-24", label: "Sprint 24", current: true },
  { id: "sprint-23", label: "Sprint 23", current: false },
  { id: "sprint-22", label: "Sprint 22", current: false },
];

/* One shared row geometry: 32px tall expanded, a 32px centered square in the rail. */
const ROW =
  "relative flex h-8 w-full items-center gap-2.5 rounded-[8px] px-2.5 text-left outline-none transition-colors duration-150 focus-visible:paper-focus group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0";
const ICON_SLOT =
  "flex size-4 shrink-0 items-center justify-center";
const FADE =
  "overflow-hidden whitespace-nowrap transition-[opacity,max-width] duration-150 ease-out group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0";
const LABEL = `text-[13px] leading-4 ${FADE}`;
const SECTION_FADE =
  "max-h-10 overflow-hidden transition-[opacity,max-height,padding] duration-150 ease-out group-data-[collapsible=icon]:max-h-0 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:opacity-0";

function RailTip({
  label,
  children,
}: {
  label: string;
  children: ReactElement;
}) {
  const { state, isMobile } = useSidebar();
  if (state !== "collapsed" || isMobile) return children;

  return (
    <Tooltip>
      <TooltipTrigger render={children} />
      <TooltipContent
        side="right"
        align="center"
        sideOffset={10}
        className="rounded-[6px] bg-[#0F172A] px-2 py-1 text-[11px] font-medium leading-4 text-white shadow-[0_4px_14px_rgba(15,23,42,0.24)]"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar();
  const activeProject = useUiStore((state) => state.activeProject);
  const setNav = useUiStore((state) => state.setNav);
  const setActiveProject = useUiStore((state) => state.setActiveProject);
  const openDialog = useUiStore((state) => state.openDialog);
  const toast = useUiStore((state) => state.toast);
  const tasks = useKanbanStore((state) => state.tasks);
  const teamName = useKanbanStore((state) => state.teamName);

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-[#0000000F] bg-white [&_[data-sidebar=sidebar]]:bg-white"
    >
      <SidebarHeader
        className="rail-header relative gap-0"
        style={{ padding: "16px 14px 0" }}
      >
        <div className="relative flex h-7 items-center justify-between px-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
          <div className="rail-brand flex min-w-0 items-center gap-2 transition-opacity duration-150 group-data-[collapsible=icon]:gap-0">
            <div className="flex size-6 shrink-0 items-center justify-center rounded-[6px] bg-[#FF5722]">
              <Icon
                icon={Layers01Icon}
                size={13}
                strokeWidth={2.4}
                className="text-white"
              />
            </div>
            <span
              className={cn(
                "text-[14px] font-bold leading-[18px] tracking-[-0.01em] text-[#0F172A]",
                FADE,
              )}
            >
              {teamName}
            </span>
          </div>
          <RailTip
            label={state === "collapsed" ? "Expand sidebar" : "Collapse sidebar"}
          >
            <IconButton
              label="Toggle sidebar"
              size={24}
              onClick={toggleSidebar}
              className="rail-trigger rounded-[6px] group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:inset-0 group-data-[collapsible=icon]:m-auto group-data-[collapsible=icon]:bg-white group-data-[collapsible=icon]:shadow-[0_0_0_1px_#00000014]"
            >
              <Icon icon={SidebarLeftIcon} size={14} strokeWidth={2} />
            </IconButton>
          </RailTip>
        </div>
      </SidebarHeader>

      <SidebarContent
        className="flex flex-col overflow-y-auto overflow-x-hidden"
        style={{ gap: 16, padding: "16px 14px 0" }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-[30px] w-full shrink-0 items-center justify-between rounded-[8px] bg-[#F6F5F3] px-2.5 text-left outline-none transition-colors hover:bg-[#F1EFEC] focus-visible:paper-focus group-data-[collapsible=icon]:hidden">
            <span className="flex items-center gap-2">
              <span className="size-[6px] shrink-0 rounded-full bg-[#FF5722]" />
              <span className="text-[13px] font-semibold leading-4 text-[#0F172A]">
                Sprint 24
              </span>
            </span>
            <Icon
              icon={ChevronDownIcon}
              size={12}
              strokeWidth={2}
              className="text-[#8C8A85]"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={6}
            className="w-[204px] rounded-[10px] border border-[#00000014] bg-white p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
          >
            {SPRINTS.map((sprint) => (
              <DropdownMenuItem
                key={sprint.id}
                className="h-8 cursor-pointer gap-2 rounded-[6px] px-2 text-[12px] text-[#475569] focus:bg-[#F4F4F5] focus:text-[#0F172A]"
                onClick={() => {
                  if (!sprint.current) {
                    toast(`${sprint.label} is archived`);
                    return;
                  }
                  setNav("kanban");
                }}
              >
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    sprint.current ? "bg-[#FF5722]" : "bg-[#CBD5E1]",
                  )}
                />
                {sprint.label}
                {sprint.current && (
                  <Icon
                    icon={CheckIcon}
                    size={12}
                    strokeWidth={2.4}
                    className="ml-auto text-[#FF5722]"
                  />
                )}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator className="my-1 bg-[#F1F5F9]" />
            <DropdownMenuItem
              className="h-8 cursor-pointer gap-2 rounded-[6px] px-2 text-[12px] text-[#475569] focus:bg-[#F4F4F5] focus:text-[#0F172A]"
              onClick={() => openDialog({ type: "settings" })}
            >
              <Icon icon={GearsIcon} size={13} />
              Manage sprints
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex flex-col gap-0.5">
          <div className={cn("px-2.5 pb-1 pt-1.5", SECTION_FADE)}>
            <SectionLabel>Workspace</SectionLabel>
          </div>
          <nav aria-label="Workspace" className="flex flex-col gap-0.5">
            {NAV.map((item) => {
              const active = !activeProject && !item.dummy;
              const count = tasks.length;
              return (
                <RailTip key={item.id} label={item.label}>
                  <button
                    type="button"
                    aria-current={active ? "page" : undefined}
                    aria-disabled={item.dummy ? true : undefined}
                    tabIndex={item.dummy ? -1 : undefined}
                    onClick={
                      item.dummy ? undefined : () => setNav("kanban")
                    }
                    className={cn(
                      ROW,
                      item.dummy && "cursor-default",
                      active
                        ? "bg-[#FFF7ED] text-[#FF5722]"
                        : "text-[#475569] hover:bg-[#F4F4F5] hover:text-[#0F172A]",
                    )}
                  >
                    <span className={ICON_SLOT}>
                      <Icon
                        icon={item.icon}
                        size={14}
                        strokeWidth={2}
                        className={
                          active ? "text-[#FF5722]" : "text-[#64748B]"
                        }
                      />
                    </span>
                    <span
                      className={cn(
                        LABEL,
                        active ? "font-semibold" : "font-medium",
                      )}
                    >
                      {item.label}
                    </span>
                    {!item.dummy && (
                      <span
                        className={cn(
                          "ml-auto text-[11px] leading-[14px] tabular-nums group-data-[collapsible=icon]:hidden",
                          active
                            ? "font-semibold text-[#FF5722]"
                            : "text-[#94A3B8]",
                        )}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                </RailTip>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-0.5">
          <div className={cn("px-2.5 pb-1 pt-1.5", SECTION_FADE)}>
            <SectionLabel>Projects</SectionLabel>
          </div>
          <nav aria-label="Projects" className="flex flex-col gap-0.5">
            {PROJECTS.map((project) => {
              const active = activeProject === project.id;
              return (
                <RailTip key={project.id} label={project.name}>
                  <button
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      if (active) {
                        setNav("kanban");
                        return;
                      }
                      setActiveProject(project.id);
                    }}
                    className={cn(
                      ROW,
                      active
                        ? "bg-[#FFF7ED] text-[#FF5722]"
                        : "text-[#475569] hover:bg-[#F4F4F5] hover:text-[#0F172A]",
                    )}
                  >
                    <span className={ICON_SLOT}>
                      <span
                        className={cn(
                          "size-2 rounded-full",
                          active ? "bg-[#FF5722]" : "bg-[#8C8A85]",
                        )}
                      />
                    </span>
                    <span
                      className={cn(
                        LABEL,
                        active ? "font-semibold" : "font-medium",
                      )}
                    >
                      {project.name}
                    </span>
                  </button>
                </RailTip>
              );
            })}
          </nav>
        </div>

        <div className="min-h-4 flex-1" />
      </SidebarContent>

      <SidebarFooter className="mt-auto" style={{ padding: "0 14px 16px" }}>
        <div className="flex items-center justify-between gap-2 border-t border-[#0000000F] px-2 py-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-0">
          <RailTip label={`${CURRENT_USER.fullName} · ${CURRENT_USER.role}`}>
            <button
              type="button"
              onClick={() => openDialog({ type: "settings" })}
              aria-label="Open profile and settings"
              className="flex size-6 shrink-0 items-center justify-center rounded-full outline-none focus-visible:paper-focus"
            >
              <MemberAvatar initials={CURRENT_USER.initials} size={24} />
            </button>
          </RailTip>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <div className="truncate text-[12px] font-semibold leading-4 text-[#0F172A]">
              {CURRENT_USER.fullName}
            </div>
            <div className="truncate text-[11px] leading-[14px] text-[#94A3B8]">
              {CURRENT_USER.role}
            </div>
          </div>
          <IconButton
            label="Settings"
            size={22}
            className="ml-auto rounded-[6px] group-data-[collapsible=icon]:hidden"
            onClick={() => openDialog({ type: "settings" })}
          >
            <Icon icon={GearsIcon} size={13} strokeWidth={2} />
          </IconButton>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
