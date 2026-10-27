"use client";

import { useState } from "react";
import { UserAdd01Icon } from "@hugeicons/core-free-icons";
import { cn } from "cn";

import { Icon, MemberAvatar } from "@/components/dashboard/icon";
import { useKanbanStore } from "@/stores/kanban-store";
import { useUiStore } from "@/stores/ui-store";
import {
  DialogFrame,
  GhostButton,
  PaperInput,
  PrimaryButton,
} from "./dialog-frame";

const ROLES = ["Member", "Admin", "Viewer"] as const;

export function InviteDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const addMember = useKanbanStore((state) => state.addMember);
  const members = useKanbanStore((state) => state.members);
  const teamName = useKanbanStore((state) => state.teamName);
  const toast = useUiStore((state) => state.toast);
  const [name, setName] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("Member");

  const close = () => {
    setName("");
    onOpenChange(false);
  };

  const submit = () => {
    if (!name.trim()) return;
    addMember(name);
    toast(`${name.trim()} added to ${teamName}`);
    close();
  };

  return (
    <DialogFrame
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title="Invite teammates"
      description={`Add people to ${teamName}. They can be assigned issues right away.`}
      icon={<Icon icon={UserAdd01Icon} size={17} strokeWidth={1.9} />}
      width={460}
      footer={
        <>
          <GhostButton onClick={close}>Cancel</GhostButton>
          <PrimaryButton onClick={submit} disabled={!name.trim()}>
            Send invite
          </PrimaryButton>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase leading-3 tracking-[0.06em] text-[#8C8A85]">
            Name or email
          </div>
          <PaperInput
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") submit();
            }}
            placeholder="alex@untld.studio"
            aria-label="Invitee name or email"
          />
        </div>

        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase leading-3 tracking-[0.06em] text-[#8C8A85]">
            Role
          </div>
          <div className="flex gap-1.5">
            {ROLES.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={role === item}
                onClick={() => setRole(item)}
                className={cn(
                  "h-7 rounded-[7px] border px-2.5 text-[11px] font-medium transition-colors",
                  role === item
                    ? "border-[#FF572266] bg-[#FFF7ED] text-[#C2410C]"
                    : "border-[#E2E8F0] bg-white text-[#64748B] hover:bg-[#FAFAFA] hover:text-[#0F172A]",
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-1.5 text-[10px] font-bold uppercase leading-3 tracking-[0.06em] text-[#8C8A85]">
            On this board
          </div>
          <div className="flex flex-col gap-0.5 rounded-[10px] border border-[#0000000F] bg-[#FAFAF9] p-1.5">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex h-9 items-center gap-2 rounded-[7px] px-2"
              >
                <MemberAvatar initials={member.initials} size={22} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[12px] font-medium leading-4 text-[#0F172A]">
                    {member.fullName}
                  </div>
                  <div className="truncate text-[10px] leading-[14px] text-[#8C8A85]">
                    {member.name}
                  </div>
                </div>
                <span className="text-[10px] font-medium text-[#94A3B8]">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DialogFrame>
  );
}
