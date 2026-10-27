"use client";

import { useState } from "react";
import {
  BellIcon,
  Download01Icon,
  HelpCircleIcon,
  Link01Icon,
  MoreHorizontalIcon,
  RefreshCwIcon,
  ResetPasswordIcon,
  SidebarLeftIcon,
  StarIcon,
  Upload01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon } from "@/components/dashboard/icon";
import { IconButton } from "@/components/dashboard/ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSidebar } from "@/components/ui/sidebar";
import { relativeTime } from "@/lib/dates";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";

export function Header() {
  const teamName = useKanbanStore((state) => state.teamName);
  const title = useKanbanStore((state) => state.title);
  const favorite = useKanbanStore((state) => state.favorite);
  const toggleFavorite = useKanbanStore((state) => state.toggleFavorite);
  const activity = useKanbanStore((state) => state.activity);
  const tasks = useKanbanStore((state) => state.tasks);
  const columns = useKanbanStore((state) => state.columns);
  const reset = useKanbanStore((state) => state.reset);
  const openDialog = useUiStore((state) => state.openDialog);
  const toast = useUiStore((state) => state.toast);
  const notificationsSeenAt = useUiStore((state) => state.notificationsSeenAt);
  const markNotificationsSeen = useUiStore(
    (state) => state.markNotificationsSeen,
  );
  const { toggleSidebar } = useSidebar();
  const [confirmReset, setConfirmReset] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast("Board link copied");
    } catch {
      toast("Could not copy link");
    }
  };

  const exportBoard = () => {
    const data = { title, columns, tasks };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "untld-kanban-board.json";
    anchor.click();
    URL.revokeObjectURL(url);
    toast("Board exported");
  };

  return (
    <header className="flex h-[52px] shrink-0 items-center justify-between border-b border-[#0000000F] bg-white px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <IconButton
          label="Open sidebar"
          size={28}
          onClick={toggleSidebar}
          className="-ml-1.5 shrink-0 rounded-[7px] md:hidden"
        >
          <Icon icon={SidebarLeftIcon} size={15} strokeWidth={2} />
        </IconButton>
        <span className="hidden text-[13px] font-medium leading-4 text-[#8C8A85] sm:inline">
          {teamName}
        </span>
        <span className="hidden text-[12px] leading-4 text-[#CBD5E1] sm:inline">›</span>
        <span className="truncate text-[13px] font-semibold leading-4 text-[#0F172A]">
          {title}
        </span>
        <IconButton
          label={favorite ? "Remove from favorites" : "Add to favorites"}
          size={28}
          onClick={toggleFavorite}
          active={favorite}
          className={cn(
            "ml-1 rounded-[8px] border border-[#00000014] bg-white hover:bg-[#FAFAFA]",
            favorite && "text-[#F59E0B] [&_path]:fill-[#F59E0B]",
          )}
        >
          <Icon icon={StarIcon} size={13} strokeWidth={1.8} />
        </IconButton>
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Board options"
            className="inline-flex size-[28px] shrink-0 items-center justify-center rounded-[8px] border border-[#00000014] bg-white text-[#8C8A85] outline-none transition-colors hover:bg-[#FAFAFA] hover:text-[#475569] focus-visible:paper-focus"
          >
            <Icon icon={MoreHorizontalIcon} size={13} strokeWidth={1.8} />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[210px] rounded-[10px] border border-[#00000014] p-1.5 shadow-[0_8px_24px_rgba(15,23,42,0.12)]"
          >
            <DropdownMenuItem
              className="h-8 gap-2 rounded-[6px] px-2 text-[12px] text-[#475569] focus:bg-[#F4F4F5] focus:text-[#0F172A]"
              onClick={() => openDialog({ type: "rename-board" })}
            >
              <Icon icon={ResetPasswordIcon} size={14} />
              Rename board
            </DropdownMenuItem>
            <DropdownMenuItem
              className="h-8 gap-2 rounded-[6px] px-2 text-[12px] text-[#475569] focus:bg-[#F4F4F5] focus:text-[#0F172A]"
              onClick={() => openDialog({ type: "import" })}
            >
              <Icon icon={Upload01Icon} size={14} />
              Import issues
            </DropdownMenuItem>
            <DropdownMenuItem
              className="h-8 gap-2 rounded-[6px] px-2 text-[12px] text-[#475569] focus:bg-[#F4F4F5] focus:text-[#0F172A]"
              onClick={() => openDialog({ type: "invite" })}
            >
              <Icon icon={UserAdd01Icon} size={14} />
              Invite members
            </DropdownMenuItem>
            <DropdownMenuItem
              className="h-8 gap-2 rounded-[6px] px-2 text-[12px] text-[#475569] focus:bg-[#F4F4F5] focus:text-[#0F172A]"
              onClick={exportBoard}
            >
              <Icon icon={Download01Icon} size={14} />
              Export board
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1 bg-[#F1F5F9]" />
            <DropdownMenuItem
              className="h-8 gap-2 rounded-[6px] px-2 text-[12px] text-[#475569] focus:bg-[#F4F4F5] focus:text-[#0F172A]"
              onClick={() => openDialog({ type: "help" })}
            >
              <Icon icon={HelpCircleIcon} size={14} />
              Keyboard shortcuts
            </DropdownMenuItem>
            <DropdownMenuItem
              className={cn(
                "h-8 gap-2 rounded-[6px] px-2 text-[12px] focus:bg-[#FEF2F2]",
                confirmReset ? "text-[#DC2626]" : "text-[#475569]",
              )}
              onBlur={() => setConfirmReset(false)}
              onClick={() => {
                if (!confirmReset) {
                  setConfirmReset(true);
                  return;
                }
                reset();
                setConfirmReset(false);
                toast("Board reset");
              }}
            >
              <Icon icon={RefreshCwIcon} size={14} />
              {confirmReset ? "Confirm reset" : "Reset board"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <IconButton
          label="Copy board link"
          size={32}
          onClick={copyLink}
          className="rounded-[8px] border border-[#00000014] bg-white hover:bg-[#FAFAFA]"
        >
          <Icon icon={Link01Icon} size={14} strokeWidth={1.8} />
        </IconButton>
        <Popover onOpenChange={(open) => open && markNotificationsSeen()}>
          <PopoverTrigger
            aria-label="Notifications"
            className="relative inline-flex size-8 shrink-0 items-center justify-center rounded-[8px] border border-[#00000014] bg-white text-[#64748B] outline-none transition-colors hover:bg-[#FAFAFA] focus-visible:paper-focus"
          >
            <Icon icon={BellIcon} size={14} strokeWidth={1.8} />
            {!notificationsSeenAt && (
              <span className="absolute right-[8px] top-[7px] size-1.5 rounded-full bg-[#EF4444]" />
            )}
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[360px] gap-0 overflow-hidden rounded-[12px] border border-[#00000014] p-0 shadow-[0_12px_36px_rgba(15,23,42,0.14)]"
          >
            <div className="flex items-center justify-between border-b border-[#F1F5F9] px-4 py-3">
              <div>
                <div className="text-[12px] font-semibold leading-4 text-[#0F172A]">
                  Notifications
                </div>
                <div className="text-[11px] leading-[15px] text-[#8C8A85]">
                  Activity in {title}
                </div>
              </div>
              <span className="rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-medium text-[#C2410C]">
                New
              </span>
            </div>
            <div className="flex max-h-[300px] flex-col overflow-y-auto p-1.5">
              {activity.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="flex gap-2.5 rounded-[8px] px-2.5 py-2.5 transition-colors hover:bg-[#FAFAFA]"
                >
                  <span className="mt-1.5 size-[6px] shrink-0 rounded-full bg-[#FF5722]" />
                  <div className="min-w-0">
                    <p className="text-[12px] leading-[17px] text-[#475569]">
                      {item.text}
                    </p>
                    <p className="text-[10px] leading-4 text-[#8C8A85]">
                      {relativeTime(item.at)}
                    </p>
                  </div>
                </div>
              ))}
              {activity.length === 0 && (
                <div className="px-3 py-8 text-center text-[12px] text-[#8C8A85]">
                  No activity yet
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
